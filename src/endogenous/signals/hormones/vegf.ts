import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const vegf: SignalDefinition = {
  key: "vegf",
  type: "hormone",
  label: "VEGF",
  isPremium: true,
  unit: "pg/mL",
  description:
    "Vascular Endothelial Growth Factor drives the formation of new blood vessels (angiogenesis). Released in response to tissue injury, hypoxia, and exercise.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      const ageFactor = Math.max(0.7, 1.0 - Math.max(0, ctx.subject.age - 40) * 0.005);
      const bmiFactor = ctx.physiology.bmi <= 25 ? 1.0 : 1.0 + (ctx.physiology.bmi - 25) * 0.01;
      return 100 * ageFactor * bmiFactor;
    },
    tau: 360, // Responds over hours to injury/hypoxia signals
    production: [
      {
        source: "constant",
        coefficient: 0.01,
        transform: (_: any, state) => {
          // Acute inflammation stimulates VEGF (wound healing response)
          const infl = state.signals.inflammation ?? 1.0;
          return infl > 1.5 ? (infl - 1.5) * 0.5 : 0;
        },
      },
      { source: "growthHormone", coefficient: 0.02 },
    ],
    clearance: [{ type: "linear", rate: 0.008 }],
    couplings: [{ source: "cortisol", effect: "inhibit", strength: 0.05 }],
  },
  initialValue: (ctx) => 100 * Math.max(0.7, 1.0 - Math.max(0, ctx.subject.age - 40) * 0.005) * (ctx.physiology.bmi <= 25 ? 1.0 : 1.0 + (ctx.physiology.bmi - 25) * 0.01),
  min: 0,
  max: 1000,
  display: {
    referenceRange: { min: 50, max: 200 },
  },
  monitors: [
    {
      id: "vegf_healing",
      signal: "vegf",
      pattern: { type: "exceeds", value: 180, sustainedMins: 60 },
      outcome: "win",
      message: "Active Tissue Healing (VEGF)",
      description:
        "VEGF is elevated, promoting new blood vessel formation and tissue repair.",
    },
    {
      id: "vegf_chronic_high",
      signal: "vegf",
      pattern: { type: "high_exposure", windowMins: 1440, threshold: 250000 },
      outcome: "warning",
      message: "Chronically elevated VEGF",
      description:
        "Sustained high VEGF may indicate ongoing tissue damage or chronic inflammation.",
    },
  ],
};
