import type { SignalDefinition, DynamicsContext } from "../../../engine";
import { minuteToPhase, hourToPhase, sigmoidPhase } from "../../utils";

export const gaba: SignalDefinition = {
  key: "gaba",
  type: "neurotransmitter",
  label: "GABA",
  isPremium: true,
  unit: "nM",
  description:
    "The brain's primary 'off' switch. GABA reduces the activity of neurons, acting as a natural brake to prevent overstimulation. It's essential for relaxation, reducing anxiety, and falling asleep.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      const ageFactor = Math.max(0.7, 1.0 - Math.max(0, ctx.subject.age - 30) * 0.004);
      const sexFactor = ctx.subject.sex === "female" ? 1.15 : 1.0;
      const p = minuteToPhase(ctx.circadianMinuteOfDay);
      const eveningRise = sigmoidPhase(p, hourToPhase(21), 1.0);
      return (240.0 + 180.0 * eveningRise) * ageFactor * sexFactor;
    },
    tau: 120,
    production: [
      {
        source: "constant",
        coefficient: 0.0015,
        transform: (_: any, state) => (state.auxiliary.gabaPool ?? 0.7) * 300,
      },
    ],
    clearance: [{ type: "enzyme-dependent", rate: 0.002, enzyme: "GAT1" }],
    couplings: [
      { source: "melatonin", effect: "stimulate", strength: 0.6 },
      { source: "glutamate", effect: "inhibit", strength: 3.6 },
    ],
  },
  initialValue: 300,
  min: 0,
  max: 2000,
  display: {
    referenceRange: { min: 100, max: 500 },
  },
  monitors: [
    {
      id: "gaba_relaxation",
      signal: "gaba",
      pattern: { type: "exceeds", value: 600, sustainedMins: 30 },
      outcome: "win",
      message: "Deep Relaxation (GABA)",
      description:
        "High GABA levels are promoting calm and reducing neural over-activity.",
    },
    {
      id: "gaba_deficiency",
      signal: "gaba",
      pattern: { type: "falls_below", value: 150, sustainedMins: 60 },
      outcome: "warning",
      message: "Neural Over-excitement (Low GABA)",
      description:
        "Low GABA can lead to anxiety, restlessness, and racing thoughts.",
    },
  ],
};
