import type { InterventionDef } from "../../types";
import { Agents } from "../agents";

export const PEPTIDE_INTERVENTIONS: InterventionDef[] = [
  // ===================== GLP-1 Agonists =====================

  {
    key: "semaglutide",
    label: "Semaglutide (Ozempic)",
    icon: "💉",
    defaultDurationMin: 10080, // 7 days (weekly injection)
    params: [
      {
        key: "mg",
        label: "Dose",
        unit: "mg",
        type: "slider",
        min: 0.25,
        max: 2.4,
        step: 0.25,
        default: 0.5,
        hint: "Typical maintenance: 0.5–1.0 mg/wk (Ozempic), up to 2.4 mg/wk (Wegovy)",
      },
    ],
    pharmacology: (params: any) =>
      Agents.Semaglutide(Number(params.mg) || 0.5),
    group: "GLP-1 Agonists",
    categories: ["medications"],
    goals: ["weight", "metabolic"],
  },

  {
    key: "tirzepatide",
    label: "Tirzepatide (Mounjaro)",
    icon: "💉",
    defaultDurationMin: 10080,
    params: [
      {
        key: "mg",
        label: "Dose",
        unit: "mg",
        type: "slider",
        min: 2.5,
        max: 15,
        step: 2.5,
        default: 5,
        hint: "Start at 2.5 mg/wk, titrate up to 15 mg/wk",
      },
    ],
    pharmacology: (params: any) =>
      Agents.Tirzepatide(Number(params.mg) || 5),
    group: "GLP-1 Agonists",
    categories: ["medications"],
    goals: ["weight", "metabolic"],
  },

  {
    key: "retatrutide",
    label: "Retatrutide",
    icon: "💉",
    defaultDurationMin: 10080,
    params: [
      {
        key: "mg",
        label: "Dose",
        unit: "mg",
        type: "slider",
        min: 1,
        max: 12,
        step: 1,
        default: 4,
        hint: "Triple agonist (GLP-1/GIP/glucagon). Phase 2 doses: 1–12 mg/wk",
      },
    ],
    pharmacology: (params: any) =>
      Agents.Retatrutide(Number(params.mg) || 4),
    group: "GLP-1 Agonists",
    categories: ["medications"],
    goals: ["weight", "metabolic"],
  },

  // ===================== Repair Peptides =====================

  {
    key: "bpc157",
    label: "BPC-157",
    icon: "🧬",
    defaultDurationMin: 480, // ~8 hours (twice daily typical)
    params: [
      {
        key: "mcg",
        label: "Dose",
        unit: "mcg",
        type: "slider",
        min: 100,
        max: 1000,
        step: 50,
        default: 250,
        hint: "Typical research dose: 200–500 mcg subcutaneous, 1–2x daily",
      },
    ],
    pharmacology: (params: any) =>
      Agents.BPC157(Number(params.mcg) || 250),
    group: "Repair Peptides",
    categories: ["medications"],
    goals: ["recovery", "repair"],
  },

  {
    key: "tb500",
    label: "TB-500",
    icon: "🧬",
    defaultDurationMin: 720, // ~12 hours
    params: [
      {
        key: "mg",
        label: "Dose",
        unit: "mg",
        type: "slider",
        min: 1,
        max: 10,
        step: 0.5,
        default: 2.5,
        hint: "Typical research dose: 2–5 mg subcutaneous, 2x per week",
      },
    ],
    pharmacology: (params: any) =>
      Agents.TB500(Number(params.mg) || 2.5),
    group: "Repair Peptides",
    categories: ["medications"],
    goals: ["recovery", "repair"],
  },
];
