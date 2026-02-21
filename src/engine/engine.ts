import { Physiology, Subject } from "src/types";
import { resolveSubject, derivePhysiology } from "../endogenous/subject/utils";
import { collectSignalMonitors, evaluateMonitors } from "./monitors";

import {
  Minute,
  Signal,
  WorkerComputeRequest,
  WorkerComputeResponse,
  SimulationState,
  DynamicsContext,
  ActiveIntervention,
  SignalDefinition,
  AuxiliaryDefinition,
  SolverDebugOptions,
} from "./types";

import { createInitialState } from "./state";

// =============================================================================
// PD UNIT CONVERSION
// =============================================================================

const MASS_CONVERSIONS: Record<string, number> = {
  "mg/L": 1,
  "mg/dL": 0.1,
  "µg/dL": 100,
  "ng/mL": 1e3,
  "pg/mL": 1e6,
  "ng/dL": 1e5,
};

const MOLAR_CONVERSIONS: Record<string, number> = {
  nM: 1e6,
  uM: 1e3,
  µM: 1e3,
  "pmol/L": 1e9,
  "µmol/L": 1e3,
};

/**
 * Convert drug concentration from mg/L to the PD entry's unit.
 * Mass-based units use direct scaling; molar units require molarMass (g/mol).
 * Throws for unrecognized units so silent zero-effect bugs are impossible.
 */
export function convertConcentration(
  conc_mgL: number,
  molarMass: number | undefined,
  unit: string,
): number {
  const massFactor = MASS_CONVERSIONS[unit];
  if (massFactor !== undefined) return conc_mgL * massFactor;

  const molarFactor = MOLAR_CONVERSIONS[unit];
  if (molarFactor !== undefined) {
    if (!molarMass || molarMass <= 0)
      throw new Error(
        `PD unit "${unit}" requires molarMass but molecule has molarMass=${molarMass}`,
      );
    return (conc_mgL / molarMass) * molarFactor;
  }

  throw new Error(
    `Unsupported PD unit "${unit}". ` +
      `Supported: ${[...Object.keys(MASS_CONVERSIONS), ...Object.keys(MOLAR_CONVERSIONS)].join(", ")}. ` +
      `EC50 must be in a concentration unit.`,
  );
}

// =============================================================================
// TYPES & RESOLVERS
// =============================================================================

export interface ReceptorSignal {
  signal: Signal;
  sign: number;
}

export interface SystemResolver {
  isReceptor: (target: string) => boolean;
  getReceptorSignals: (target: string) => ReceptorSignal[];
}

// =============================================================================
// VECTOR LAYOUT & CONVERSION
// =============================================================================

export interface VectorLayout {
  size: number;
  signals: Map<Signal, number>;
  auxiliary: Map<string, number>;
  receptors: Map<string, number>;
  keys: string[];
}

export function createVectorLayout(
  signals: readonly Signal[],
  auxKeys: string[],
  receptorKeys: string[],
): VectorLayout {
  const layout: VectorLayout = {
    size: 0,
    signals: new Map(),
    auxiliary: new Map(),
    receptors: new Map(),
    keys: [],
  };
  for (const s of signals) {
    layout.signals.set(s, layout.size);
    layout.keys[layout.size] = s;
    layout.size++;
  }
  for (const k of auxKeys) {
    layout.auxiliary.set(k, layout.size);
    layout.keys[layout.size] = k;
    layout.size++;
  }
  for (const k of receptorKeys) {
    layout.receptors.set(k, layout.size);
    layout.keys[layout.size] = k;
    layout.size++;
  }
  return layout;
}

export function stateToVector(
  state: SimulationState,
  layout: VectorLayout,
): Float64Array {
  const vector = new Float64Array(layout.size);
  layout.signals.forEach((idx, s) => (vector[idx] = state.signals[s] ?? 0));
  layout.auxiliary.forEach((idx, k) => (vector[idx] = state.auxiliary[k] ?? 0));
  layout.receptors.forEach((idx, k) => (vector[idx] = state.receptors[k] ?? 0));
  return vector;
}

export function vectorToState(
  vector: Float64Array,
  layout: VectorLayout,
): SimulationState {
  const state: SimulationState = {
    signals: {},
    auxiliary: {},
    receptors: {},
    pk: {},
    accumulators: {},
  };
  layout.signals.forEach((idx, s) => (state.signals[s] = vector[idx]));
  layout.auxiliary.forEach((idx, k) => (state.auxiliary[k] = vector[idx]));
  layout.receptors.forEach((idx, k) => (state.receptors[k] = vector[idx]));
  return state as SimulationState;
}

// =============================================================================
// PRE-RESOLVED DEFINITIONS (avoids per-step lookups)
// =============================================================================

export interface PreResolvedDefinition {
  index: number;
  tau: number;
  setpoint: (ctx: DynamicsContext, state: SimulationState) => number;
  production: Array<{
    coefficient: number;
    sourceIndex: number;
    transform?: (
      v: number,
      state: SimulationState,
      ctx: DynamicsContext,
    ) => number;
  }>;
  clearance: Array<{
    rate: number;
    type: string;
    enzymeIndex: number;
    enzymeName: string | null; // Name of enzyme/transporter for clearance modifier lookup
    Km?: number;
    transform?: (
      v: number,
      state: SimulationState,
      ctx: DynamicsContext,
    ) => number;
  }>;
  couplings: Array<{
    sourceIndex: number;
    receptorIndex: number;
    normalizedStrength: number;
    isStimulate: boolean;
  }>;
  min: number;
  max: number;
}

function resolveDefinitions(
  signals: readonly Signal[],
  definitions: any,
  auxDefinitions: any,
  layout: VectorLayout,
): { resSignals: PreResolvedDefinition[]; resAux: PreResolvedDefinition[] } {
  const resSignals: PreResolvedDefinition[] = signals
    .map((s) => {
      const def = definitions[s];
      if (!def) return { index: -1 } as any;
      return {
        index: layout.signals.get(s)!,
        tau: def.dynamics.tau,
        setpoint: def.dynamics.setpoint,
        min: def.min ?? 0,
        max: def.max ?? Infinity,
        production: (def.dynamics.production ?? []).map((p: any) => ({
          coefficient: p.coefficient,
          sourceIndex:
            p.source === "constant" || p.source === "circadian"
              ? -1
              : (layout.signals.get(p.source as Signal) ?? -1),
          transform: p.transform,
        })),
        clearance: (def.dynamics.clearance ?? []).map((c: any) => ({
          rate: c.rate,
          type: c.type,
          enzymeIndex: c.enzyme ? (layout.auxiliary.get(c.enzyme) ?? -1) : -1,
          enzymeName: c.enzyme ?? null,
          Km: c.Km,
          transform: c.transform,
        })),
        couplings: (def.dynamics.couplings ?? []).map((c: any) => ({
          sourceIndex: layout.signals.get(c.source) ?? -1,
          receptorIndex: layout.receptors.get(`${c.source}_sensitivity`) ?? -1,
          normalizedStrength: c.strength / def.dynamics.tau,
          isStimulate: c.effect === "stimulate",
        })),
      };
    })
    .filter((s) => s.index !== -1);

  const resAux: PreResolvedDefinition[] = Object.keys(auxDefinitions).map(
    (k) => {
      const def = auxDefinitions[k];
      return {
        index: layout.auxiliary.get(k)!,
        tau: def.dynamics.tau,
        setpoint: def.dynamics.setpoint,
        min: def.min ?? 0,
        max: def.max ?? 2.0,
        production: (def.dynamics.production ?? []).map((p: any) => ({
          coefficient: p.coefficient,
          sourceIndex:
            p.source === "constant" || p.source === "circadian"
              ? -1
              : (layout.signals.get(p.source as Signal) ?? -1),
          transform: p.transform,
        })),
        clearance: (def.dynamics.clearance ?? []).map((c: any) => ({
          rate: c.rate,
          type: c.type,
          enzymeIndex: c.enzyme ? (layout.auxiliary.get(c.enzyme) ?? -1) : -1,
          enzymeName: c.enzyme ?? null,
          Km: c.Km,
          transform: c.transform,
        })),
        couplings: [],
      };
    },
  );

  return { resSignals, resAux };
}

// =============================================================================
// ANALYTICAL PK (Bateman equations - closed-form solutions)
// =============================================================================

interface PKAgent {
  id: string;
  startTime: number;
  duration: number;
  intensity: number;
  massMg: number;
  F: number;
  ka: number;
  ke: number;
  vd: number;
  model: string;
  delivery: string;
  Vmax?: number;
  Km?: number;
}

function extractPKAgents(
  interventions: ActiveIntervention[],
  ctx: DynamicsContext,
  currentState?: SimulationState,
): PKAgent[] {
  const agents: PKAgent[] = [];

  for (const iv of interventions) {
    if (!iv.pharmacology?.pk) continue;
    const pk = iv.pharmacology.pk;

    const massMg = pk.massMg;
    const F = pk.bioavailability ?? 1.0;
    let ke = pk.eliminationRate ?? 0.693 / (pk.halfLifeMin ?? 60);
    const ka = pk.absorptionRate ?? ke * 4;

    // Calculate Vd with defensive defaults
    let vd = 50;
    const vol = pk.volume;
    if (vol) {
      const weight = ctx.subject?.weight ?? 70;
      const tbw = ctx.physiology?.tbw ?? weight * 0.6;
      const lbm = ctx.physiology?.leanBodyMass ?? weight * 0.8;
      switch (vol.kind) {
        case "tbw":
          vd = tbw * (vol.fraction ?? 0.6);
          break;
        case "lbm":
          vd = lbm * (vol.base_L_kg ?? 1.0);
          break;
        case "weight":
          vd = weight * (vol.base_L_kg ?? 0.7);
          break;
        case "sex-adjusted":
          vd =
            weight *
            ((ctx.subject?.sex ?? "male") === "male"
              ? vol.male_L_kg
              : vol.female_L_kg);
          break;
      }
    }

    // Adjust clearance based on organ function from bloodwork (prefer live signals)
    if (pk.clearance?.renal) {
      const subjectGFR =
        currentState?.signals?.egfr ??
        ctx.subject.bloodwork?.metabolic?.eGFR_mL_min ??
        ctx.physiology?.estimatedGFR ??
        100;
      const renalRatio = subjectGFR / 100;
      ke *= renalRatio;
    }

    if (pk.clearance?.hepatic) {
      const altVal =
        currentState?.signals?.alt ??
        ctx.subject.bloodwork?.metabolic?.alt_U_L ??
        25;
      // Elevated ALT suggests impaired hepatic metabolism → slower clearance
      // Normal ALT ≤40: no adjustment. Above 40: progressively reduced, floor at 30%
      const hepaticRatio =
        altVal <= 40 ? 1.0 : Math.max(0.3, 1 - (altVal - 40) / 120);
      ke *= hepaticRatio;

      // 3A: Age → hepatic metabolism decline
      const age = ctx.subject?.age ?? 30;
      const ageFactor =
        age <= 40 ? 1.0 : Math.max(0.6, 1 - (age - 40) * 0.01);
      ke *= ageFactor;

      // 3B: Inflammation → hepatic clearance reduction
      const hsCRP =
        ctx.subject.bloodwork?.inflammation?.hsCRP_mg_L ?? 1.0;
      if (hsCRP > 3) {
        const inflammationRatio = Math.max(0.5, 1 - (hsCRP - 3) / 20);
        ke *= inflammationRatio;
      }

      // 3C: Sex hormone → CYP enzyme modulation (static initial)
      const estrogen =
        ctx.subject.bloodwork?.hormones?.estradiol_pg_mL ?? 40;
      const cypFactor =
        1.0 + Math.min(0.2, Math.max(-0.1, (estrogen - 40) / 2000));
      ke *= cypFactor;

      // 3D: liverBloodFlow for hepatic clearance
      const liverFlow = ctx.physiology?.liverBloodFlow ?? 1.5;
      ke *= liverFlow / 1.5;
    }

    // 3E: metabolicCapacity for non-organ-specific drugs
    if (!pk.clearance?.renal && !pk.clearance?.hepatic) {
      ke *= ctx.physiology?.metabolicCapacity ?? 1.0;
    }

    // 3F: drugClearance (TBW-based) as global scaling
    ke *= ctx.physiology?.drugClearance ?? 1.0;

    // Adjust Vd for low albumin (highly protein-bound drugs)
    // Low albumin → higher free fraction → larger effective Vd
    const subjectAlbumin =
      ctx.subject.bloodwork?.metabolic?.albumin_g_dL ?? 4.0;
    if (subjectAlbumin < 3.5) {
      const albuminRatio = 4.0 / Math.max(subjectAlbumin, 1.0);
      vd *= albuminRatio;
    }

    agents.push({
      id: iv.id,
      startTime: iv.startTime,
      duration: iv.duration,
      intensity: iv.intensity ?? 1.0,
      massMg,
      F,
      ka,
      ke,
      vd,
      model: pk.model ?? "1-compartment",
      delivery: pk.delivery || (massMg ? "bolus" : "continuous"),
      Vmax: pk.Vmax,
      Km: pk.Km,
    });
  }

  return agents;
}

function computeAnalyticalConcentration(
  agents: PKAgent[],
  id: string,
  t: number,
): number {
  let sum = 0;

  for (const a of agents) {
    if (a.id !== id) continue;

    const dt = t - a.startTime;
    if (dt < 0) continue;

    if (a.model === "activity-dependent" || a.delivery === "continuous") {
      // Activity-dependent: exponential approach to target
      const tau = 5;
      if (dt <= a.duration) {
        sum += a.intensity * (1 - Math.exp(-dt / tau));
      } else {
        sum +=
          a.intensity *
          (1 - Math.exp(-a.duration / tau)) *
          Math.exp(-(dt - a.duration) / tau);
      }
    } else if (a.model === "michaelis-menten") {
      // Quasi-analytical approximation for MM kinetics
      const { massMg, F, vd, duration, Vmax = 0.2, Km = 10 } = a;
      const kin = (massMg * F * a.intensity) / Math.max(1, duration);

      const t_active = Math.min(dt, duration);
      const t_decay = Math.max(0, dt - duration);

      // During infusion: assume approach to steady state C_ss where kin/vd = Vmax*C/(Km+C)
      // Conversion: kin/vd is mg/L/min. Vmax is mg/dL/min.
      // 1 mg/L = 0.1 mg/dL.
      const input_mgdL = (kin / vd) * 0.1;
      let C_peak_mgdL = 0;

      if (input_mgdL >= Vmax) {
        // Zero-order accumulation
        C_peak_mgdL = (input_mgdL - Vmax) * t_active;
      } else {
        const C_ss = (Km * input_mgdL) / (Vmax - input_mgdL + 0.00001);
        const effective_tau = Km / Vmax;
        C_peak_mgdL = C_ss * (1 - Math.exp(-t_active / effective_tau));
      }

      let C_final_mgdL = 0;
      if (t_decay <= 0) {
        C_final_mgdL = C_peak_mgdL;
      } else {
        // Post-infusion decay
        if (C_peak_mgdL > Km) {
          const t_linear = (C_peak_mgdL - Km) / Vmax;
          if (t_decay <= t_linear) {
            C_final_mgdL = C_peak_mgdL - Vmax * t_decay;
          } else {
            C_final_mgdL = Km * Math.exp(-(t_decay - t_linear) / (Km / Vmax));
          }
        } else {
          C_final_mgdL = C_peak_mgdL * Math.exp(-t_decay / (Km / Vmax));
        }
      }

      if (isNaN(C_final_mgdL) || C_final_mgdL < 0) {
        console.error(
          `MM Bad Value: ${C_final_mgdL}, peak=${C_peak_mgdL}, dt=${dt}, dur=${duration}, mass=${massMg}`,
        );
      }

      // Convert mg/dL back to mg/L for the central compartment
      sum += C_final_mgdL * 10;
    } else if (a.delivery === "bolus") {
      // Bateman equation for bolus
      const massMg = a.massMg * a.F * a.intensity;
      const eps = 0.0001;
      const denom = Math.abs(a.ka - a.ke) < eps ? eps : a.ka - a.ke;
      sum += Math.max(
        0,
        (massMg / a.vd) *
          (a.ka / denom) *
          (Math.exp(-a.ke * dt) - Math.exp(-a.ka * dt)),
      );
    } else {
      // Infusion: zero-order input with first-order absorption/elimination
      const kin = (a.massMg * a.F * a.intensity) / a.duration;
      const { ka, ke, vd } = a;
      const D = a.duration;
      const eps = 0.0001;
      const denom = Math.abs(ke - ka) < eps ? eps : ke - ka;

      if (dt <= D) {
        sum +=
          (kin / vd) *
          ((1 - Math.exp(-ke * dt)) / ke -
            (Math.exp(-ka * dt) - Math.exp(-ke * dt)) / denom);
      } else {
        const G_peak = (kin / ka) * (1 - Math.exp(-ka * D));
        const C_peak =
          (kin / vd) *
          ((1 - Math.exp(-ke * D)) / ke -
            (Math.exp(-ka * D) - Math.exp(-ke * D)) / denom);
        const dt_post = dt - D;
        sum +=
          C_peak * Math.exp(-ke * dt_post) +
          ((ka * G_peak) / (vd * denom)) *
            (Math.exp(-ka * dt_post) - Math.exp(-ke * dt_post));
      }
    }
  }

  return sum;
}

// =============================================================================
// VECTORIZED RK4 SOLVER (pre-allocated workspaces)
// =============================================================================

const k1_ws = new Float64Array(1000);
const k2_ws = new Float64Array(1000);
const k3_ws = new Float64Array(1000);
const k4_ws = new Float64Array(1000);
const tmp_ws = new Float64Array(1000);

// Cached state proxy for transform functions (avoids per-call allocation)
let cachedVector: Float64Array | null = null;
let cachedLayout: VectorLayout | null = null;
let cachedPkConc: Map<string, number> = new Map();
let cachedStateProxy: SimulationState | null = null;

function getStateProxy(
  vector: Float64Array,
  layout: VectorLayout,
  pkConcentrations: Map<string, number>,
): SimulationState {
  if (cachedStateProxy && cachedLayout === layout) {
    cachedVector = vector;
    cachedPkConc = pkConcentrations;
    return cachedStateProxy;
  }

  cachedVector = vector;
  cachedLayout = layout;
  cachedPkConc = pkConcentrations;
  cachedStateProxy = {
    signals: new Proxy(
      {},
      {
        get: (_, p) =>
          cachedVector![cachedLayout!.signals.get(p as Signal)!] ?? 0,
      },
    ),
    auxiliary: new Proxy(
      {},
      {
        get: (_, p) =>
          cachedVector![cachedLayout!.auxiliary.get(p as string)!] ?? 0,
      },
    ),
    receptors: new Proxy(
      {},
      {
        get: (_, p) =>
          cachedVector![cachedLayout!.receptors.get(p as string)!] ?? 0,
      },
    ),
    pk: new Proxy({}, { get: (_, p) => cachedPkConc.get(p as string) ?? 0 }),
    accumulators: {},
  } as SimulationState;
  return cachedStateProxy;
}

function getSignalTargets(
  target: string,
  layout: VectorLayout,
  resolver: SystemResolver,
): Array<{ index: number; sign: number }> {
  const targets: Array<{ index: number; sign: number }> = [];
  if (resolver.isReceptor(target)) {
    resolver.getReceptorSignals(target).forEach((ts) => {
      const idx = layout.signals.get(ts.signal);
      if (idx !== undefined) targets.push({ index: idx, sign: ts.sign });
    });
  }
  const directIdx = layout.signals.get(target as Signal);
  if (directIdx !== undefined) targets.push({ index: directIdx, sign: 1 });
  return targets;
}

export function computeDerivativesVector(
  state: Float64Array,
  t: number,
  ctx: DynamicsContext,
  interventions: ActiveIntervention[],
  derivs: Float64Array,
  layout: VectorLayout,
  resolvedSignals: PreResolvedDefinition[],
  resolvedAux: PreResolvedDefinition[],
  signals: readonly Signal[],
  resolver: SystemResolver,
  options?: SolverDebugOptions & { pkAgents?: PKAgent[] },
  conditionAdjustments?: any,
) {
  derivs.fill(0);
  const debug = options || {};
  const pkAgents = options?.pkAgents || [];
  const clearanceModifiers = (options as any)?.clearanceModifiers || {};

  // Build PK concentration map for this time point
  const pkConcentrations = new Map<string, number>();
  const pkBuffers = options?.pkBuffers;

  for (const iv of interventions) {
    if (iv.pharmacology?.pk) {
      if (pkBuffers?.has(iv.id)) {
        // Use pre-computed buffer if available
        const buffer = pkBuffers.get(iv.id)!;
        const pkMinT = options?.pkMinT ?? -1440;
        const floatIdx = t - pkMinT;
        const idx0 = Math.floor(floatIdx);
        if (idx0 < 0) pkConcentrations.set(`${iv.id}_central`, buffer[0] ?? 0);
        else if (idx0 >= buffer.length - 1)
          pkConcentrations.set(
            `${iv.id}_central`,
            buffer[buffer.length - 1] ?? 0,
          );
        else {
          const val =
            buffer[idx0] +
            (buffer[idx0 + 1] - buffer[idx0]) * (floatIdx - idx0);
          pkConcentrations.set(`${iv.id}_central`, val);
        }
      } else {
        pkConcentrations.set(
          `${iv.id}_central`,
          computeAnalyticalConcentration(pkAgents, iv.id, t),
        );
      }
    }
  }

  const stateProxy = getStateProxy(state, layout, pkConcentrations);

  // 1. Signal derivatives
  for (let i = 0; i < resolvedSignals.length; i++) {
    const rd = resolvedSignals[i];
    const val = state[rd.index];
    const signalKey = signals[i];

    let setpoint = 0;
    if (debug.enableBaselines !== false) {
      setpoint = rd.setpoint(ctx, stateProxy);
      if (
        debug.enableConditions !== false &&
        conditionAdjustments?.baselines?.[signalKey]?.amplitude
      ) {
        setpoint += conditionAdjustments.baselines[signalKey].amplitude;
      }
    }

    let dS = (setpoint - val) / rd.tau;

    // Production terms
    if (debug.enableBaselines !== false) {
      for (const p of rd.production) {
        const srcVal = p.sourceIndex === -1 ? 1.0 : state[p.sourceIndex];
        dS +=
          p.coefficient *
          (p.transform ? p.transform(srcVal, stateProxy, ctx) : srcVal);
      }
    }

    // Clearance terms
    for (const c of rd.clearance) {
      let rate = c.rate;
      if (c.type === "saturable") rate /= c.Km! + val;
      else if (c.type === "enzyme-dependent") {
        const enzymeVal = c.enzymeIndex !== -1 ? state[c.enzymeIndex] : 1.0;
        // Apply clearance modifier from conditions (enzyme/transporter activity changes)
        const modifier = c.enzymeName
          ? (clearanceModifiers[c.enzymeName] ?? 0)
          : 0;
        const effectiveEnzyme = enzymeVal * (1 + modifier);
        rate *= debug.enableEnzymes !== false ? effectiveEnzyme : 1.0;
      }
      if (c.transform) rate *= c.transform(val, stateProxy, ctx);
      dS -= rate * val;
    }

    // Couplings
    if (debug.enableCouplings !== false) {
      for (const cp of rd.couplings) {
        if (cp.sourceIndex === -1) continue;
        const srcVal = state[cp.sourceIndex];
        const sensitivity =
          debug.enableReceptors !== false && cp.receptorIndex !== -1
            ? state[cp.receptorIndex]
            : 1.0;
        dS +=
          cp.normalizedStrength *
          srcVal *
          sensitivity *
          (cp.isStimulate ? 1 : -1);
      }
    }

    // PD effects from interventions
    if (debug.enableInterventions !== false) {
      for (const iv of interventions) {
        // Rate-based interventions (direct effect)
        if ((iv as any).target === signalKey && (iv as any).type === "rate") {
          const isActive = t >= iv.startTime && t <= iv.startTime + iv.duration;
          if (isActive) dS += (iv as any).magnitude ?? 0;
        }

        // Pharmacological PD effects
        if (iv.pharmacology?.pd) {
          const conc = pkConcentrations.get(`${iv.id}_central`) ?? 0;
          if (conc > 0) {
            for (const eff of iv.pharmacology.pd) {
              const targets = getSignalTargets(eff.target, layout, resolver);
              for (const tgt of targets) {
                if (tgt.index === rd.index) {
                  const dIdx = layout.receptors.get(`${eff.target}_density`);
                  const density =
                    debug.enableReceptors !== false && dIdx !== undefined
                      ? state[dIdx]
                      : 1.0;

                  let response: number;
                  const isActivityDependent =
                    iv.pharmacology?.pk?.model === "activity-dependent" ||
                    iv.pharmacology?.pk?.delivery === "continuous";

                  // Convert concentration units if needed
                  let effectiveConc = conc;
                  if (!isActivityDependent && eff.unit) {
                    effectiveConc = convertConcentration(
                      conc,
                      iv.pharmacology?.molecule?.molarMass,
                      eff.unit,
                    );
                  }

                  if (isActivityDependent) {
                    // Activity-dependent: concentration is 0-1 (intensity)
                    response =
                      (conc * (eff.intrinsicEfficacy ?? 10) * density) / rd.tau;
                  } else if (eff.mechanism === "linear") {
                    // Linear mechanism: response is directly proportional to concentration
                    // Note: EC50 here acts as a scaling factor: intake = (conc / EC50) * efficacy
                    response =
                      ((effectiveConc / (eff.EC50 ?? 100)) *
                        (eff.intrinsicEfficacy ?? 1.0) *
                        density) /
                      rd.tau;
                  } else {
                    // Drug-based: use Hill function with Ki or EC50
                    const EC50 = eff.EC50 ?? eff.Ki ?? 100;
                    const occupancy = effectiveConc / (effectiveConc + EC50);
                    const efficacy = eff.tau ?? 10;
                    response =
                      (((occupancy * efficacy) /
                        (occupancy * efficacy + occupancy + 1)) *
                        (eff.intrinsicEfficacy ?? 50) *
                        density) /
                      rd.tau;
                  }

                  if (
                    eff.mechanism === "agonist" ||
                    eff.mechanism === "PAM" ||
                    eff.mechanism === "linear"
                  ) {
                    dS += response * tgt.sign;
                  } else if (eff.mechanism === "antagonist") {
                    // Antagonist logic:
                    // 1. Blocking an EXCITATORY target (sign > 0) -> Reduces signal.
                    //    Scale by current value to prevent going below zero.
                    // 2. Blocking an INHIBITORY target (sign < 0) -> Increases signal (Disinhibition).
                    //    Add directly (like an agonist) since we are releasing the brake.
                    if (tgt.sign > 0) {
                      dS -= response * tgt.sign * (val / (val + 20));
                    } else {
                      dS -= response * tgt.sign;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    derivs[rd.index] = dS;
  }

  // 2. Auxiliary derivatives
  for (let i = 0; i < resolvedAux.length; i++) {
    const rd = resolvedAux[i];
    const val = state[rd.index];
    let dA = 0;

    if (debug.enableHomeostasis !== false) {
      dA = (rd.setpoint(ctx, stateProxy) - val) / rd.tau;
      for (const p of rd.production) {
        const srcVal = p.sourceIndex === -1 ? 1.0 : state[p.sourceIndex];
        dA +=
          p.coefficient *
          (p.transform ? p.transform(srcVal, stateProxy, ctx) : srcVal);
      }
      for (const c of rd.clearance) {
        let rate = c.rate;
        if (c.type === "saturable") rate /= c.Km! + val;
        else if (c.type === "enzyme-dependent") {
          const enzymeVal = c.enzymeIndex !== -1 ? state[c.enzymeIndex] : 1.0;
          // Apply clearance modifier from conditions (enzyme/transporter activity changes)
          const modifier = c.enzymeName
            ? (clearanceModifiers[c.enzymeName] ?? 0)
            : 0;
          const effectiveEnzyme = enzymeVal * (1 + modifier);
          rate *= debug.enableEnzymes !== false ? effectiveEnzyme : 1.0;
        }
        if (c.transform) rate *= c.transform(val, stateProxy, ctx);
        dA -= rate * val;
      }
    }

    // PD effects on auxiliary (e.g., DAT inhibition)
    if (debug.enableInterventions !== false) {
      for (const iv of interventions) {
        if (iv.pharmacology?.pd) {
          const conc = pkConcentrations.get(`${iv.id}_central`) ?? 0;
          if (conc > 0) {
            const molarMass = iv.pharmacology?.molecule?.molarMass;
            const isActivityDep =
              iv.pharmacology?.pk?.model === "activity-dependent" ||
              iv.pharmacology?.pk?.delivery === "continuous";
            for (const eff of iv.pharmacology.pd) {
              const auxKey = layout.keys[rd.index];
              if (eff.target === auxKey) {
                let effectiveConc = conc;
                if (!isActivityDep && eff.unit) {
                  effectiveConc = convertConcentration(
                    conc,
                    molarMass,
                    eff.unit,
                  );
                }
                const EC50 = eff.EC50 ?? eff.Ki ?? 100;
                const occupancy = effectiveConc / (effectiveConc + EC50);
                const efficacy = eff.tau ?? 10;
                const response =
                  (((occupancy * efficacy) /
                    (occupancy * efficacy + occupancy + 1)) *
                    (eff.intrinsicEfficacy ?? 1.0)) /
                  rd.tau;
                if (eff.mechanism === "agonist" || eff.mechanism === "PAM")
                  dA += response;
                else if (
                  eff.mechanism === "antagonist" ||
                  eff.mechanism === "NAM"
                )
                  dA -= response * (val / (val + 0.1));
              }
            }
          }
        }
      }
    }

    derivs[rd.index] = dA;
  }

  // 3. Receptor adaptation
  if (debug.enableReceptors !== false) {
    layout.receptors.forEach((idx, k) => {
      if (k.endsWith("_density")) {
        const base = k.replace("_density", "");
        let totalOccupancy = 0;
        for (const iv of interventions) {
          if (iv.pharmacology?.pd) {
            const conc = pkConcentrations.get(`${iv.id}_central`) ?? 0;
            const molarMass = iv.pharmacology?.molecule?.molarMass;
            const isActivityDep =
              iv.pharmacology?.pk?.model === "activity-dependent" ||
              iv.pharmacology?.pk?.delivery === "continuous";
            for (const eff of iv.pharmacology.pd) {
              if (eff.target === base) {
                const EC50 = eff.EC50 ?? eff.Ki ?? 100;
                const effectiveConc =
                  !isActivityDep && eff.unit
                    ? convertConcentration(conc, molarMass, eff.unit)
                    : conc;
                totalOccupancy += effectiveConc / (effectiveConc + EC50);
              }
            }
          }
        }
        const tau = 60;
        derivs[idx] = (1 - totalOccupancy - state[idx]) / tau;
      } else if (k.endsWith("_sensitivity")) {
        derivs[idx] = (1 - state[idx]) / 120;
      }
    });
  }
}

export function integrateStepVector(
  state: Float64Array,
  t: number,
  dt: number,
  ctx: DynamicsContext,
  interventions: ActiveIntervention[],
  layout: VectorLayout,
  resSignals: PreResolvedDefinition[],
  resAux: PreResolvedDefinition[],
  signals: readonly Signal[],
  resolver: SystemResolver,
  options?: any,
  conditionAdjustments?: any,
) {
  if (dt === 0) return;

  const pkAgents = extractPKAgents(interventions, ctx);
  const opts = { ...options, pkAgents };

  // RK4 integration
  computeDerivativesVector(
    state,
    t,
    ctx,
    interventions,
    k1_ws,
    layout,
    resSignals,
    resAux,
    signals,
    resolver,
    opts,
    conditionAdjustments,
  );
  for (let i = 0; i < layout.size; i++)
    tmp_ws[i] = state[i] + k1_ws[i] * (dt / 2);
  computeDerivativesVector(
    tmp_ws,
    t + dt / 2,
    ctx,
    interventions,
    k2_ws,
    layout,
    resSignals,
    resAux,
    signals,
    resolver,
    opts,
    conditionAdjustments,
  );
  for (let i = 0; i < layout.size; i++)
    tmp_ws[i] = state[i] + k2_ws[i] * (dt / 2);
  computeDerivativesVector(
    tmp_ws,
    t + dt / 2,
    ctx,
    interventions,
    k3_ws,
    layout,
    resSignals,
    resAux,
    signals,
    resolver,
    opts,
    conditionAdjustments,
  );
  for (let i = 0; i < layout.size; i++) tmp_ws[i] = state[i] + k3_ws[i] * dt;
  computeDerivativesVector(
    tmp_ws,
    t + dt,
    ctx,
    interventions,
    k4_ws,
    layout,
    resSignals,
    resAux,
    signals,
    resolver,
    opts,
    conditionAdjustments,
  );
  for (let i = 0; i < layout.size; i++)
    state[i] += (dt / 6) * (k1_ws[i] + 2 * k2_ws[i] + 2 * k3_ws[i] + k4_ws[i]);

  // Clamp values
  resSignals.forEach(
    (rs) =>
      (state[rs.index] = Math.max(rs.min, Math.min(rs.max, state[rs.index]))),
  );
  resAux.forEach(
    (ra) =>
      (state[ra.index] = Math.max(ra.min, Math.min(ra.max, state[ra.index]))),
  );
}

// =============================================================================
// PUBLIC API - Used by both production and tests
// =============================================================================

/**
 * Integrate one time step. Used by tests - same code path as production.
 */
export function integrateStep(
  state: SimulationState,
  t: number,
  dt: number,
  ctx: DynamicsContext,
  signals: readonly Signal[],
  definitions: any,
  auxDefinitions: any = {},
  resolver: SystemResolver,
  interventions: ActiveIntervention[] = [],
  options?: { debug?: any },
): SimulationState {
  // Create layout and resolve definitions
  const layout = createVectorLayout(
    signals,
    Object.keys(auxDefinitions),
    Object.keys(state.receptors || {}),
  );
  const { resSignals, resAux } = resolveDefinitions(
    signals,
    definitions,
    auxDefinitions,
    layout,
  );

  // Convert to vector
  const vector = stateToVector(state, layout);

  // Substep to ensure we don't skip over intervention windows
  const subSteps = Math.max(1, Math.ceil(dt));
  const subDt = dt / subSteps;
  const debug = options?.debug;
  const conditionAdjustments = (options as any)?.conditionAdjustments;
  const clearanceModifiers = (options as any)?.clearanceModifiers;

  for (let s = 0; s < subSteps; s++) {
    const subT = t + s * subDt;
    integrateStepVector(
      vector,
      subT,
      subDt,
      ctx,
      interventions,
      layout,
      resSignals,
      resAux,
      signals,
      resolver,
      { debug, clearanceModifiers },
      conditionAdjustments,
    );
  }

  // Convert back to object state, preserving PK
  const result = vectorToState(vector, layout);

  // Compute final PK concentrations (use live signal state for organ function feedback)
  const pkAgents = extractPKAgents(interventions, ctx, result);
  result.pk = { ...state.pk };
  for (const iv of interventions) {
    if (iv.pharmacology?.pk) {
      result.pk[`${iv.id}_central`] = computeAnalyticalConcentration(
        pkAgents,
        iv.id,
        t + dt,
      );
      result.pk[`${iv.id}_gut`] = 0; // Analytical model doesn't track gut separately
    }
  }

  return result;
}

/**
 * Compute derivatives at a point. Used by tests - same code path as production.
 */
export function computeDerivatives(
  state: SimulationState,
  t: number,
  ctx: DynamicsContext,
  signals: readonly Signal[],
  definitions: any,
  auxDefinitions: any = {},
  resolver: SystemResolver,
  interventions: ActiveIntervention[] = [],
  options?: { debug?: any },
): SimulationState {
  const layout = createVectorLayout(
    signals,
    Object.keys(auxDefinitions),
    Object.keys(state.receptors || {}),
  );
  const { resSignals, resAux } = resolveDefinitions(
    signals,
    definitions,
    auxDefinitions,
    layout,
  );
  const vector = stateToVector(state, layout);
  const derivs = new Float64Array(layout.size);
  const pkAgents = extractPKAgents(interventions, ctx, state);
  const debug = options?.debug;
  const clearanceModifiers = (options as any)?.clearanceModifiers;

  computeDerivativesVector(
    vector,
    t,
    ctx,
    interventions,
    derivs,
    layout,
    resSignals,
    resAux,
    signals,
    resolver,
    { ...debug, pkAgents, clearanceModifiers },
  );

  const result = vectorToState(derivs, layout);

  // Compute PK derivatives (for activity-dependent models)
  result.pk = {};
  for (const iv of interventions) {
    if (iv.pharmacology?.pk) {
      const pk = iv.pharmacology.pk;
      const centralKey = `${iv.id}_central`;
      const currentConc = computeAnalyticalConcentration(pkAgents, iv.id, t);

      if (pk.model === "activity-dependent" || pk.delivery === "continuous") {
        const isActive = t >= iv.startTime && t <= iv.startTime + iv.duration;
        const targetConc = isActive ? iv.intensity : 0;
        result.pk[centralKey] = (targetConc - currentConc) / 5;
      } else {
        // For analytical PK, derivative is implicit in the concentration curve
        const nextConc = computeAnalyticalConcentration(
          pkAgents,
          iv.id,
          t + 0.001,
        );
        result.pk[centralKey] = (nextConc - currentConc) / 0.001;
      }
    }
  }

  return result;
}

// =============================================================================
// PRODUCTION WORKER ENTRY POINT
// =============================================================================

export interface SystemDefinitions {
  signals: readonly Signal[];
  signalDefinitions: Partial<Record<string, SignalDefinition>>;
  auxDefinitions: Record<string, AuxiliaryDefinition>;
  resolver: SystemResolver;
  receptorKeys: string[];
}

export function runOptimizedV2(
  request: WorkerComputeRequest,
  system: SystemDefinitions,
): WorkerComputeResponse {
  const { gridMins, items, defs, options } = request;
  const {
    signals,
    signalDefinitions,
    auxDefinitions,
    resolver,
    receptorKeys,
  } = system;

  // Resolve subject and physiology once — guaranteed non-null for all downstream use
  const resolvedSubject = resolveSubject(options?.subject);
  const resolvedPhysiology = options?.physiology ?? derivePhysiology(resolvedSubject);

  const enableInterventions = options?.debug?.enableInterventions ?? true;
  const includeSignals = options?.includeSignals ?? signals;
  const gridStep = gridMins.length > 1 ? gridMins[1] - gridMins[0] : 5;
  const defsMap = new Map(defs.map((d) => [d.key, d]));

  // Extract wake time for circadian alignment
  let wakeTimeMin = 480;
  if (enableInterventions) {
    for (const item of items) {
      const def = defsMap.get(item.meta.key);
      if (def?.key === "wake") {
        wakeTimeMin = item.startMin % 1440;
        break;
      }
    }
  }

  // Build PK agents for analytical concentration
  const pkAgents: PKAgent[] = [];
  if (enableInterventions) {
    const numDays = Math.ceil((gridMins[gridMins.length - 1] + 1) / 1440);
    for (let d = 0; d < numDays; d++) {
      for (const item of items) {
        const def = defsMap.get(item.meta.key);
        if (!def) continue;

        const pharms: any[] =
          (item as any).resolvedPharmacology ||
          (def.pharmacology
            ? typeof def.pharmacology === "function"
              ? [
                  def.pharmacology({
                    ...item.meta.params,
                    durationMin:
                      item.durationMin || def.defaultDurationMin || 30,
                    weight: resolvedSubject.weight,
                  }),
                ].flat()
              : [def.pharmacology]
            : []);

        for (let idx = 0; idx < pharms.length; idx++) {
          const pharm = pharms[idx];
          if (!pharm?.pk) continue;

          const pk = pharm.pk;
          const agentId = pharms.length > 1 ? `${item.id}_${idx}` : item.id;
          const massMg =
            pk.massMg ??
            Number(
              item.meta.params?.mg ??
                item.meta.params?.dose ??
                item.meta.params?.units ??
                100,
            );
          const F = pk.bioavailability ?? 1.0;
          const ke = pk.eliminationRate ?? 0.693 / (pk.halfLifeMin ?? 60);
          const ka = pk.absorptionRate ?? ke * 4;
          const duration =
            item.durationMin || pk.durationMin || def.defaultDurationMin || 30;

          let vd = 50;
          const vol = pk.volume;
          if (vol) {
            const weight = resolvedSubject.weight;
            const tbw = resolvedPhysiology.tbw;
            const lbm = resolvedPhysiology.leanBodyMass;
            const sex = resolvedSubject.sex;
            switch (vol.kind) {
              case "tbw":
                vd = tbw * (vol.fraction ?? 0.6);
                break;
              case "lbm":
                vd = lbm * (vol.base_L_kg ?? 1.0);
                break;
              case "weight":
                vd = weight * (vol.base_L_kg ?? 0.7);
                break;
              case "sex-adjusted":
                const ratio =
                  sex === "female"
                    ? (vol.female_L_kg ?? 0.55)
                    : (vol.male_L_kg ?? 0.68);
                vd = weight * ratio;
                break;
            }
          }

          pkAgents.push({
            id: agentId,
            startTime: item.startMin + d * 1440,
            duration: duration,
            intensity: item.meta.intensity ?? 1.0,
            massMg,
            F,
            ka,
            ke,
            vd,
            model: pk.model ?? "1-compartment",
            delivery: pk.delivery || (massMg ? "bolus" : "continuous"),
            Vmax: pk.Vmax,
            Km: pk.Km,
          });
        }
      }
    }
  }

  // Pre-compute analytical PK concentrations into lookup buffers
  const pkMinT = -1440;
  const pkMaxT =
    gridMins.length > 0 ? Math.ceil(gridMins[gridMins.length - 1]) : 0;
  const uniqueIds = new Set(pkAgents.map((a) => a.id));
  const pkBuffers = new Map<string, Float32Array>();

  for (const id of uniqueIds) {
    const buffer = new Float32Array(pkMaxT - pkMinT + 1);
    for (let t = pkMinT; t <= pkMaxT; t++) {
      buffer[t - pkMinT] = computeAnalyticalConcentration(pkAgents, id, t);
    }
    pkBuffers.set(id, buffer);
  }

  const getAnalyticalConc = (id: string, t: number): number => {
    const buffer = pkBuffers.get(id);
    if (!buffer) return 0;
    const floatIdx = t - pkMinT;
    const idx0 = Math.floor(floatIdx);
    if (idx0 < 0) return buffer[0] ?? 0;
    if (idx0 >= buffer.length - 1) return buffer[buffer.length - 1] ?? 0;
    return buffer[idx0] + (buffer[idx0 + 1] - buffer[idx0]) * (floatIdx - idx0);
  };

  const initialObjState = createInitialState(
    signals,
    signalDefinitions,
    auxDefinitions,
    {
      subject: resolvedSubject,
      physiology: resolvedPhysiology,
      isAsleep: false,
    },
    { ...options?.debug, receptorKeys },
  );

  const layout = createVectorLayout(
    signals,
    Object.keys(initialObjState.auxiliary),
    Object.keys(initialObjState.receptors),
  );
  const currentStateVector = stateToVector(initialObjState, layout);

  const { resSignals, resAux } = resolveDefinitions(
    signals,
    signalDefinitions,
    auxDefinitions,
    layout,
  );

  // Build active intervention list
  const allActiveIvs: ActiveIntervention[] = [];
  if (enableInterventions) {
    const numDays = Math.ceil(
      (gridMins[gridMins.length - 1] + gridStep) / 1440,
    );
    for (let d = 0; d < numDays; d++) {
      for (const item of items) {
        const def = defsMap.get(item.meta.key);
        if (!def) continue;
        const pharms: any[] =
          (item as any).resolvedPharmacology ||
          (def.pharmacology
            ? typeof def.pharmacology === "function"
              ? [
                  def.pharmacology({
                    ...item.meta.params,
                    durationMin:
                      item.durationMin || def.defaultDurationMin || 30,
                    weight: resolvedSubject.weight,
                  }),
                ].flat()
              : [def.pharmacology]
            : []);
        pharms.forEach((pharm, idx) => {
          const agentId = pharms.length > 1 ? `${item.id}_${idx}` : item.id;
          allActiveIvs.push({
            id: agentId,
            key: def.key,
            startTime: item.startMin + d * 1440,
            duration: item.durationMin,
            intensity: item.meta.intensity ?? 1.0,
            params: item.meta.params,
            pharmacology: pharm,
          });
        });
      }
    }
  }
  allActiveIvs.sort((a, b) => a.startTime - b.startTime);

  // Active set management (sweep algorithm)
  let activePointer = 0;
  let activeSet: ActiveIntervention[] = [];
  const updateActiveSet = (t: number) => {
    activeSet = activeSet.filter((iv) => t <= iv.startTime + iv.duration);
    while (
      activePointer < allActiveIvs.length &&
      allActiveIvs[activePointer].startTime <= t
    ) {
      if (
        t <=
        allActiveIvs[activePointer].startTime +
          allActiveIvs[activePointer].duration
      ) {
        activeSet.push(allActiveIvs[activePointer]);
      }
      activePointer++;
    }
  };

  const standardWakeTime = 480;
  const circShift = standardWakeTime - wakeTimeMin;
  const conditionAdjustments =
    options?.debug?.enableConditions !== false
      ? {
          baselines: options?.conditionBaselines,
          couplings: options?.conditionCouplings,
        }
      : {};

  // Merge enzyme and transporter activities into unified clearance modifiers
  // These affect enzyme-dependent clearance rates (e.g., DAT, DAO, SERT, MAO_A)
  const clearanceModifiers: Record<string, number> =
    options?.debug?.enableConditions !== false
      ? {
          ...(options?.enzymeActivities ?? {}),
          ...(options?.transporterActivities ?? {}),
        }
      : {};

  // Warm-up period
  if (options?.initialHomeostasisState) {
    const s = options.initialHomeostasisState as any;
    if (s.signals)
      Object.entries(s.signals).forEach(([k, v]) => {
        const idx = layout.signals.get(k as any);
        if (idx !== undefined) currentStateVector[idx] = v as number;
      });
    if (s.auxiliary)
      Object.entries(s.auxiliary).forEach(([k, v]) => {
        const idx = layout.auxiliary.get(k);
        if (idx !== undefined) currentStateVector[idx] = v as number;
      });
  } else {
    activePointer = 0;
    activeSet = [];
    for (let t_warm = -1440; t_warm < 0; t_warm += 1.0) {
      updateActiveSet(t_warm);
      const wallMin = ((t_warm % 1440) + 1440) % 1440;
      const isAsleep_warm =
        enableInterventions &&
        items.some((item) => {
          const def = defsMap.get(item.meta.key);
          if (def?.key !== "sleep") return false;
          return (
            wallMin >= item.startMin &&
            wallMin <= item.startMin + item.durationMin
          );
        });
      const warmUpCtx: DynamicsContext = {
        minuteOfDay: wallMin,
        circadianMinuteOfDay: (wallMin + circShift + 1440) % 1440,
        dayOfYear: 1,
        isAsleep: isAsleep_warm,
        subject: resolvedSubject,
        physiology: resolvedPhysiology,
      };

      computeDerivativesVector(
        currentStateVector,
        t_warm,
        warmUpCtx,
        activeSet,
        k1_ws,
        layout,
        resSignals,
        resAux,
        signals,
        resolver,
        {
          debug: options?.debug,
          pkAgents,
          clearanceModifiers,
          pkBuffers,
          pkMinT,
        },
        conditionAdjustments,
      );
      for (let i = 0; i < layout.size; i++) currentStateVector[i] += k1_ws[i];
      resSignals.forEach(
        (rs) =>
          (currentStateVector[rs.index] = Math.max(
            rs.min,
            Math.min(rs.max, currentStateVector[rs.index]),
          )),
      );
      resAux.forEach(
        (ra) =>
          (currentStateVector[ra.index] = Math.max(
            ra.min,
            Math.min(ra.max, currentStateVector[ra.index]),
          )),
      );
    }
  }

  // Output arrays
  const series: Record<Signal, Float32Array> = {} as any;
  includeSignals.forEach(
    (s: Signal) => (series[s] = new Float32Array(gridMins.length)),
  );
  const auxSeries: Record<string, Float32Array> = {};
  Object.keys(auxDefinitions).forEach(
    (k) => (auxSeries[k] = new Float32Array(gridMins.length)),
  );

  // Main simulation loop
  activePointer = 0;
  activeSet = [];

  gridMins.forEach((minute, idx) => {
    const adjustedMinute = ((minute % 1440) + 1440) % 1440;
    const circadianMinuteOfDay = (adjustedMinute + circShift + 1440) % 1440;
    const isAsleep =
      enableInterventions &&
      items.some((item) => {
        const def = defsMap.get(item.meta.key);
        if (def?.key !== "sleep") return false;
        const m = minute;
        const start = item.startMin;
        const end = item.startMin + item.durationMin;
        return (
          (m >= start && m <= end) || (m + 1440 >= start && m + 1440 <= end)
        );
      });

    const dt = idx === 0 ? 0 : gridStep;
    if (dt > 0) {
      const subSteps = Math.max(1, Math.ceil(dt / 1.0));
      const subDt = dt / subSteps;
      for (let s = 0; s < subSteps; s++) {
        const t = minute - dt + s * subDt;
        updateActiveSet(t);
        const currentMin = ((t % 1440) + 1440) % 1440;
        const dCtx: DynamicsContext = {
          minuteOfDay: currentMin,
          circadianMinuteOfDay: (currentMin + circShift + 1440) % 1440,
          dayOfYear: 1 + Math.floor(t / 1440),
          isAsleep,
          subject: resolvedSubject,
          physiology: resolvedPhysiology,
        };

        // RK4 with analytical PK lookup
        const opts = {
          debug: options?.debug,
          pkAgents,
          clearanceModifiers,
          pkBuffers,
          pkMinT,
        };
        computeDerivativesVector(
          currentStateVector,
          t,
          dCtx,
          activeSet,
          k1_ws,
          layout,
          resSignals,
          resAux,
          signals,
          resolver,
          opts,
          conditionAdjustments,
        );
        for (let i = 0; i < layout.size; i++)
          tmp_ws[i] = currentStateVector[i] + k1_ws[i] * (subDt / 2);
        computeDerivativesVector(
          tmp_ws,
          t + subDt / 2,
          dCtx,
          activeSet,
          k2_ws,
          layout,
          resSignals,
          resAux,
          signals,
          resolver,
          opts,
          conditionAdjustments,
        );
        for (let i = 0; i < layout.size; i++)
          tmp_ws[i] = currentStateVector[i] + k2_ws[i] * (subDt / 2);
        computeDerivativesVector(
          tmp_ws,
          t + subDt / 2,
          dCtx,
          activeSet,
          k3_ws,
          layout,
          resSignals,
          resAux,
          signals,
          resolver,
          opts,
          conditionAdjustments,
        );
        for (let i = 0; i < layout.size; i++)
          tmp_ws[i] = currentStateVector[i] + k3_ws[i] * subDt;
        computeDerivativesVector(
          tmp_ws,
          t + subDt,
          dCtx,
          activeSet,
          k4_ws,
          layout,
          resSignals,
          resAux,
          signals,
          resolver,
          opts,
          conditionAdjustments,
        );
        for (let i = 0; i < layout.size; i++)
          currentStateVector[i] +=
            (subDt / 6) * (k1_ws[i] + 2 * k2_ws[i] + 2 * k3_ws[i] + k4_ws[i]);

        resSignals.forEach(
          (rs) =>
            (currentStateVector[rs.index] = Math.max(
              rs.min,
              Math.min(rs.max, currentStateVector[rs.index]),
            )),
        );
        resAux.forEach(
          (ra) =>
            (currentStateVector[ra.index] = Math.max(
              ra.min,
              Math.min(ra.max, currentStateVector[ra.index]),
            )),
        );
      }
    } else {
      updateActiveSet(minute);
    }

    // Record output
    layout.signals.forEach((idxV, s) => {
      if (series[s]) series[s][idx] = currentStateVector[idxV];
    });
    layout.auxiliary.forEach((idxV, k) => {
      if (auxSeries[k]) auxSeries[k][idx] = currentStateVector[idxV];
    });
  });

  // Evaluate monitors
  const monitors = collectSignalMonitors(signalDefinitions);
  const monitorResults = evaluateMonitors(
    monitors,
    series,
    gridStep,
    gridMins[0],
  );

  return {
    series,
    auxiliarySeries: auxSeries,
    finalHomeostasisState: vectorToState(currentStateVector, layout),
    homeostasisSeries: {} as any, // To be filled by the caller or specialized series
    monitorResults,
  };
}
