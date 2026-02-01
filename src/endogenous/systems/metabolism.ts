import type { BioSystemDef } from "./types";

export const metabolism: BioSystemDef = {
  id: "metabolic",
  label: "Metabolic System",
  icon: "⚡",
  signals: [
    "insulin",
    "glucagon",
    "leptin",
    "ghrelin",
    "glp1",
    "glucose",
    "ketone",
    "energy",
    "mtor",
    "ampk",
    "caloricIntake",
    "burnRate",
    "netEnergy",
    "weight",
    "energyAvailability",
    "thermogenesis",
    "hydration",
    "heatShockProteins",
  ],
  auxiliary: [
    "hepaticGlycogen",
    "insulinAction",
    "fatOxidationRate",
    "fatMass",
    "metabolicAdaptation",
    "muscleGlycogen",
    "mitochondrialDensity",
  ],
  description:
    "The machinery that converts food into energy and manages fuel storage and utilization across the body.",
  applicationDescription:
    "Observe how fueling strategies affect energy production and storage.",
};
