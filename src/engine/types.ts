// Pure Simulation Engine Types

export type Signal = string;

export interface SolverDebugOptions {
  enableBaselines?: boolean;
  enableInterventions?: boolean;
  enableCouplings?: boolean;
  enableHomeostasis?: boolean;
  enableReceptors?: boolean;
  enableTransporters?: boolean;
  enableEnzymes?: boolean;
  enableConditions?: boolean;
  receptorKeys?: string[];
  pkBuffers?: Map<string, Float32Array>;
  pkMinT?: number;
  debug?: boolean;
  clearanceModifiers?: Record<string, number>;
}

/**
 * The environment passed to signal dynamics functions (setpoints, transforms).
 */
export interface DynamicsContext {
  minuteOfDay: number;
  circadianMinuteOfDay: number;
  dayOfYear: number;
  isAsleep: boolean;
  subject: any; // Domain-specific fields (age, sex, etc.)
  physiology: any; // Calculated fields (BMR, TBW, etc.)
}

export interface ProductionTerm {
  source: Signal | "constant" | "circadian";
  coefficient: number;
  transform?: (
    value: number,
    state: SimulationState,
    ctx: DynamicsContext,
  ) => number;
}

export type ClearanceType = "linear" | "saturable" | "enzyme-dependent";

export interface ClearanceTerm {
  type: ClearanceType;
  rate: number;
  enzyme?: string;
  Km?: number;
  transform?: (
    value: number,
    state: SimulationState,
    ctx: DynamicsContext,
  ) => number;
}

export interface DynamicCoupling {
  source: Signal;
  effect: "stimulate" | "inhibit";
  strength: number;
  delay?: number;
  saturation?: number;
}

export interface SignalDynamics {
  setpoint: (ctx: DynamicsContext, state: SimulationState) => number;
  tau: number;
  production: ProductionTerm[];
  clearance: ClearanceTerm[];
  couplings: DynamicCoupling[];
}

export type IdealTendency = "higher" | "lower" | "mid" | "none";

// --- Monitor Types ---

/**
 * The outcome when a monitor's pattern is detected.
 */
export type MonitorOutcome = "win" | "warning" | "critical";

/**
 * Pattern: Value exceeds a threshold
 */
export interface ExceedsPattern {
  type: "exceeds";
  value: number;
  sustainedMins?: number;
}

/**
 * Pattern: Value falls below a threshold
 */
export interface FallsBelowPattern {
  type: "falls_below";
  value: number;
  sustainedMins?: number;
}

/**
 * Pattern: Value goes outside a range
 */
export interface OutsideRangePattern {
  type: "outside_range";
  min?: number;
  max?: number;
  sustainedMins?: number;
}

/**
 * Pattern: Value deviates from the signal's dynamic setpoint
 */
export interface DeviatesFromSetpointPattern {
  type: "deviates_from_setpoint";
  deviation: number;
  mode: "absolute" | "percent";
  direction: "above" | "below" | "either";
}

/**
 * Pattern: Value deviates from a rolling baseline
 */
export interface DeviatesFromBaselinePattern {
  type: "deviates_from_baseline";
  deviation: number;
  mode: "absolute" | "percent";
  direction: "above" | "below" | "either";
  baselineWindowMins: number;
}

/**
 * Pattern: Value increases by amount over time window
 */
export interface IncreasesByPattern {
  type: "increases_by";
  amount: number;
  mode: "absolute" | "percent";
  windowMins: number;
}

/**
 * Pattern: Value decreases by amount over time window
 */
export interface DecreasesByPattern {
  type: "decreases_by";
  amount: number;
  mode: "absolute" | "percent";
  windowMins: number;
}

/**
 * Pattern: Value shows sustained upward trend
 */
export interface TrendingUpPattern {
  type: "trending_up";
  windowDays: number;
  minSlopePerDay?: number;
  minConfidence?: number;
}

/**
 * Pattern: Value shows sustained downward trend
 */
export interface TrendingDownPattern {
  type: "trending_down";
  windowDays: number;
  minSlopePerDay?: number;
  minConfidence?: number;
}

/**
 * Pattern: Cumulative exposure (AUC) exceeds threshold
 */
export interface HighExposurePattern {
  type: "high_exposure";
  windowMins: number;
  threshold: number;
}

/**
 * Pattern: Cumulative exposure (AUC) falls below threshold
 */
export interface LowExposurePattern {
  type: "low_exposure";
  windowMins: number;
  threshold: number;
}

/**
 * Pattern: Signal shows high variability
 */
export interface HighVariabilityPattern {
  type: "high_variability";
  windowMins: number;
  cvThreshold: number;
}

/**
 * Pattern: Signal shows low variability
 */
export interface LowVariabilityPattern {
  type: "low_variability";
  windowMins: number;
  cvThreshold: number;
}

/**
 * Non-composite pattern types (used in composite patterns)
 */
export type SimpleMonitorPattern =
  | ExceedsPattern
  | FallsBelowPattern
  | OutsideRangePattern
  | DeviatesFromSetpointPattern
  | DeviatesFromBaselinePattern
  | IncreasesByPattern
  | DecreasesByPattern
  | TrendingUpPattern
  | TrendingDownPattern
  | HighExposurePattern
  | LowExposurePattern
  | HighVariabilityPattern
  | LowVariabilityPattern;

/**
 * Pattern: Combines multiple signal patterns
 */
export interface CompositePattern {
  type: "composite";
  operator: "and" | "or";
  patterns: Array<{
    signal: Signal;
    pattern: SimpleMonitorPattern;
  }>;
}

/**
 * All monitor pattern types
 */
export type MonitorPattern = SimpleMonitorPattern | CompositePattern;

/**
 * A Monitor watches a signal for a specific pattern and reports outcomes.
 */
export interface Monitor {
  id: string;
  signal: Signal;
  pattern: MonitorPattern;
  outcome: MonitorOutcome;
  message: string;
  description?: string;
}

/**
 * Result when a monitor's pattern has been detected.
 */
export interface MonitorResult {
  monitor: Monitor;
  detectedAt: Minute;
  triggerValue: number | number[];
  context?: Record<string, unknown>;
}

// --- Signal Definition ---

export interface SignalDefinition {
  key: Signal;
  label: string;
  unit: string;
  description: string;
  dynamics: SignalDynamics;
  initialValue:
    | number
    | ((ctx: { subject: any; physiology: any; isAsleep: boolean }) => number);
  min?: number;
  max?: number;
  idealTendency: IdealTendency;
  display: {
    referenceRange?: { min: number; max: number };
  };
  goals?: string[];
  isPremium?: boolean;
  group?: string;
  /** Monitors for detecting patterns in this signal */
  monitors?: Monitor[];
}

export interface AuxiliaryDefinition {
  key: string;
  label?: string;
  dynamics: {
    setpoint: (ctx: DynamicsContext, state: SimulationState) => number;
    tau: number;
    production: ProductionTerm[];
    clearance: ClearanceTerm[];
  };
  initialValue: number | ((ctx: { subject: any; physiology: any }) => number);
  min?: number;
  max?: number;
}

export interface SimulationState {
  signals: Record<string, number>;
  auxiliary: Record<string, number>;
  receptors: Record<string, number>;
  pk: Record<string, number>;
  accumulators: Record<string, number>;
}

export interface ActiveIntervention {
  id: string;
  key: string;
  startTime: number;
  duration: number;
  intensity: number;
  params: Record<string, any>;
  pharmacology?: any;
}

export type Minute = number;
export type UUID = string;

export interface WorkerComputeRequest {
  gridMins: Minute[];
  items: any[];
  defs: any[];
  options?: any;
}

export interface WorkerComputeResponse {
  series: Record<Signal, Float32Array>;
  auxiliarySeries: Record<string, Float32Array>;
  finalHomeostasisState: any;
  homeostasisSeries: any;
  monitorResults: MonitorResult[];
  computeTimeMs?: number;
}

// --- Pharmacology (PK/PD) ---
export type PDMechanism = "agonist" | "antagonist" | "PAM" | "NAM" | "linear";
export type PharmacologicalTarget = string;

export type PKModelType =
  | "1-compartment"
  | "2-compartment"
  | "activity-dependent"
  | "michaelis-menten";

export type PKDeliveryType = "bolus" | "continuous" | "infusion";

export interface PKVolumeConfig {
  kind: "tbw" | "lbm" | "weight" | "sex-adjusted";
  fraction?: number;
  base_L_kg?: number;
  male_L_kg?: number;
  female_L_kg?: number;
}

export interface PKDef {
  model: PKModelType;
  delivery: PKDeliveryType;
  massMg: number;
  bioavailability?: number;
  halfLifeMin?: number;
  absorptionRate?: number;
  eliminationRate?: number;
  timeToPeakMin?: number;
  Vmax?: number;
  Km?: number;
  volume?: PKVolumeConfig;
  clearance?: {
    hepatic?: {
      baseCL_mL_min: number;
      CYP?: string;
    };
    renal?: {
      baseCL_mL_min: number;
    };
  };
}

export interface PharmacologyDef {
  molecule: {
    name: string;
    molarMass: number;
    pK_a?: number;
    logP?: number;
  };
  pk: PKDef;
  pd: Array<{
    target: PharmacologicalTarget;
    unit?: string;
    mechanism: PDMechanism;
    Ki?: number;
    /**
     * The concentration (in mg/L) at which the drug produces 50% of maximal
     * receptor occupancy. This is a fixed pharmacological property of the
     * drug–receptor pair and MUST NOT vary with dose.
     *
     * If EC50 is made proportional to dose (e.g. `EC50 = expectedPeak * k`
     * where expectedPeak depends on the dose parameter), the Hill equation
     * `C/(C+EC50)` becomes dose-independent and the drug will have identical
     * effects at every dose.
     *
     * Calibration: compute the reference peak plasma concentration for a
     * typical therapeutic dose, then set EC50 as a fraction of that constant.
     * Example for semaglutide (ref dose 0.5 mg):
     *   refPeak = (0.5 * 0.89) / 8.4 ≈ 0.053 mg/L
     *   EC50 = refPeak * 0.3 ≈ 0.016  (fixed constant)
     */
    EC50?: number;
    intrinsicEfficacy?: number;
    tau?: number;
    alpha?: number;
    description?: string;
  }>;
}

export interface ResponseSpec {
  kind: "linear" | "hill" | "ihill" | "logistic";
  gain?: number;
  Emax?: number;
  EC50?: number;
  Imax?: number;
  IC50?: number;
  n?: number;
  L?: number;
  k?: number;
  x0?: number;
}

export interface CouplingSpec {
  source: Signal;
  mapping: ResponseSpec;
  saturation?: ResponseSpec;
  delay?: any;
  description: string;
  isManagedByHomeostasis?: boolean;
}

export type ProfileBaselineAdjustments = Partial<
  Record<Signal, { amplitude?: number; phaseShiftMin?: number }>
>;
export type ProfileCouplingAdjustments = Partial<
  Record<Signal, CouplingSpec[]>
>;

/**
 * Shared container for worker items.
 */
export interface ItemForWorker {
  id: UUID;
  startMin: Minute;
  durationMin: number;
  meta: any;
  resolvedPharmacology?: PharmacologyDef[];
}

export type ConcentrationUnit =
  | "mg/dL" // Glucose, ethanol
  | "g/dL" // High ethanol
  | "µg/dL" // Cortisol, zinc, copper, iron
  | "ng/dL" // Testosterone
  | "ng/mL" // Leptin, BDNF, growth hormone, folate
  | "pg/mL" // Catecholamines, melatonin, orexin, B12
  | "µIU/mL" // Insulin
  | "pmol/L" // GLP-1, thyroid
  | "nmol/L" // SHBG
  | "nM" // Synaptic neurotransmitters
  | "µM" // Glutamate (extracellular)
  | "IU/L" // LH, FSH
  | "U/L" // Enzymes (ALT, AST)
  | "mmol/L" // Ketones, electrolytes
  | "µg/L" // Selenium
  | "µmol/L"; // Choline

export type RateUnit = "mL/min/1.73m²" | "kcal/kg" | "kcal/min"; // eGFR, EA, burnRate

export type WeightUnit = "mcg" | "mg" | "g" | "kg" | "g" | "oz" | "lb" | "µg";
export type TemperatureUnit = "°C" | "°F";
export type VolumeUnit = "ml" | "L" | "floz" | "cup" | "pint" | "qt" | "gal";

export type TimeUnit = "ms" | "sec" | "min" | "hr";
export type PressureUnit = "mmHg";
export type RatioUnit = "fold-change" | "ratio" | "relative" | "a.u." | "x";
export type CompositeUnit = "units" | "IU" | "servings"; // Explicitly marks as computed index, not a measurement
export type PercentUnit = "% baseline" | "%"; // For legacy/transitional support

export type PhysiologicalUnit =
  | ConcentrationUnit
  | RateUnit
  | TimeUnit
  | PressureUnit
  | RatioUnit
  | CompositeUnit
  | PercentUnit
  | WeightUnit;

export type ParameterUnit =
  | WeightUnit
  | CompositeUnit
  | TemperatureUnit
  | VolumeUnit;
