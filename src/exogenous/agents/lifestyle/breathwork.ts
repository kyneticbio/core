import type { PharmacologyDef } from "../../../engine";

export const Breathwork = (
  type: "calm" | "balance" | "activation",
  intensity: number = 1.0
): PharmacologyDef => {
  let vagal = 0.5 * intensity;
  let norepi = 0;
  let cortisol = 0;

  if (type === "calm") {
    vagal = 3.0 * intensity;
    norepi = -80 * intensity;
    cortisol = -10 * intensity;
  } else if (type === "balance") {
    vagal = 1.0 * intensity;
    norepi = -5 * intensity;
  } else if (type === "activation") {
    vagal = 0.2 * intensity;
    norepi = 150 * intensity;
    cortisol = 10 * intensity;
  }

  const pd: any[] = [
    {
      target: "vagal",
      mechanism: "agonist",
      intrinsicEfficacy: vagal,
      tau: 2,
    },
    {
      target: "norepi",
      mechanism: type === "activation" ? "agonist" : "antagonist",
      intrinsicEfficacy: Math.abs(norepi),
      tau: 2,
    },
    {
      target: "adrenaline",
      mechanism: type === "activation" ? "agonist" : "antagonist",
      intrinsicEfficacy: type === "calm" ? 100 * intensity : 0,
      tau: 2,
    },
    {
      target: "cortisol",
      mechanism: type === "activation" ? "agonist" : "antagonist",
      intrinsicEfficacy: Math.abs(cortisol),
      tau: 15,
    },
  ];

  if (type === "activation") {
    pd.push({
      target: "dopamine",
      mechanism: "agonist",
      intrinsicEfficacy: 15 * intensity,
      tau: 5,
    });
  }

  return {
    molecule: { name: "Breathwork", molarMass: 0 },
    pk: { model: "activity-dependent", delivery: "continuous", massMg: 0 },
    pd,
  };
};