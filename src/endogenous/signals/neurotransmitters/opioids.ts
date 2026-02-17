import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const endorphin: SignalDefinition = {
  key: "endorphin",
  label: "Endorphins",
  description: "Natural painkillers and mood elevators.",
  unit: "x",
  initialValue: 1.0,
  idealTendency: "none",
  display: {},
  dynamics: {
    setpoint: (ctx, state) => 1.0,
    tau: 30, // Relatively fast clearance
    production: [],
    clearance: [],
    couplings: [],
  },
  monitors: [
    {
      id: "endorphin_rush",
      signal: "endorphin",
      pattern: { type: "exceeds", value: 3.0, sustainedMins: 5 },
      outcome: "win",
      message: "Endorphin Rush",
      description:
        "Natural pain relief and mood elevation is active (e.g., Runner's High).",
    },
  ],
};

export const dynorphin: SignalDefinition = {
  key: "dynorphin",
  label: "Dynorphins",
  description: "Opioid peptides involved in stress and dysphoria.",
  unit: "x",
  initialValue: 1.0,
  idealTendency: "mid",
  display: {},
  dynamics: {
    setpoint: (ctx, state) => 1.0,
    tau: 30,
    production: [],
    clearance: [],
    couplings: [],
  },
};

export const anandamide: SignalDefinition = {
  key: "anandamide",
  label: "Anandamide",
  description: "Endogenous cannabinoid neurotransmitter.",
  unit: "x",
  initialValue: 1.0,
  idealTendency: "none",
  display: {},
  dynamics: {
    setpoint: (ctx, state) => 1.0,
    tau: 15, // Very short half-life
    production: [],
    clearance: [],
    couplings: [],
  },
};
