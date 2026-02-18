import type { SignalDefinition, DynamicsContext } from "../../../engine";
import { minuteToPhase, hourToPhase, sigmoidPhase } from "../../utils";

export const glutamate: SignalDefinition = {
  key: "glutamate",
  type: "neurotransmitter",
  label: "Glutamate",
  isPremium: true,
  unit: "µM",
  description:
    "The most abundant 'on' switch in your brain. Glutamate is the gas pedal for neural activity, playing a central role in learning, memory, and fast communication between neurons. Balance is key, as too much can cause over-excitement.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      const ageFactor = 1.0 + Math.max(0, ctx.subject.age - 40) * 0.002;
      const p = minuteToPhase(ctx.circadianMinuteOfDay);
      const wakeDrive = sigmoidPhase(p, hourToPhase(9), 1.0);
      return (2.5 + 4.16 * wakeDrive) * ageFactor;
    },
    tau: 60,
    production: [
      {
        source: "constant",
        coefficient: 0.003,
        transform: (_: any, state) =>
          (state.auxiliary.glutamatePool ?? 0.7) * 5,
      },
    ],
    clearance: [{ type: "enzyme-dependent", rate: 0.004, enzyme: "GLT1" }],
    couplings: [
      { source: "norepi", effect: "stimulate", strength: 0.00067 },
      { source: "gaba", effect: "inhibit", strength: 0.0014 },
    ],
  },
  initialValue: 5,
  min: 0,
  max: 100,
  display: {
    referenceRange: { min: 1, max: 10 },
  },
  monitors: [
    {
      id: "glutamate_excitotoxicity_risk",
      signal: "glutamate",
      pattern: { type: "exceeds", value: 15, sustainedMins: 30 },
      outcome: "critical",
      message: "Excitotoxicity Risk (High Glutamate)",
      description:
        "Extremely high glutamate can be toxic to neurons. Often associated with severe stress or neurological events.",
    },
  ],
};
