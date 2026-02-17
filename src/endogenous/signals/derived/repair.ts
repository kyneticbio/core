import type { SignalDefinition, DynamicsContext } from "../../../engine";
import {
  minuteToPhase,
  hourToPhase,
  gaussianPhase,
  widthToConcentration,
} from "../../utils";

/**
 * ANGIOGENESIS
 * The process of forming new blood vessels from existing vasculature.
 * Driven primarily by VEGF but also by NO and acute inflammation.
 * BPC-157 works through VEGF upregulation; TB-500 stimulates this directly
 * via actin polymerization and cell migration.
 */
export const angiogenesis: SignalDefinition = {
  key: "angiogenesis",
  label: "Angiogenesis",
  isPremium: true,
  unit: "x",
  description:
    "The formation of new blood vessels. Critical for wound healing, tissue repair, and recovery from injury. Driven by VEGF and nitric oxide.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => 1.0,
    tau: 720, // Slow biological process (hours to days)
    production: [
      {
        source: "constant",
        coefficient: 1.0,
        transform: (_: any, state) => {
          // VEGF is the primary driver of angiogenesis
          const vegf = state.signals.vegf ?? 100;
          return vegf > 100 ? (vegf - 100) / 2000 : 0;
        },
      },
      {
        source: "nitricOxide",
        coefficient: 0.0005,
      },
    ],
    clearance: [{ type: "linear", rate: 0.005 }],
    couplings: [{ source: "cortisol", effect: "inhibit", strength: 0.05 }],
  },
  initialValue: 1.0,
  min: 0,
  max: 5,
  display: {
    referenceRange: { min: 0.5, max: 1.5 },
  },
  monitors: [
    {
      id: "angiogenesis_active",
      signal: "angiogenesis",
      pattern: { type: "exceeds", value: 1.5, sustainedMins: 60 },
      outcome: "win",
      message: "Active Angiogenesis",
      description:
        "New blood vessel formation is active, supporting tissue repair and recovery.",
    },
    {
      id: "angiogenesis_excessive",
      signal: "angiogenesis",
      pattern: { type: "exceeds", value: 3.0, sustainedMins: 1440 },
      outcome: "warning",
      message: "Excessive Angiogenesis",
      description:
        "Prolonged elevated angiogenesis may indicate chronic injury or excessive growth factor stimulation.",
    },
  ],
};

/**
 * GASTRIC EMPTYING
 * The rate at which food leaves the stomach and enters the small intestine.
 * GLP-1 agonists (semaglutide, tirzepatide, retatrutide) dramatically slow this,
 * which is a key mechanism for appetite suppression and a source of GI side effects.
 */
export const gastricEmptying: SignalDefinition = {
  key: "gastricEmptying",
  label: "Gastric Motility",
  unit: "%",
  description:
    "How quickly food moves through your stomach. GLP-1 drugs slow this down, which helps you feel full longer but can cause nausea.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      // Higher around mealtimes, lower overnight
      const p = minuteToPhase(ctx.circadianMinuteOfDay);
      const bk = gaussianPhase(p, hourToPhase(8.5), widthToConcentration(90));
      const ln = gaussianPhase(p, hourToPhase(13.0), widthToConcentration(90));
      const dn = gaussianPhase(p, hourToPhase(19.0), widthToConcentration(90));
      return 35 + 35 * (bk + 0.9 * ln + 0.8 * dn);
    },
    tau: 30, // Responds quickly to meals and hormones
    production: [
      {
        source: "ghrelin",
        coefficient: 0.0001,
        transform: (G: any) => Math.max(0, (G - 400) / 600),
      },
    ],
    clearance: [], // Drive signal - no metabolic clearance
    couplings: [
      { source: "glp1", effect: "inhibit", strength: 0.3 },
      { source: "gip", effect: "inhibit", strength: 0.1 },
    ],
  },
  initialValue: 50,
  min: 0,
  max: 100,
  display: {
    referenceRange: { min: 40, max: 80 },
  },
  monitors: [
    {
      id: "gastric_slow",
      signal: "gastricEmptying",
      pattern: { type: "falls_below", value: 20, sustainedMins: 120 },
      outcome: "warning",
      message: "Very Slow Gastric Emptying",
      description:
        "Gastric motility is significantly reduced. This may cause nausea, bloating, or discomfort. Common with GLP-1 agonists.",
    },
    {
      id: "gastric_healthy",
      signal: "gastricEmptying",
      pattern: { type: "exceeds", value: 50, sustainedMins: 60 },
      outcome: "win",
      message: "Healthy Gastric Motility",
      description: "Your digestive system is moving food at a healthy rate.",
    },
  ],
};

/**
 * APPETITE
 * Composite hunger/satiety drive integrating multiple hormonal inputs.
 * The primary clinical outcome for GLP-1 agonist peptides.
 */
export const appetite: SignalDefinition = {
  key: "appetite",
  label: "Appetite",
  unit: "%",
  description:
    "Your current hunger drive. Integrates signals from gut hormones (GLP-1, ghrelin), fat stores (leptin), blood sugar, and stress (cortisol).",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      // Appetite peaks before typical mealtimes
      const p = minuteToPhase(ctx.circadianMinuteOfDay);
      const preBk = gaussianPhase(
        p,
        hourToPhase(7.5),
        widthToConcentration(60),
      );
      const preLn = gaussianPhase(
        p,
        hourToPhase(12.0),
        widthToConcentration(60),
      );
      const preDn = gaussianPhase(
        p,
        hourToPhase(18.0),
        widthToConcentration(60),
      );
      // Low overnight
      const overnight = gaussianPhase(
        p,
        hourToPhase(2.0),
        widthToConcentration(300),
      );
      return 30 + 35 * (preBk + 0.9 * preLn + 0.85 * preDn) - 20 * overnight;
    },
    tau: 45, // Appetite responds over ~45 minutes
    production: [
      {
        source: "ghrelin",
        coefficient: 0.0002,
        transform: (G: any) => Math.max(0, (G - 400) / 600),
      },
      {
        source: "cortisol",
        coefficient: 0.001,
        transform: (C: any) => Math.max(0, (C - 15) / 10),
      },
    ],
    clearance: [], // Drive signal - no metabolic clearance
    couplings: [
      { source: "glp1", effect: "inhibit", strength: 0.4 },
      { source: "leptin", effect: "inhibit", strength: 0.15 },
      { source: "glucose", effect: "inhibit", strength: 0.005 },
    ],
  },
  initialValue: 40,
  min: 0,
  max: 100,
  display: {
    referenceRange: { min: 20, max: 70 },
  },
  monitors: [
    {
      id: "appetite_suppressed",
      signal: "appetite",
      pattern: { type: "falls_below", value: 15, sustainedMins: 180 },
      outcome: "win",
      message: "Appetite Suppressed",
      description:
        "Your hunger drive is very low. If intentional (e.g., GLP-1 therapy), this supports caloric deficit and weight loss.",
    },
    {
      id: "appetite_excessive",
      signal: "appetite",
      pattern: { type: "exceeds", value: 85, sustainedMins: 120 },
      outcome: "warning",
      message: "Excessive Hunger",
      description:
        "Your appetite drive is very high. This may lead to overeating. Check blood sugar, stress, and sleep quality.",
    },
  ],
};
