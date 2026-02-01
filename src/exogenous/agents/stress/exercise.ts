import type { PharmacologyDef } from "../../../engine";

// === Scientific Constants ===
const EXERCISE_NOREPI = { AMPLITUDE: 45.0 } as const;
const EXERCISE_ADRENALINE = { AMPLITUDE: 200.0 } as const;
const EXERCISE_CORTISOL = { AMPLITUDE: 10.0 } as const;
const EXERCISE_GLUCOSE = { UPTAKE_AMPLITUDE: -15.0 } as const;
const EXERCISE_BDNF = { AMPLITUDE: 25.0 } as const;
const EXERCISE_GH = { AMPLITUDE: 8.0 } as const;

export const SympatheticStress = (intensity: number): PharmacologyDef => ({
  molecule: { name: "Sympathetic Drive", molarMass: 0 },
  pk: { model: "activity-dependent", delivery: "continuous", massMg: 0 },
  pd: [
    {
      target: "norepi",
      mechanism: "agonist",
      intrinsicEfficacy: EXERCISE_NOREPI.AMPLITUDE * intensity * 6.6,
      unit: "pg/mL",
      tau: 5,
    },
    {
      target: "adrenaline",
      mechanism: "agonist",
      intrinsicEfficacy: EXERCISE_ADRENALINE.AMPLITUDE * intensity,
      unit: "pg/mL",
      tau: 2,
    },
          {
            target: "cortisol",
            mechanism: "agonist",
            intrinsicEfficacy: EXERCISE_CORTISOL.AMPLITUDE * intensity,
            unit: "µg/dL",
            tau: 15,
          },
          {
            target: "burnRate",
            mechanism: "agonist",
            intrinsicEfficacy: 8 * intensity, // Base calorie burn for all exercise
            unit: "kcal/min",
            tau: 5,
          },
        ],
      });
    
    export const MetabolicLoad = (intensity: number): PharmacologyDef => ({
      molecule: { name: "Metabolic Load", molarMass: 0 },
      pk: { model: "activity-dependent", delivery: "continuous", massMg: 0 },
      pd: [
        {
          target: "ampk",
          mechanism: "agonist",
          intrinsicEfficacy: 20 * intensity,
          unit: "x",
          tau: 10,
        },
        {
          target: "glucose",
          mechanism: "antagonist",
          intrinsicEfficacy: Math.abs(EXERCISE_GLUCOSE.UPTAKE_AMPLITUDE) * intensity,
          unit: "mg/dL",
          tau: 5,
        },
        {
          target: "bdnf",
          mechanism: "agonist",
          intrinsicEfficacy: EXERCISE_BDNF.AMPLITUDE * intensity,
          unit: "ng/mL",
          tau: 30,
        },
        {
          target: "burnRate",
          mechanism: "agonist",
          intrinsicEfficacy: 4 * intensity, // Additional burn for high metabolic demand
          unit: "kcal/min",
          tau: 5,
        },
      ],
    });
export const MechanicalLoad = (intensity: number): PharmacologyDef => ({
  molecule: { name: "Mechanical Load", molarMass: 0 },
  pk: { model: "activity-dependent", delivery: "continuous", massMg: 0 },
  pd: [
    {
      target: "mtor",
      mechanism: "agonist",
      intrinsicEfficacy: 15 * intensity,
      unit: "x",
      tau: 120,
    },
    {
      target: "testosterone",
      mechanism: "agonist",
      intrinsicEfficacy: 5 * intensity,
      unit: "ng/dL",
      tau: 60,
    },
    {
      target: "growthHormone",
      mechanism: "agonist",
      intrinsicEfficacy: EXERCISE_GH.AMPLITUDE * intensity,
      unit: "ng/mL",
      tau: 30,
    },
    {
      target: "inflammation",
      mechanism: "agonist",
      intrinsicEfficacy: 0.5 * intensity,
      unit: "x",
      tau: 240,
    },
    {
      target: "strengthReadiness",
      mechanism: "antagonist",
      intrinsicEfficacy: 0.8 * intensity, // Immediate fatigue
      unit: "x",
      tau: 5,
    },
  ],
});

/**
 * Combined Exercise agent helper
 */
export const Exercise = (intensity: number): PharmacologyDef[] => [
  SympatheticStress(intensity),
  MetabolicLoad(intensity),
  MechanicalLoad(intensity),
];

/**
 * CARDIO (Zone-based)
 * Zone 1: Recovery/warm-up (very low intensity)
 * Zone 2: Aerobic base / fat burning (60-70% max HR) - optimal for mitochondrial density
 * Zone 3: Tempo (70-80% max HR)
 * Zone 4: Threshold (80-90% max HR)
 * Zone 5: VO2max / anaerobic (90-100% max HR)
 */
export const Cardio = (
  zone: 1 | 2 | 3 | 4 | 5 = 2,
  durationMin: number = 30,
): PharmacologyDef => {
  // Zone-based intensity scaling
  const zoneIntensity: Record<number, number> = {
    1: 0.3,
    2: 0.5,
    3: 0.7,
    4: 0.85,
    5: 1.0,
  };
  const intensity = zoneIntensity[zone];

  // Zone 2 specifically optimizes fat oxidation and mitochondrial biogenesis
  const isZone2 = zone === 2;
  const fatOxMultiplier = isZone2 ? 1.5 : 1.0;
  const mitoMultiplier = isZone2 ? 2.0 : 1.0;

  // Higher zones shift to glycolytic metabolism
  const glycolyticShift = zone >= 4 ? (zone - 3) * 0.3 : 0;

  return {
    molecule: { name: `Zone ${zone} Cardio`, molarMass: 0 },
    pk: { model: "activity-dependent", delivery: "continuous", massMg: 0 },
    pd: [
      // Sympathetic activation scales with zone
      {
        target: "norepi",
        mechanism: "agonist",
        intrinsicEfficacy: EXERCISE_NOREPI.AMPLITUDE * intensity * 4,
        unit: "pg/mL",
        tau: 5,
      },
      {
        target: "adrenaline",
        mechanism: "agonist",
        intrinsicEfficacy: EXERCISE_ADRENALINE.AMPLITUDE * intensity * 0.8,
        unit: "pg/mL",
        tau: 3,
      },
      // Caloric burn - scales with intensity
      {
        target: "burnRate",
        mechanism: "agonist",
        intrinsicEfficacy: 6 + (zone * 2), // ~8 kcal/min zone 1, ~16 kcal/min zone 5
        unit: "kcal/min",
        tau: 3,
      },
      // AMPK activation - key for fat oxidation and mitochondrial biogenesis
      {
        target: "ampk",
        mechanism: "agonist",
        intrinsicEfficacy: (15 * intensity * fatOxMultiplier),
        unit: "x",
        tau: 15,
        description: "Metabolic sensor activation - drives fat oxidation and mitochondrial adaptation.",
      },
      // Glucose uptake increases with intensity
      {
        target: "glucose",
        mechanism: "antagonist",
        intrinsicEfficacy: Math.abs(EXERCISE_GLUCOSE.UPTAKE_AMPLITUDE) * intensity * (1 + glycolyticShift),
        unit: "mg/dL",
        tau: 5,
      },
      // BDNF - cardio is excellent for brain health
      {
        target: "bdnf",
        mechanism: "agonist",
        intrinsicEfficacy: EXERCISE_BDNF.AMPLITUDE * intensity * 1.2,
        unit: "ng/mL",
        tau: 30,
        description: "Cardio-induced neuroplasticity factor.",
      },
      // Cortisol - higher in intense zones
      {
        target: "cortisol",
        mechanism: "agonist",
        intrinsicEfficacy: EXERCISE_CORTISOL.AMPLITUDE * intensity * (zone >= 4 ? 1.5 : 0.8),
        unit: "µg/dL",
        tau: 20,
      },
      // Mitochondrial density signal - Zone 2 is optimal
      {
        target: "mitochondrialDensity",
        mechanism: "agonist",
        intrinsicEfficacy: 0.00005 * intensity * mitoMultiplier * (durationMin / 30),
        unit: "x",
        tau: 60,
        description: "Long-term adaptation improving cellular energy production.",
      },
    ],
  };
};
