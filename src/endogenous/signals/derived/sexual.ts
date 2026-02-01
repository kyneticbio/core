import type { SignalDefinition } from "../../../engine";

/**
 * ERECTILE FUNCTION (Male)
 * Composite index of male erectile quality (0-100).
 * Driven by nitric oxide, testosterone, vascular health, and psychological state.
 */
export const erectileFunction: SignalDefinition = {
  key: "erectileFunction",
  label: "Erectile Function",
  unit: "%",
  description:
    "Male erectile quality driven by blood flow (nitric oxide), testosterone, and psychological state. Higher values indicate stronger, more reliable erections.",
  idealTendency: "higher",
  dynamics: {
    setpoint: (ctx: any, state: any) => {
      // Base erectile function depends on age
      const age = ctx.subject?.age ?? 35;
      const ageEffect = Math.max(0.6, 1.0 - (age - 25) * 0.008); // Gradual decline after 25

      // NO is the primary driver of erection mechanics
      const no = state.signals.nitricOxide ?? 25;
      const noEffect = Math.min(1.2, no / 25);

      // Testosterone influences libido and baseline function
      const testosterone = state.signals.testosterone ?? 500;
      const testEffect = Math.min(1.2, testosterone / 500);

      // Stress/cortisol inhibits function
      const cortisol = state.signals.cortisol ?? 12;
      const stressEffect = Math.max(0.5, 1.0 - (cortisol - 12) * 0.02);

      // Dopamine/arousal enhances function
      const dopamine = state.signals.dopamine ?? 50;
      const arousalEffect = Math.min(1.3, 0.8 + dopamine / 200);

      const base = 70 * ageEffect * noEffect * testEffect * stressEffect * arousalEffect;
      return Math.max(0, Math.min(100, base));
    },
    tau: 10,
    production: [],
    clearance: [],
    couplings: [
      { source: "nitricOxide", effect: "stimulate", strength: 1.0 },
      { source: "testosterone", effect: "stimulate", strength: 0.02 },
      { source: "dopamine", effect: "stimulate", strength: 0.1 },
      { source: "cortisol", effect: "inhibit", strength: 0.5 },
      { source: "adrenaline", effect: "inhibit", strength: 0.3 },
    ],
  },
  initialValue: 70,
  min: 0,
  max: 100,
  display: {
    referenceRange: { min: 60, max: 90 },
  },
  monitors: [
    {
      id: "erectile_dysfunction_risk",
      signal: "erectileFunction",
      pattern: { type: "falls_below", value: 40, sustainedMins: 1440 },
      outcome: "warning",
      message: "Erectile Function impaired",
      description: "Low nitric oxide, low testosterone, or high stress is affecting function.",
    },
  ],
};

/**
 * LIBIDO
 * Sexual desire/drive index.
 * Driven primarily by testosterone, dopamine, and stress levels.
 */
export const libido: SignalDefinition = {
  key: "libido",
  label: "Libido",
  unit: "%",
  description:
    "Sexual desire and drive. Influenced by testosterone, dopamine, energy levels, and stress.",
  idealTendency: "higher",
  dynamics: {
    setpoint: (ctx: any, state: any) => {
      // Testosterone is primary driver
      const testosterone = state.signals.testosterone ?? 500;
      const testEffect = Math.min(1.3, testosterone / 450);

      // Dopamine influences desire
      const dopamine = state.signals.dopamine ?? 50;
      const dopamineEffect = Math.min(1.2, 0.8 + dopamine / 250);

      // Energy/vitality matters
      const energy = state.signals.energy ?? 100;
      const energyEffect = Math.min(1.1, energy / 100);

      // Stress suppresses libido
      const cortisol = state.signals.cortisol ?? 12;
      const stressEffect = Math.max(0.4, 1.0 - (cortisol - 12) * 0.03);

      // Prolactin suppresses libido (refractory period)
      const prolactin = state.signals.prolactin ?? 10;
      const prolactinEffect = Math.max(0.3, 1.0 - (prolactin - 10) * 0.02);

      const base = 60 * testEffect * dopamineEffect * energyEffect * stressEffect * prolactinEffect;
      return Math.max(0, Math.min(100, base));
    },
    tau: 30,
    production: [],
    clearance: [],
    couplings: [
      { source: "testosterone", effect: "stimulate", strength: 0.05 },
      { source: "dopamine", effect: "stimulate", strength: 0.2 },
      { source: "cortisol", effect: "inhibit", strength: 0.8 },
      { source: "prolactin", effect: "inhibit", strength: 1.0 },
    ],
  },
  initialValue: 60,
  min: 0,
  max: 100,
  display: {
    referenceRange: { min: 40, max: 80 },
  },
  monitors: [
    {
      id: "libido_low",
      signal: "libido",
      pattern: { type: "falls_below", value: 30, sustainedMins: 1440 },
      outcome: "warning",
      message: "Low Libido",
      description: "Hormonal or stress factors are suppressing sexual drive.",
    },
  ],
};
