import type { BioSystemDef } from "./types";

export const growth: BioSystemDef = {
  id: "growth",
  label: "Growth & Recovery",
  icon: "💪",
  signals: [
    "strengthReadiness",
    "mtor",
    "growthHormone",
    "bdnf",
  ],
  auxiliary: [
    "muscleProteinSynthesis",
    "muscleMass",
    "ghReserve",
    "bdnfExpression",
    "mitochondrialDensity",
  ],
  description:
    "The anabolic and restorative pathways that rebuild tissue and enhance physical capacity.",
  applicationDescription:
    "Track muscle building, physical recovery, and overall growth signaling.",
};
