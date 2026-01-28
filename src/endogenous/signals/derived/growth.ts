import type { SignalDefinition, AuxiliaryDefinition } from "../../../engine";

export const bdnf: SignalDefinition = {
  key: "bdnf",
  label: "BDNF",
  isPremium: true,
  unit: "ng/mL",
  description:
    "Often called 'brain fertilizer,' BDNF supports the survival of existing neurons and encourages the growth of new ones.",
  idealTendency: "higher",
  dynamics: {
    setpoint: (ctx, state) => 25.0,
    tau: 480,
    production: [
      { source: "growthHormone", coefficient: 0.5 },
      {
        source: "constant",
        coefficient: 0.005,
        transform: (_: any, state: any) =>
          state.auxiliary.bdnfExpression ?? 0.6,
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
};

export const bdnfExpression: AuxiliaryDefinition = {
  key: "bdnfExpression",
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
  label: "mTOR",
  isPremium: true,
  unit: "fold-change",
  description: "The body's primary 'build and grow' pathway.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => 1.0,
    tau: 15,
    production: [
      { source: "insulin", coefficient: 0.0005 }
    ],
    clearance: [{ type: "linear", rate: 0.05 }],
    couplings: [],
  },
  initialValue: 1.0,
  min: 0,
  max: 20,
  display: {
    referenceRange: { min: 0.5, max: 2.0 },
  },
};

export const ampk: SignalDefinition = {
  key: "ampk",
  label: "AMPK",
  isPremium: true,
  unit: "fold-change",
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
};

export const muscleProteinSynthesis: AuxiliaryDefinition = {
  key: "muscleProteinSynthesis",
  dynamics: {
    setpoint: (ctx, state) => 0,
    tau: 120,
    production: [
      {
        source: "constant",
        coefficient: 1.0,
        transform: (_: any, state: any) => {
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
  dynamics: {
    setpoint: (ctx, state) => 0,
    tau: 43200, // Extremely slow (30 days)
    production: [
      {
        source: "constant",
        coefficient: 1.0,
        transform: (_: any, state: any) => {
          const mps = state.auxiliary?.muscleProteinSynthesis ?? 0;
          // MPS represents building rate. 1kg muscle ~= 5000 kcal synthesis cost (simplified)
          // We convert the arbitrary MPS index into kg muscle gain
          return 0.0001 * mps;
        },
      },
    ],
    clearance: [],
  },
  initialValue: 0,
};

export const strengthReadiness: SignalDefinition = {
  key: "strengthReadiness",
  label: "Strength Readiness",
  unit: "index",
  description: "Your immediate capacity for peak physical output.",
  idealTendency: "higher",
  dynamics: {
    setpoint: (ctx, state) => 1.0,
    tau: 1440, // 24 hour recovery cycle
    production: [
      {
        source: "constant",
        coefficient: 0.001,
        transform: (_: any, state: any) => {
          // Recovery is boosted by sleep and growth hormone
          const gh = state.signals.growthHormone;
          const isAsleep = false; // Need to get this from ctx if possible, or use signals
          return (gh / 10) * 0.005;
        },
      },
    ],
    clearance: [{ type: "linear", rate: 0.001 }],
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
};

export const neuroplasticityScore: SignalDefinition = {
  key: "neuroplasticityScore",
  label: "Neuroplasticity",
  unit: "index",
  description: "The brain's current readiness for learning and adaptation.",
  idealTendency: "higher",
  dynamics: {
    setpoint: (ctx, state) => 1.0,
    tau: 720,
    production: [
      {
        source: "constant",
        coefficient: 1.0,
        transform: (_: any, state: any) => {
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
};
