import { describe, it, expect } from "vitest";
import { derivePhysiology } from "./utils";
import { DEFAULT_SUBJECT } from "./defaults";
import { SIGNAL_DEFINITIONS_MAP, SIGNALS_ALL } from "../signals";
import type { Subject, Bloodwork } from "./types";

function makeSubject(bloodwork?: Bloodwork): Subject {
  return { ...DEFAULT_SUBJECT, bloodwork };
}

function resolveInitialValue(
  signalKey: string,
  subject: Subject,
): number {
  const def = (SIGNAL_DEFINITIONS_MAP as any)[signalKey];
  if (!def) throw new Error(`Unknown signal: ${signalKey}`);
  const iv = def.initialValue;
  if (typeof iv === "function") {
    return iv({ subject, physiology: derivePhysiology(subject), isAsleep: false });
  }
  return iv;
}

function resolveSetpoint(
  signalKey: string,
  subject: Subject,
): number {
  const def = (SIGNAL_DEFINITIONS_MAP as any)[signalKey];
  if (!def) throw new Error(`Unknown signal: ${signalKey}`);
  const ctx = {
    subject,
    physiology: derivePhysiology(subject),
    isAsleep: false,
    minuteOfDay: 600,
    circadianMinuteOfDay: 600,
    dayOfYear: 1,
  };
  return def.dynamics.setpoint(ctx, { signals: {}, auxiliary: {} });
}

describe("Bloodwork Integration", () => {
  describe("Signal initialization from bloodwork", () => {
    it("should use bloodwork glucose value when provided", () => {
      const subject = makeSubject({ metabolic: { glucose_mg_dL: 110 } });
      const val = resolveInitialValue("glucose", subject);
      expect(val).toBe(110);
    });

    it("should fall back to default glucose when no bloodwork", () => {
      const subject = makeSubject();
      const val = resolveInitialValue("glucose", subject);
      expect(val).toBe(90);
    });

    it("should use bloodwork ALT value when provided", () => {
      const subject = makeSubject({ metabolic: { alt_U_L: 45 } });
      const val = resolveInitialValue("alt", subject);
      expect(val).toBe(45);
    });

    it("should fall back to default ALT when no bloodwork", () => {
      const subject = makeSubject();
      const val = resolveInitialValue("alt", subject);
      expect(val).toBe(25);
    });

    it("should use bloodwork eGFR value when provided", () => {
      const subject = makeSubject({ metabolic: { eGFR_mL_min: 50 } });
      const val = resolveInitialValue("egfr", subject);
      expect(val).toBe(50);
    });

    it("should use bloodwork AST value when provided", () => {
      const subject = makeSubject({ metabolic: { ast_U_L: 35 } });
      const val = resolveInitialValue("ast", subject);
      expect(val).toBe(35);
    });

    it("should use bloodwork ferritin value when provided", () => {
      const subject = makeSubject({ inflammation: { ferritin_ng_mL: 80 } });
      const val = resolveInitialValue("ferritin", subject);
      expect(val).toBe(80);
    });

    it("should use bloodwork cortisol value when provided (awake)", () => {
      const subject = makeSubject({ hormones: { cortisol_ug_dL: 18 } });
      const val = resolveInitialValue("cortisol", subject);
      expect(val).toBe(18);
    });
  });

  describe("New signal definitions", () => {
    const newSignals = [
      "albumin", "creatinine", "bilirubin", "potassium", "hsCRP",
      "hemoglobin", "hematocrit", "platelets", "wbc", "tsh",
    ];

    it("should include all new signals in SIGNALS_ALL", () => {
      for (const key of newSignals) {
        expect(SIGNALS_ALL).toContain(key);
      }
    });

    it("should have definitions for all new signals", () => {
      for (const key of newSignals) {
        expect((SIGNAL_DEFINITIONS_MAP as any)[key]).toBeDefined();
      }
    });

    it("should initialize new signals from bloodwork", () => {
      const subject = makeSubject({
        metabolic: { albumin_g_dL: 3.8, creatinine_mg_dL: 1.1, bilirubin_mg_dL: 0.5, potassium_mmol_L: 4.5 },
        hematology: { hemoglobin_g_dL: 15.0, hematocrit_pct: 45, platelet_count_k_uL: 200, wbc_count_k_uL: 6.0 },
        inflammation: { hsCRP_mg_L: 2.5 },
        hormones: { tsh_uIU_mL: 3.0 },
      });

      expect(resolveInitialValue("albumin", subject)).toBe(3.8);
      expect(resolveInitialValue("creatinine", subject)).toBe(1.1);
      expect(resolveInitialValue("bilirubin", subject)).toBe(0.5);
      expect(resolveInitialValue("potassium", subject)).toBe(4.5);
      expect(resolveInitialValue("hemoglobin", subject)).toBe(15.0);
      expect(resolveInitialValue("hematocrit", subject)).toBe(45);
      expect(resolveInitialValue("platelets", subject)).toBe(200);
      expect(resolveInitialValue("wbc", subject)).toBe(6.0);
      expect(resolveInitialValue("hsCRP", subject)).toBe(2.5);
      expect(resolveInitialValue("tsh", subject)).toBe(3.0);
    });

    it("should fall back to defaults for new signals without bloodwork", () => {
      const subject = makeSubject();
      expect(resolveInitialValue("albumin", subject)).toBe(4.0);
      expect(resolveInitialValue("creatinine", subject)).toBe(0.9);
      expect(resolveInitialValue("bilirubin", subject)).toBe(0.7);
      expect(resolveInitialValue("potassium", subject)).toBe(4.2);
      expect(resolveInitialValue("hemoglobin", subject)).toBe(14.5);
      expect(resolveInitialValue("hematocrit", subject)).toBe(43);
      expect(resolveInitialValue("platelets", subject)).toBe(250);
      expect(resolveInitialValue("wbc", subject)).toBe(7.0);
      expect(resolveInitialValue("hsCRP", subject)).toBe(1.0);
      expect(resolveInitialValue("tsh", subject)).toBe(2.0);
    });
  });

  describe("Setpoint responds to bloodwork", () => {
    it("should set glucose setpoint from bloodwork", () => {
      const subject = makeSubject({ metabolic: { glucose_mg_dL: 110 } });
      const sp = resolveSetpoint("glucose", subject);
      expect(sp).toBe(110);
    });

    it("should set eGFR setpoint from bloodwork", () => {
      const subject = makeSubject({ metabolic: { eGFR_mL_min: 65 } });
      const sp = resolveSetpoint("egfr", subject);
      expect(sp).toBe(65);
    });
  });

  describe("derivePhysiology prefers bloodwork eGFR", () => {
    it("should use bloodwork eGFR when provided", () => {
      const subject = makeSubject({ metabolic: { eGFR_mL_min: 55 } });
      const phys = derivePhysiology(subject);
      expect(phys.estimatedGFR).toBe(55);
    });

    it("should fall back to Cockcroft-Gault when no bloodwork", () => {
      const subject = makeSubject();
      const phys = derivePhysiology(subject);
      // Default subject: age 30, weight 70, male
      // CG = (140-30)*70/72 = 106.9
      expect(phys.estimatedGFR).toBeCloseTo(106.9, 0);
    });
  });
});
