import type { AuxiliaryDefinition, DynamicsContext } from "../../../engine";

export const insulinSensitivity: AuxiliaryDefinition = {
  key: "insulinSensitivity",
  dynamics: {
    setpoint: (ctx: DynamicsContext, state) => {
      const bmi = ctx.physiology?.bmi ?? 25;
      const fastingInsulin =
        ctx.subject.bloodwork?.metabolic?.fasting_insulin_uIU_mL ?? 8;
      const bmiFactor =
        bmi <= 25
          ? 1.0
          : bmi <= 30
            ? 1.0 - (bmi - 25) * 0.04 // 0.8 at BMI 30
            : Math.max(0.4, 0.8 - (bmi - 30) * 0.04); // steeper above 30
      const insulinFactor =
        fastingInsulin <= 10
          ? 1.0
          : Math.max(0.5, 1.0 - (fastingInsulin - 10) * 0.02);
      return bmiFactor * insulinFactor;
    },
    tau: 43200, // 30 days — changes slowly
    production: [],
    clearance: [],
  },
  initialValue: (ctx: DynamicsContext) => {
    const bmi = ctx.physiology?.bmi ?? 25;
    const fastingInsulin =
      ctx.subject.bloodwork?.metabolic?.fasting_insulin_uIU_mL ?? 8;
    const bmiFactor =
      bmi <= 25
        ? 1.0
        : bmi <= 30
          ? 1.0 - (bmi - 25) * 0.04
          : Math.max(0.4, 0.8 - (bmi - 30) * 0.04);
    const insulinFactor =
      fastingInsulin <= 10
        ? 1.0
        : Math.max(0.5, 1.0 - (fastingInsulin - 10) * 0.02);
    return bmiFactor * insulinFactor;
  },
  min: 0.2,
  max: 1.5,
};

export const insulinAction: AuxiliaryDefinition = {
  key: "insulinAction",
  dynamics: {
    setpoint: (ctx, state) => 0,
    tau: 40,
    production: [
      {
        source: "insulin",
        coefficient: 0.000013,
        transform: (I: any, state: any) => {
          const sensitivity = state.auxiliary?.insulinSensitivity ?? 1.0;
          return Math.max(0, I - 8.0) * sensitivity;
        },
      },
    ],
    clearance: [],
  },
  initialValue: 0,
};

export const cypActivity: AuxiliaryDefinition = {
  key: "cypActivity",
  dynamics: {
    setpoint: (ctx, state) => {
      const estrogen = state.signals?.estrogen ?? 40;
      const progesterone = state.signals?.progesterone ?? 0.5;
      const estrogenEffect = Math.min(0.2, (estrogen - 40) / 2000);
      const progEffect = Math.min(0.1, (progesterone - 0.5) / 100) * 0.5;
      return 1.0 + estrogenEffect - progEffect;
    },
    tau: 1440, // 1 day
    production: [],
    clearance: [],
  },
  initialValue: 1.0,
  min: 0.6,
  max: 1.4,
};

export const hepaticGlycogen: AuxiliaryDefinition = {
  key: "hepaticGlycogen",
  dynamics: {
    setpoint: (ctx, state) => 0.7,
    tau: 1440,
    production: [
      {
        source: "constant",
        coefficient: 1.0,
        transform: (_: any, state) => {
          const G = state.signals.glucose;
          const I = state.signals.insulin;
          const glycogen = state.auxiliary.hepaticGlycogen;
          return I > 8 && G > 100 ? 0.001 * (G - 100) * (1 - glycogen) : 0;
        },
      },
    ],
    clearance: [
      {
        type: "linear",
        rate: 1.0,
        transform: (_: any, state) => {
          const G = state.signals.glucose;
          return G < 70 ? (0.5 * (70 - G)) / 70 : 0;
        },
      },
    ],
  },
  initialValue: 0.7,
};
