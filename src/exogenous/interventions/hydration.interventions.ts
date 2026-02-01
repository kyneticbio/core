import type { InterventionDef } from "../../types";
import { Agents } from "../agents";

export const HYDRATION_INTERVENTIONS: InterventionDef[] = [
  {
    key: "water",
    label: "Water / Hydration",
    icon: "💧",
    defaultDurationMin: 10,
    params: [
      {
        key: "ml",
        label: "Amount",
        unit: "ml",
        type: "slider",
        min: 100,
        max: 1000,
        step: 50,
        default: 250,
      },
    ],
    pharmacology: (params: any) => Agents.Water(Number(params.ml) || 250),
    group: "Nutrition",
    categories: ["food"],
    goals: ["energy", "recovery"],
  },
];
