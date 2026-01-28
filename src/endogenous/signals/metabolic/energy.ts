import type { SignalDefinition, AuxiliaryDefinition } from "../../../engine";

/**
 * CALORIC INTAKE
 * Real-time absorption flux of calories from food.
 */
export const caloricIntake: SignalDefinition = {
  key: "caloricIntake",
  label: "Caloric Intake",
  unit: "kcal/min",
  description: "Real-time absorption of calories from food.",
  idealTendency: "none",
  dynamics: {
    setpoint: (ctx: any, state: any) => 0,
    tau: 5,
    production: [], // Driven by Food Interventions
    clearance: [{ type: "linear", rate: 0.2 }],
    couplings: [],
  },
  initialValue: 0,
  min: 0,
  max: 100,
  display: {
    referenceRange: { min: 0, max: 10 },
  },
};

/**
 * BURN RATE
 * Real-time expenditure flux (BMR + Activity).
 */
export const burnRate: SignalDefinition = {
  key: "burnRate",
  label: "Burn Rate",
  unit: "kcal/min",
  description: "Real-time caloric expenditure.",
  idealTendency: "none",
  dynamics: {
    setpoint: (ctx: any) => {
      // Base metabolic rate in kcal/min
      const bmr = ctx.physiology?.bmr ?? 1660;
      return bmr / 1440;
    },
    tau: 15,
    production: [], // Driven by Exercise Interventions
    clearance: [], // No clearance - signal follows setpoint directly
    couplings: [],
  },
  initialValue: 1.15,
  min: 0,
  max: 50,
  display: {
    referenceRange: { min: 1, max: 10 },
  },
};

/**
 * NET ENERGY
 * Real-time balance between intake and expenditure.
 * Direct calculation: caloricIntake - burnRate
 */
export const netEnergy: SignalDefinition = {
  key: "netEnergy",
  label: "Net Energy",
  unit: "kcal/min",
  description: "The current balance between caloric intake and expenditure.",
  idealTendency: "none",
  dynamics: {
    setpoint: (ctx: any, state: any) => {
      // Direct calculation of net energy balance
      const intake = state.signals.caloricIntake ?? 0;
      const burn = state.signals.burnRate ?? 1.15;
      return intake - burn;
    },
    tau: 2,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: -1.15,
  min: -50,
  max: 50,
  display: {
    referenceRange: { min: -5, max: 5 },
  },
};

/**
 * FAT OXIDATION RATE
 * Real-time rate of fat burning.
 */
export const fatOxidationRate: AuxiliaryDefinition = {
  key: "fatOxidationRate",
  dynamics: {
    setpoint: (ctx: any, state: any) => 0,
    tau: 60,
    production: [
      {
        source: "constant",
        coefficient: 1.0,
        transform: (_: any, state: any) => {
          const ampk = state.signals.ampk;
          const insulin = state.signals.insulin;
          const net = state.signals.netEnergy;
          
          // Fasting baseline + Exercise boost
          const activeOxidation = ampk > 1.0 ? 0.01 * (ampk - 1.0) : 0;
          const deficitOxidation = net < 0 ? Math.abs(net) * 0.11 : 0;
          const insulinInhibition = Math.max(0, 1 - insulin / 15);
          
          return (activeOxidation + deficitOxidation) * insulinInhibition;
        },
      },
    ],
    clearance: [{ type: "linear", rate: 0.01 }],
  },
  initialValue: 0,
};

/**
 * FAT MASS (AUXILIARY)
 * Tracks the cumulative delta in fat mass (kg).
 * Tau is set to 30 days (43200 mins).
 */
export const fatMass: AuxiliaryDefinition = {
  key: "fatMass",
  dynamics: {
    setpoint: (ctx: any, state: any) => 0,
    tau: 43200, 
    production: [
      {
        source: "constant",
        coefficient: 1.0,
        transform: (_: any, state: any) => {
          const net = state.signals.netEnergy;
          const insulin = state.signals.insulin;
          const fox = state.auxiliary?.fatOxidationRate ?? 0;
          
          // 1kg fat ~= 7700 kcal
          const gain = net > 0 && insulin > 10 ? net / 7700 : 0;
          const loss = fox / 7700;

          return gain - loss;
        },
      },
    ],
    clearance: [],
  },
  initialValue: 0,
};

/**
 * WEIGHT
 * Readout signal for display.
 */
export const weight: SignalDefinition = {
  key: "weight",
  label: "Weight",
  unit: "kg",
  description: "Total simulated body weight.",
  idealTendency: "none",
  dynamics: {
    setpoint: (ctx: any, state: any) => {
      const base = ctx.subject?.weight || 70;
      const fatDelta = state.auxiliary?.fatMass || 0;
      const muscleDelta = state.auxiliary?.muscleMass || 0;
      return base + fatDelta + muscleDelta;
    },
    tau: 60,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx: any) => ctx.subject?.weight || 70,
  display: {
    referenceRange: { min: 50, max: 100 },
  },
};

/**
 * ENERGY AVAILABILITY (EA)
 * How much fuel is left for organs after exercise.
 * Formula: (Calories In - Exercise Burn) / Lean Mass
 * Optimal range: 30-45 kcal/kg LBM/day
 */
export const energyAvailability: SignalDefinition = {
  key: "energyAvailability",
  label: "Energy Availability",
  unit: "kcal/kg",
  description: "How much energy is available for vital functions after exercise. Critical for metabolic health.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx: any, state: any) => {
      const intake = state.signals.caloricIntake ?? 0;
      const burn = state.signals.burnRate ?? 1.15;
      const bmrMin = (ctx.physiology?.bmr ?? 1660) / 1440;

      // Exercise burn is the portion above BMR
      const exerciseBurn = Math.max(0, burn - bmrMin);

      // Convert from kcal/min to kcal/day and normalize by lean mass
      const leanMass = (ctx.subject?.weight ?? 70) * 0.8; // Rough LBM estimate
      const intakeDaily = intake * 1440;
      const exerciseDaily = exerciseBurn * 1440;

      // EA = (Intake - Exercise) / Lean Mass
      const ea = (intakeDaily - exerciseDaily) / leanMass;
      return Math.max(0, ea);
    },
    tau: 30,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: 30,
  min: 0,
  max: 100,
  display: {
    referenceRange: { min: 30, max: 45 },
  },
};

/**
 * METABOLIC ADAPTATION
 * Tracks the body's metabolic rate adaptation based on energy availability.
 * Drops in "starvation mode" (low EA), rises with "high flux" (high throughput).
 * Value of 1.0 = normal, <1.0 = suppressed, >1.0 = elevated
 */
export const metabolicAdaptation: AuxiliaryDefinition = {
  key: "metabolicAdaptation",
  dynamics: {
    setpoint: (ctx: any, state: any) => 1.0,
    tau: 10080, // 7 days - metabolic adaptation is slow
    production: [
      {
        source: "constant",
        coefficient: 1.0,
        transform: (_: any, state: any) => {
          const ea = state.signals.energyAvailability ?? 30;
          const leptin = state.signals.leptin ?? 15;

          // Low EA triggers metabolic suppression
          // EA < 20 starts suppression, EA < 10 is severe
          const starvationFactor = ea < 20
            ? -0.0005 * (20 - ea) // Slow drift down
            : 0;

          // High flux (high EA + high burn) elevates metabolism
          const burn = state.signals.burnRate ?? 1.15;
          const fluxFactor = ea > 35 && burn > 2.0
            ? 0.0001 * (burn - 2.0) // Slight drift up with high flux
            : 0;

          // Leptin signals energy stores
          const leptinFactor = leptin < 5
            ? -0.0002 * (5 - leptin)
            : 0;

          return starvationFactor + fluxFactor + leptinFactor;
        },
      },
    ],
    clearance: [],
  },
  initialValue: 1.0,
};

/**
 * THERMOGENESIS
 * Cold-induced and adaptive thermogenesis from brown adipose tissue (BAT).
 * Increases caloric expenditure through heat production.
 */
export const thermogenesis: SignalDefinition = {
  key: "thermogenesis",
  label: "Thermogenesis",
  unit: "kcal/min",
  description: "Heat production from brown fat activation and cold exposure.",
  idealTendency: "none",
  dynamics: {
    setpoint: (ctx: any, state: any) => {
      // Baseline thermogenesis from thyroid
      const thyroid = state.signals.thyroid ?? 1.5;
      return 0.05 * (thyroid / 1.5);
    },
    tau: 10,
    production: [],
    clearance: [{ type: "linear", rate: 0.1 }],
    couplings: [
      { source: "norepi", effect: "stimulate", strength: 0.01 },
      { source: "adrenaline", effect: "stimulate", strength: 0.005 },
    ],
  },
  initialValue: 0.05,
  min: 0,
  max: 2.0,
  display: {
    referenceRange: { min: 0, max: 0.5 },
  },
};

/**
 * MUSCLE GLYCOGEN
 * Stored glucose in muscles, separate from hepatic glycogen.
 * Depleted by exercise, refilled by carbs + insulin.
 * Value 0-1 (empty to full).
 */
export const muscleGlycogen: AuxiliaryDefinition = {
  key: "muscleGlycogen",
  dynamics: {
    setpoint: (ctx: any, state: any) => 0.8,
    tau: 480, // 8 hours to refill
    production: [
      {
        source: "constant",
        coefficient: 1.0,
        transform: (_: any, state: any) => {
          const glucose = state.signals.glucose ?? 90;
          const insulin = state.signals.insulin ?? 8;
          const glycogen = state.auxiliary?.muscleGlycogen ?? 0.8;

          // Refill when glucose and insulin are elevated
          return insulin > 10 && glucose > 100
            ? 0.002 * (glucose - 100) * (1 - glycogen)
            : 0;
        },
      },
    ],
    clearance: [
      {
        type: "linear",
        rate: 1.0,
        transform: (_: any, state: any) => {
          // Exercise depletes muscle glycogen
          const burn = state.signals.burnRate ?? 1.15;
          const bmrMin = 1.15;
          const exerciseIntensity = Math.max(0, burn - bmrMin);
          return exerciseIntensity > 0 ? 0.005 * exerciseIntensity : 0;
        },
      },
    ],
  },
  initialValue: 0.8,
};

/**
 * HYDRATION STATUS
 * Tracks fluid balance affecting performance and cognition.
 * Value 0-1 (dehydrated to optimal).
 */
export const hydration: SignalDefinition = {
  key: "hydration",
  label: "Hydration",
  unit: "index",
  description: "Fluid balance status affecting performance and cognitive function.",
  idealTendency: "higher",
  dynamics: {
    setpoint: (ctx: any, state: any) => 0.95,
    tau: 120,
    production: [], // Driven by water intake
    clearance: [
      {
        type: "linear",
        rate: 0.002, // Gradual loss through respiration/perspiration
      },
    ],
    couplings: [],
  },
  initialValue: 0.95,
  min: 0,
  max: 1.0,
  display: {
    referenceRange: { min: 0.8, max: 1.0 },
  },
};

/**
 * HEAT SHOCK PROTEINS (HSP)
 * Cellular repair proteins induced by thermal stress, exercise, and fasting.
 * Promotes longevity and cellular resilience.
 */
export const heatShockProteins: SignalDefinition = {
  key: "heatShockProteins",
  label: "Heat Shock Proteins",
  unit: "fold-change",
  description: "Cellular stress response proteins that promote repair and longevity.",
  idealTendency: "higher",
  dynamics: {
    setpoint: (ctx: any, state: any) => 1.0,
    tau: 360, // 6 hours
    production: [],
    clearance: [{ type: "linear", rate: 0.005 }],
    couplings: [],
  },
  initialValue: 1.0,
  min: 0,
  max: 10,
  display: {
    referenceRange: { min: 1.0, max: 3.0 },
  },
};

/**
 * MITOCHONDRIAL DENSITY
 * Tracks the efficiency of cellular energy production.
 * Increases with Zone 2 cardio, decreases with inactivity.
 */
export const mitochondrialDensity: AuxiliaryDefinition = {
  key: "mitochondrialDensity",
  dynamics: {
    setpoint: (ctx: any, state: any) => 1.0,
    tau: 43200, // 30 days - slow adaptation
    production: [
      {
        source: "constant",
        coefficient: 1.0,
        transform: (_: any, state: any) => {
          const ampk = state.signals.ampk ?? 1.0;
          // AMPK activation from moderate exercise drives mitochondrial biogenesis
          return ampk > 1.2 ? 0.00001 * (ampk - 1.2) : 0;
        },
      },
    ],
    clearance: [
      {
        type: "linear",
        rate: 0.000001, // Very slow decay with inactivity
      },
    ],
  },
  initialValue: 1.0,
};