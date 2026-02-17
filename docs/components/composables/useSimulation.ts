import { ref, reactive, watchEffect, type Ref } from 'vue'
import {
  createInitialState,
  integrateStep,
  DEFAULT_SUBJECT,
  derivePhysiology,
  buildConditionAdjustments,
  INTERVENTION_MAP,
} from '@kyneticbio/core'
import type { PersonaDef } from '../data/personas'

export interface TracePoint {
  x: number
  y: number
}

export interface SignalResult {
  key: string
  label: string
  baseline: TracePoint[]
  intervention: TracePoint[]
}

export interface SimState {
  conditions: Record<string, { enabled: boolean; params: Record<string, any> }>
  subject: Record<string, any>
  activeInterventions: Record<string, { enabled: boolean; params: Record<string, any> }>
  visibleSignals: Array<{ key: string; label: string }>
  results: SignalResult[]
}

function makeInterventions(
  id: string,
  key: string,
  startTime: number,
  duration: number,
  pharmacology: any,
  params: Record<string, any> = {},
) {
  const defs = Array.isArray(pharmacology) ? pharmacology : [pharmacology]
  return defs.map((pharm: any, idx: number) => ({
    id: defs.length > 1 ? `${id}_${idx}` : id,
    key,
    startTime,
    duration,
    intensity: 1.0,
    params,
    pharmacology: pharm,
  }))
}

function runOnce(
  signalKeys: string[],
  conditions: Record<string, { enabled: boolean; params: Record<string, any> }>,
  subjectOverrides: Record<string, any>,
  interventions: any[],
  simConfig: { hours: number; startMinuteOfDay: number; stepMin?: number },
) {
  const subject = { ...DEFAULT_SUBJECT, ...subjectOverrides }
  const physiology = derivePhysiology(subject)

  const conditionState: Record<string, any> = {}
  for (const [key, val] of Object.entries(conditions)) {
    if (val.enabled) {
      conditionState[key] = { enabled: true, params: val.params || {} }
    }
  }
  const adjustments = buildConditionAdjustments(conditionState)

  const stepMin = simConfig.stepMin || 5
  let state = createInitialState({
    subject,
    physiology,
    isAsleep: simConfig.startMinuteOfDay >= 1200,
  })

  const totalSteps = Math.round((simConfig.hours * 60) / stepMin)
  const traces: Record<string, TracePoint[]> = {}
  for (const sig of signalKeys) {
    traces[sig] = [{ x: 0, y: state.signals[sig] ?? 0 }]
  }

  for (let i = 1; i <= totalSteps; i++) {
    const t = i * stepMin
    const minuteOfDay = (simConfig.startMinuteOfDay + t) % 1440
    const ctx = {
      minuteOfDay,
      circadianMinuteOfDay: minuteOfDay,
      dayOfYear: 1,
      isAsleep: minuteOfDay >= 1320 || minuteOfDay < 360,
      subject,
      physiology,
    }
    state = integrateStep(
      state, t - stepMin, stepMin, ctx,
      undefined, undefined,
      interventions,
      { debug: {}, conditionAdjustments: adjustments },
    )
    for (const sig of signalKeys) {
      traces[sig].push({ x: t, y: state.signals[sig] ?? 0 })
    }
  }
  return traces
}

export function useSimulation(persona: Ref<PersonaDef | null>) {
  const state = reactive<SimState>({
    conditions: {},
    subject: {},
    activeInterventions: {},
    visibleSignals: [],
    results: [],
  })

  // Initialize state from persona
  function initFromPersona(p: PersonaDef) {
    // Conditions
    const conds: Record<string, { enabled: boolean; params: Record<string, any> }> = {}
    for (const c of p.conditions) {
      conds[c.key] = { enabled: c.enabledByDefault, params: { ...c.defaultParams } }
    }
    state.conditions = conds

    // Subject overrides
    const subj: Record<string, any> = {}
    if (p.subjectOverrides) {
      Object.assign(subj, p.subjectOverrides)
    }
    if (p.subjectSliders) {
      for (const s of p.subjectSliders) {
        if (!(s.key in subj)) {
          subj[s.key] = s.default
        }
      }
    }
    state.subject = subj

    // Interventions
    const ivs: Record<string, { enabled: boolean; params: Record<string, any> }> = {}
    for (const iv of p.interventions) {
      ivs[iv.key] = { enabled: iv.enabledByDefault, params: { ...iv.defaultParams } }
    }
    state.activeInterventions = ivs

    // Signals
    state.visibleSignals = [...p.signals]
  }

  // Build intervention objects for the engine
  function buildInterventionList(simDuration: number) {
    const list: any[] = []
    for (const [key, iv] of Object.entries(state.activeInterventions)) {
      if (!iv.enabled) continue
      const def = INTERVENTION_MAP.get(key)
      if (!def) continue

      const pharmacology =
        typeof def.pharmacology === 'function'
          ? def.pharmacology(iv.params)
          : def.pharmacology

      const duration = def.defaultDurationMin || simDuration
      list.push(...makeInterventions(key, key, 0, Math.min(duration, simDuration), pharmacology, iv.params))
    }
    return list
  }

  // Run simulation reactively
  watchEffect(() => {
    const p = persona.value
    if (!p) {
      state.results = []
      return
    }

    const signalKeys = state.visibleSignals.map(s => s.key)
    if (!signalKeys.length) {
      state.results = []
      return
    }

    const simDuration = p.sim.hours * 60
    const interventionList = buildInterventionList(simDuration)

    // Baseline: no interventions, same conditions
    const baseTraces = runOnce(
      signalKeys,
      state.conditions,
      state.subject,
      [],
      p.sim,
    )

    // Intervention run
    const ivTraces = runOnce(
      signalKeys,
      state.conditions,
      state.subject,
      interventionList,
      p.sim,
    )

    state.results = signalKeys.map((key, idx) => ({
      key,
      label: state.visibleSignals[idx]?.label || key,
      baseline: baseTraces[key] || [],
      intervention: ivTraces[key] || [],
    }))
  })

  return {
    state,
    initFromPersona,
  }
}
