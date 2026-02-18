import type {
  SignalDefinition,
  AuxiliaryDefinition,
  DynamicsContext,
} from "../../../engine";

export const bdnf: SignalDefinition = {
  key: "bdnf",
  type: "derived",
  label: "BDNF",
  isPremium: true,
  unit: "ng/mL",
  description:
    "Often called 'brain fertilizer,' BDNF supports the survival of existing neurons and encourages the growth of new ones.",
  idealTendency: "higher",
  dynamics: {
    setpoint: (ctx, state) => {
      const ageFactor = Math.max(0.5, 1.0 - Math.max(0, ctx.subject.age - 25) * 0.006);
      const sexFactor = ctx.subject.sex === "female" ? 1.1 : 1.0;
      return 25.0 * ageFactor * sexFactor;
    },
    tau: 480,
    production: [
      { source: "growthHormone", coefficient: 0.5 },
      {
        source: "constant",
        coefficient: 0.005,
        transform: (_: any, state) => state.auxiliary.bdnfExpression ?? 0.6,
      },
    ],
    clearance: [{ type: "linear", rate: 0.002 }],
    couplings: [{ source: "cortisol", effect: "inhibit", strength: 0.3 }],
  },
  initialValue: 25.0,
  min: 0,
  max: 100,
  display: {
    referenceRange: { min: 10, max: 30 },
  },
  monitors: [
    {
      id: "bdnf_boost",
      signal: "bdnf",
      pattern: {
        type: "increases_by",
        amount: 5,
        mode: "absolute",
        windowMins: 120,
      },
      outcome: "win",
      message: "BDNF Boost",
      description:
        "Neuroplasticity signaling is active. Good for learning and memory.",
    },
  ],
};

export const bdnfExpression: AuxiliaryDefinition = {
  key: "bdnfExpression",
  type: "auxiliary",
  dynamics: {
    setpoint: (ctx, state) => 0.6,
    tau: 2880,
    production: [
      { source: "constant", coefficient: 0.001, transform: () => 0 },
    ],
    clearance: [{ type: "linear", rate: 0.0001 }],
  },
  initialValue: 0.6,
};

export const mtor: SignalDefinition = {
  key: "mtor",
  type: "derived",
  label: "mTOR",
  isPremium: true,
  unit: "x",
  description: "The body's primary 'build and grow' pathway.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => 1.0,
    tau: 15,
    production: [{ source: "insulin", coefficient: 0.0005 }],
    clearance: [{ type: "linear", rate: 0.05 }],
    couplings: [],
  },
  initialValue: 1.0,
  min: 0,
  max: 20,
  display: {
    referenceRange: { min: 0.5, max: 2.0 },
  },
  monitors: [
    {
      id: "mtor_anabolic",
      signal: "mtor",
      pattern: { type: "exceeds", value: 1.5, sustainedMins: 30 },
      outcome: "win",
      message: "Anabolic state (mTOR active)",
      description: "Your body is primed for muscle growth and repair.",
    },
  ],
};

export const ampk: SignalDefinition = {
  key: "ampk",
  type: "derived",
  label: "AMPK",
  isPremium: true,
  unit: "x",
  description: "Your body's 'energy sensor' and fuel gauge.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => 1.0,
    tau: 1440,
    production: [{ source: "glucagon", coefficient: 0.01 }],
    clearance: [{ type: "linear", rate: 0.01 }],
    couplings: [{ source: "insulin", effect: "inhibit", strength: 0.04 }],
  },
  initialValue: 1.0,
  min: 0,
  max: 100,
  display: {
    referenceRange: { min: 0.2, max: 0.8 },
  },
  monitors: [
    {
      id: "ampk_fasting",
      signal: "ampk",
      pattern: { type: "exceeds", value: 1.2, sustainedMins: 60 },
      outcome: "win",
      message: "Metabolic reset (AMPK active)",
      description:
        "Energy sensing pathways active. Promotes autophagy and fat burning.",
    },
  ],
};

export const muscleProteinSynthesis: AuxiliaryDefinition = {
  key: "muscleProteinSynthesis",
  type: "auxiliary",
  dynamics: {
    setpoint: (ctx, state) => 0,
    tau: 120,
    production: [
      {
        source: "constant",
        coefficient: 1.0,
        transform: (_: any, state) => {
          const mTOR = state.signals.mtor;
          // MPS scales with mTOR activation, but only when mTOR is above baseline (1.0)
          // Also implicitly requires amino acid availability which is part of mTOR production
          return mTOR > 1.0 ? 0.01 * (mTOR - 1.0) : 0;
        },
      },
    ],
    clearance: [{ type: "linear", rate: 0.005 }],
  },
  initialValue: 0,
};

export const muscleMass: AuxiliaryDefinition = {
  key: "muscleMass",
  type: "auxiliary",
  dynamics: {
    setpoint: (ctx, state) => 0,
    tau: 43200, // Extremely slow (30 days)
    production: [
      {
        source: "constant",
        coefficient: 1.0,
        transform: (_: any, state) => {
          const mps = state.auxiliary?.muscleProteinSynthesis ?? 0;
          // MPS represents building rate.
          // Calibrated so that sustained high mTOR (mps ~ 20) yields ~1kg muscle/month
          // 1kg / 43200 mins = 0.000023 kg/min
          // 0.000023 / 20 = 0.000001
          return 0.000001 * mps;
        },
      },
    ],
    clearance: [],
  },
  initialValue: 0,
  min: -50, // Can lose up to 50kg muscle
  max: 50, // Can gain up to 50kg muscle
};

export const strengthReadiness: SignalDefinition = {
  key: "strengthReadiness",
  type: "derived",
  label: "Strength Readiness",
  unit: "x",
  description: "Your immediate capacity for peak physical output.",
  idealTendency: "higher",
  dynamics: {
    setpoint: (ctx, state) => {
      const ageFactor = Math.max(0.6, 1.0 - Math.max(0, ctx.subject.age - 25) * 0.005);
      const sexFactor = ctx.subject.sex === "female" ? 0.95 : 1.0;
      return 1.0 * ageFactor * sexFactor;
    },
    tau: 1440, // 24 hour recovery cycle
    production: [
      {
        source: "constant",
        coefficient: 0.001,
        transform: (_: any, state, ctx) => {
          // Recovery is boosted by sleep and growth hormone
          const gh = state.signals.growthHormone ?? 5;
          const sleepBoost = ctx.isAsleep ? 2.0 : 1.0;
          return (gh / 10) * 0.005 * sleepBoost;
        },
      },
    ],
    clearance: [
      {
        type: "linear",
        rate: 0.001,
        transform: (_: any, state) => {
          // Exercise directly depletes strength readiness
          // burnRate above BMR indicates physical activity
          const burn = state.signals?.burnRate ?? 1.15;
          const bmrMin = 1.15; // Baseline metabolic rate
          const exerciseIntensity = Math.max(0, burn - bmrMin);

          // High intensity exercise depletes strength faster
          // At 10 kcal/min above BMR (intense workout), clearance is 50x baseline
          return 1 + exerciseIntensity * 5;
        },
      },
    ],
    couplings: [
      { source: "inflammation", effect: "inhibit", strength: 0.2 },
      { source: "cortisol", effect: "inhibit", strength: 0.1 },
    ],
  },
  initialValue: 1.0,
  min: 0,
  max: 2,
  display: {
    referenceRange: { min: 0.5, max: 1.5 },
  },
  monitors: [
    {
      id: "strength_fatigue",
      signal: "strengthReadiness",
      pattern: { type: "falls_below", value: 0.6, sustainedMins: 60 },
      outcome: "warning",
      message: "High muscular fatigue",
      description:
        "Your strength readiness is low. Consider rest or light recovery.",
    },
    {
      id: "strength_peak",
      signal: "strengthReadiness",
      pattern: { type: "exceeds", value: 1.3, sustainedMins: 30 },
      outcome: "win",
      message: "Peak Strength Readiness",
      description: "Your body is primed for high-intensity effort.",
    },
  ],
};

export const neuroplasticityScore: SignalDefinition = {
  key: "neuroplasticityScore",
  type: "derived",
  label: "Neuroplasticity",
  unit: "x",
  description: "The brain's current readiness for learning and adaptation.",
  idealTendency: "higher",
  dynamics: {
    setpoint: (ctx, state) => {
      const ageFactor = Math.max(0.5, 1.0 - Math.max(0, ctx.subject.age - 25) * 0.006);
      return 1.0 * ageFactor;
    },
    tau: 720,
    production: [
      {
        source: "constant",
        coefficient: 1.0,
        transform: (_: any, state) => {
          const bdnf = state.signals.bdnf;
          return (bdnf / 25) * 0.01;
        },
      },
    ],
    clearance: [{ type: "linear", rate: 0.01 }],
    couplings: [{ source: "cortisol", effect: "inhibit", strength: 0.15 }],
  },
  initialValue: 1.0,
  min: 0,
  max: 2,
  display: {
    referenceRange: { min: 0.5, max: 1.5 },
  },
  monitors: [
    {
      id: "neuroplasticity_peak",
      signal: "neuroplasticityScore",
      pattern: { type: "exceeds", value: 1.3, sustainedMins: 30 },
      outcome: "win",
      message: "Peak Neuroplasticity",
      description:
        "Your brain is in an optimal state for learning and creating new neural connections.",
    },
  ],
};
