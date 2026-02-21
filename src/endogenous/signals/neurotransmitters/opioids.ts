import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const endorphin: SignalDefinition = {
  key: "endorphin",
  type: "neurotransmitter",
  label: "Endorphins",
  description: "Natural painkillers and mood elevators.",
  unit: "x",
  initialValue: 1.0,
  idealTendency: "none",
  display: {},
  dynamics: {
    setpoint: (ctx, state) => {
      const ageFactor = Math.max(0.6, 1.0 - Math.max(0, ctx.subject.age - 30) * 0.005);
      const sexFactor = ctx.subject.sex === "female" ? 0.9 : 1.0;
      return 1.0 * ageFactor * sexFactor;
    },
    tau: 30, // Relatively fast clearance
    production: [
      {
        source: "constant",
        coefficient: 0.003,
        transform: (_: any, state: any) => {
          const cortisol = state.signals.cortisol ?? 15;
          const norepi = state.signals.norepi ?? 300;
          return (cortisol > 15 ? 0.5 : 0) + (norepi > 300 ? 0.3 : 0);
        },
      },
    ],
    clearance: [{ type: "linear", rate: 0.02 }],
    couplings: [{ source: "norepi", effect: "stimulate", strength: 0.005 }],
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
  type: "neurotransmitter",
  label: "Dynorphins",
  description: "Opioid peptides involved in stress and dysphoria.",
  unit: "x",
  initialValue: 1.0,
  idealTendency: "mid",
  display: {},
  dynamics: {
    setpoint: (ctx, state) => {
      const ageFactor = Math.max(0.6, 1.0 - Math.max(0, ctx.subject.age - 30) * 0.005);
      return 1.0 * ageFactor;
    },
    tau: 30,
    production: [
      {
        source: "constant",
        coefficient: 0.002,
        transform: (_: any, state: any) => {
          const cortisol = state.signals.cortisol ?? 15;
          return cortisol > 18 ? 0.3 : 0;
        },
      },
    ],
    clearance: [{ type: "linear", rate: 0.02 }],
    couplings: [],
  },
};

export const anandamide: SignalDefinition = {
  key: "anandamide",
  type: "neurotransmitter",
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
