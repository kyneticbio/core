import type { PharmacologyDef } from "../../../engine";

export const SexualActivity = (
  type: "partnered" | "solo",
  orgasm: boolean
): PharmacologyDef => {
  const partnerFactor = type === "partnered" ? 2.0 : 1.0;
  const orgasmFactor = orgasm ? 1.0 : 0.2;

  return {
    molecule: { name: "Sexual Activity", molarMass: 0 },
    pk: { model: "activity-dependent", delivery: "continuous", massMg: 0 },
    pd: [
      {
        target: "dopamine",
        mechanism: "agonist",
        intrinsicEfficacy: 30 * partnerFactor,
        tau: 5,
      },
      {
        target: "oxytocin",
        mechanism: "agonist",
        intrinsicEfficacy: (type === "partnered" ? 50 : 10) * orgasmFactor,
        tau: 15,
      },
      {
        target: "prolactin",
        mechanism: "agonist",
        intrinsicEfficacy: orgasm ? 40 : 5,
        tau: 5,
      },
      {
        target: "testosterone",
        mechanism: "agonist",
        intrinsicEfficacy: 15 * partnerFactor,
        tau: 15,
      },
      {
        target: "cortisol",
        mechanism: "antagonist",
        intrinsicEfficacy: 10 * orgasmFactor,
        tau: 30,
      },
      {
        target: "endorphin",
        mechanism: "agonist",
        intrinsicEfficacy: 2.0 * orgasmFactor,
        tau: 10,
      },
    ],
  };
};