import type { SignalDefinition } from "../../../engine";
import {
  minuteToPhase,
  hourToPhase,
  gaussianPhase,
  sigmoidPhase,
  widthToConcentration,
  minutesToPhaseWidth,
  windowPhase,
} from "../../utils";

/**
 * NITRIC OXIDE (NO)
 * Key vasodilator produced by endothelium.
 * Critical for blood flow regulation and erectile function.
 * Produced from L-arginine by nitric oxide synthase (NOS).
 */
export const nitricOxide: SignalDefinition = {
  key: "nitricOxide",
  label: "Nitric Oxide",
  unit: "nM",
  description:
    "A gaseous signaling molecule that relaxes blood vessels. Essential for healthy blood flow, exercise performance, and erectile function.",
  idealTendency: "higher",
  dynamics: {
    setpoint: (ctx: any, state: any) => {
      // Baseline NO production, slightly higher during day (activity)
      const p = minuteToPhase(ctx.minuteOfDay);
      const dayActivity = gaussianPhase(p, hourToPhase(14), widthToConcentration(480));
      return 20 + 10 * dayActivity;
    },
    tau: 5, // NO has very short half-life (seconds), but we model the steady-state
    production: [],
    clearance: [{ type: "linear", rate: 0.2 }],
    couplings: [
      { source: "oxygen", effect: "stimulate", strength: 0.5 },
      // Exercise increases NO via shear stress on endothelium
    ],
  },
  initialValue: 25,
  min: 0,
  max: 100,
  display: {
    referenceRange: { min: 15, max: 40 },
  },
  monitors: [
    {
      id: "no_boost",
      signal: "nitricOxide",
      pattern: { type: "increases_by", amount: 10, mode: "absolute", windowMins: 30 },
      outcome: "win",
      message: "Nitric Oxide boost",
      description: "Vasodilation detected. Blood flow and oxygen delivery are improved.",
    },
  ],
};

export const hrv: SignalDefinition = {
  key: "hrv",
  label: "HRV",
  isPremium: true,
  unit: "ms",
  description:
    "Heart Rate Variability. A powerful marker of your nervous system's balance and resilience.",
  idealTendency: "higher",
  dynamics: {
    setpoint: (ctx: any, state: any) => {
      const vagal = state.signals.vagal ?? 0.5;
      const norepi = (state.signals.norepi ?? 250) / 500;
      const adrenaline = (state.signals.adrenaline ?? 30) / 200;
      // Target HRV scales with vagal tone and is suppressed by catecholamine load
      return Math.max(20, (vagal * 90) * Math.exp(-(norepi + adrenaline) * 0.4));
    },
    tau: 5,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: 60,
  min: 10,
  max: 200,
  display: {
    referenceRange: { min: 20, max: 100 },
  },
  monitors: [
    {
      id: "hrv_recovery",
      signal: "hrv",
      pattern: { type: "increases_by", amount: 15, mode: "absolute", windowMins: 60 },
      outcome: "win",
      message: "HRV Recovery",
      description: "Your nervous system is entering a restorative state.",
    },
    {
      id: "hrv_stress",
      signal: "hrv",
      pattern: { type: "falls_below", value: 30, sustainedMins: 60 },
      outcome: "warning",
      message: "Low HRV detected",
      description: "Indicates high stress load or poor recovery.",
    },
  ],
};

export const bloodPressure: SignalDefinition = {
  key: "bloodPressure",
  label: "Blood Pressure",
  isPremium: true,
  unit: "mmHg",
  description: "A proxy for the pressure in your arteries.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx: any, state: any) => {
      const p = minuteToPhase(ctx.minuteOfDay);
      const wakeRise = sigmoidPhase(p, hourToPhase(2), 1.0);
      return 100.0 + 20.0 * wakeRise;
    },
    tau: 15,
    production: [],
    clearance: [],
    couplings: [
      { source: "adrenaline", effect: "stimulate", strength: 0.05 },
      { source: "norepi", effect: "stimulate", strength: 0.4 },
      { source: "cortisol", effect: "stimulate", strength: 0.5 },
      { source: "vagal", effect: "inhibit", strength: 10.0 },
    ],
  },
  initialValue: 110,
  min: 70,
  max: 200,
  display: {
    referenceRange: { min: 90, max: 120 },
  },
  monitors: [
    {
      id: "bp_hypertension",
      signal: "bloodPressure",
      pattern: { type: "exceeds", value: 140, sustainedMins: 30 },
      outcome: "warning",
      message: "Blood Pressure elevated",
      description: "Sustained high blood pressure detected.",
    },
    {
      id: "bp_hypotension",
      signal: "bloodPressure",
      pattern: { type: "falls_below", value: 90, sustainedMins: 30 },
      outcome: "warning",
      message: "Low Blood Pressure",
      description: "You may feel lightheaded or dizzy.",
    },
  ],
};

export const vagal: SignalDefinition = {
  key: "vagal",
  label: "Vagal Tone",
  isPremium: true,
  unit: "x",
  description: "A marker of your 'rest and digest' system's activity.",
  idealTendency: "higher",
  dynamics: {
    setpoint: (ctx: any, state: any) => {
      const p = minuteToPhase(ctx.minuteOfDay);
      const parasym = windowPhase(
        p,
        hourToPhase(13),
        hourToPhase(7),
        minutesToPhaseWidth(60),
      );
      const drop = gaussianPhase(p, hourToPhase(1), widthToConcentration(60));
      return 0.5 + 0.3 * parasym - 0.1 * drop;
    },
    tau: 60,
    production: [],
    clearance: [],
    couplings: [
      { source: "oxytocin", effect: "stimulate", strength: 0.01 },
      { source: "gaba", effect: "stimulate", strength: 0.002 },
      { source: "adrenaline", effect: "inhibit", strength: 0.0005 },
      { source: "norepi", effect: "inhibit", strength: 0.00005 },
      { source: "cortisol", effect: "inhibit", strength: 0.005 },
    ],
  },
  initialValue: 0.5,
  min: 0,
  max: 2.0,
  display: {
    referenceRange: { min: 0.3, max: 0.7 },
  },
  monitors: [
    {
      id: "vagal_activation",
      signal: "vagal",
      pattern: { type: "increases_by", amount: 0.2, mode: "absolute", windowMins: 30 },
      outcome: "win",
      message: "Parasympathetic Activation",
      description: "Your 'rest and digest' system is active, promoting recovery.",
    },
  ],
};
