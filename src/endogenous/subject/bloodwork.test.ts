import { describe, it, expect } from "vitest";
import { derivePhysiology } from "./utils";
import { DEFAULT_SUBJECT } from "./defaults";
import { SIGNAL_DEFINITIONS_MAP, SIGNALS_ALL } from "../signals";
import type { Subject, Bloodwork } from "./types";
import {
  integrateStep,
  createInitialState,
} from "../../index";
import type {
  ActiveIntervention,
  DynamicsContext,
  SimulationState,
} from "../../engine";

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

  describe("Metabolic panel: fasting insulin", () => {
    it("should use bloodwork fasting insulin when provided", () => {
      const subject = makeSubject({ metabolic: { fasting_insulin_uIU_mL: 12 } });
      expect(resolveInitialValue("insulin", subject)).toBe(12);
    });

    it("should fall back to default insulin when no bloodwork", () => {
      const subject = makeSubject();
      expect(resolveInitialValue("insulin", subject)).toBe(8);
    });

    it("should set insulin setpoint from bloodwork", () => {
      const subject = makeSubject({ metabolic: { fasting_insulin_uIU_mL: 15 } });
      expect(resolveSetpoint("insulin", subject)).toBe(15);
    });
  });

  describe("Nutritional panel integration", () => {
    const nutritionalSignals = [
      { key: "vitaminD3", field: "vitaminD3_ng_mL", custom: 50, fallback: 35 },
      { key: "b12", field: "b12_pg_mL", custom: 800, fallback: 500 },
      { key: "iron", field: "iron_ug_dL", custom: 130, fallback: 100 },
      { key: "folate", field: "folate_ng_mL", custom: 18, fallback: 12 },
      { key: "zinc", field: "zinc_ug_dL", custom: 105, fallback: 90 },
      { key: "magnesium", field: "magnesium_mg_dL", custom: 2.3, fallback: 2.0 },
    ];

    for (const { key, field, custom, fallback } of nutritionalSignals) {
      it(`should initialize ${key} from bloodwork`, () => {
        const subject = makeSubject({ nutritional: { [field]: custom } });
        expect(resolveInitialValue(key, subject)).toBe(custom);
      });

      it(`should fall back to default for ${key}`, () => {
        const subject = makeSubject();
        expect(resolveInitialValue(key, subject)).toBe(fallback);
      });

      it(`should set ${key} setpoint from bloodwork`, () => {
        const subject = makeSubject({ nutritional: { [field]: custom } });
        expect(resolveSetpoint(key, subject)).toBe(custom);
      });
    }
  });

  describe("Hormonal panel: expanded fields", () => {
    it("should initialize testosterone from total_testosterone bloodwork", () => {
      const subject = makeSubject({ hormones: { total_testosterone_ng_dL: 650 } });
      expect(resolveInitialValue("testosterone", subject)).toBe(650);
    });

    it("should fall back to default testosterone", () => {
      const subject = makeSubject();
      expect(resolveInitialValue("testosterone", subject)).toBe(500);
    });

    it("should scale testosterone setpoint with bloodwork", () => {
      const subjectHigh = makeSubject({ hormones: { total_testosterone_ng_dL: 750 } });
      const subjectDefault = makeSubject();
      const spHigh = resolveSetpoint("testosterone", subjectHigh);
      const spDefault = resolveSetpoint("testosterone", subjectDefault);
      // Higher bloodwork should produce higher setpoint (ratio: 750/500 = 1.5)
      expect(spHigh / spDefault).toBeCloseTo(1.5, 1);
    });

    it("should initialize estrogen from estradiol bloodwork", () => {
      const subject = makeSubject({ hormones: { estradiol_pg_mL: 60 } });
      expect(resolveInitialValue("estrogen", subject)).toBe(60);
    });

    it("should fall back to default estrogen", () => {
      const subject = makeSubject();
      expect(resolveInitialValue("estrogen", subject)).toBe(40);
    });

    it("should initialize progesterone from bloodwork", () => {
      const subject = makeSubject({ hormones: { progesterone_ng_mL: 1.0 } });
      expect(resolveInitialValue("progesterone", subject)).toBe(1.0);
    });

    it("should fall back to default progesterone", () => {
      const subject = makeSubject();
      expect(resolveInitialValue("progesterone", subject)).toBe(0.5);
    });

    it("should initialize LH from bloodwork", () => {
      const subject = makeSubject({ hormones: { lh_IU_L: 8.0 } });
      expect(resolveInitialValue("lh", subject)).toBe(8.0);
    });

    it("should fall back to default LH", () => {
      const subject = makeSubject();
      expect(resolveInitialValue("lh", subject)).toBe(5);
    });

    it("should initialize FSH from bloodwork", () => {
      const subject = makeSubject({ hormones: { fsh_IU_L: 7.0 } });
      expect(resolveInitialValue("fsh", subject)).toBe(7.0);
    });

    it("should fall back to default FSH", () => {
      const subject = makeSubject();
      expect(resolveInitialValue("fsh", subject)).toBe(5);
    });

    it("should initialize SHBG from bloodwork", () => {
      const subject = makeSubject({ hormones: { shbg_nmol_L: 55 } });
      expect(resolveInitialValue("shbg", subject)).toBe(55);
    });

    it("should fall back to default SHBG", () => {
      const subject = makeSubject();
      expect(resolveInitialValue("shbg", subject)).toBe(40);
    });

    it("should set SHBG setpoint from bloodwork", () => {
      const subject = makeSubject({ hormones: { shbg_nmol_L: 60 } });
      expect(resolveSetpoint("shbg", subject)).toBe(60);
    });

    it("should initialize DHEA-S from bloodwork", () => {
      const subject = makeSubject({ hormones: { dheas_ug_dL: 300 } });
      expect(resolveInitialValue("dheas", subject)).toBe(300);
    });

    it("should fall back to default DHEA-S", () => {
      const subject = makeSubject();
      expect(resolveInitialValue("dheas", subject)).toBe(200);
    });

    it("should set DHEA-S setpoint from bloodwork", () => {
      const subject = makeSubject({ hormones: { dheas_ug_dL: 250 } });
      expect(resolveSetpoint("dheas", subject)).toBe(250);
    });

    it("should initialize IGF-1 from bloodwork", () => {
      const subject = makeSubject({ hormones: { igf1_ng_mL: 200 } });
      expect(resolveInitialValue("igf1", subject)).toBe(200);
    });

    it("should fall back to default IGF-1", () => {
      const subject = makeSubject();
      expect(resolveInitialValue("igf1", subject)).toBe(150);
    });

    it("should scale thyroid setpoint with freeT4 bloodwork", () => {
      const subjectHigh = makeSubject({ hormones: { freeT4_ng_dL: 1.8 } });
      const subjectDefault = makeSubject();
      const spHigh = resolveSetpoint("thyroid", subjectHigh);
      const spDefault = resolveSetpoint("thyroid", subjectDefault);
      // Higher freeT4 should scale up (ratio: 1.8/1.2 = 1.5)
      expect(spHigh / spDefault).toBeCloseTo(1.5, 1);
    });

    it("should scale thyroid initialValue with freeT4 bloodwork", () => {
      const subjectHigh = makeSubject({ hormones: { freeT4_ng_dL: 1.8 } });
      const val = resolveInitialValue("thyroid", subjectHigh);
      expect(val).toBeCloseTo(1.5, 1);
    });

    it('should initialize from free_testosterone_pg_mL bloodwork', () => {
      const subject = makeSubject({ hormones: { free_testosterone_pg_mL: 20 } });
      expect(resolveInitialValue('freeTestosterone', subject)).toBe(20);
    });

    it('should fall back to sex-dependent default for free testosterone', () => {
      const maleSubject: Subject = { ...makeSubject(), sex: 'male' };
      const femaleSubject: Subject = { ...makeSubject(), sex: 'female' };

      expect(resolveInitialValue('freeTestosterone', maleSubject)).toBe(15);
      expect(resolveInitialValue('freeTestosterone', femaleSubject)).toBe(2);
    });

    it('should set free testosterone setpoint from bloodwork', () => {
      const subject = makeSubject({ hormones: { free_testosterone_pg_mL: 22 } });
      expect(resolveSetpoint('freeTestosterone', subject)).toBe(22);
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

  describe("PK clearance adjustments from bloodwork", () => {
    // Test drug with both renal and hepatic clearance flags
    const makeIntervention = (): ActiveIntervention => ({
      id: "pk-test",
      key: "pk-test",
      startTime: 0,
      duration: 300,
      intensity: 1.0,
      params: { mg: 100 },
      pharmacology: {
        pk: {
          model: "1-compartment",
          delivery: "bolus",
          bioavailability: 1.0,
          halfLifeMin: 120,
          massMg: 100,
          volume: { kind: "weight", base_L_kg: 0.7 },
          clearance: { renal: true, hepatic: true },
        },
        pd: [],
      },
    });

    function simulatePK(subject: Subject, steps: number = 120): number {
      const physiology = derivePhysiology(subject);
      let state: SimulationState = createInitialState({
        subject,
        physiology,
        isAsleep: false,
      });
      const interventions = [makeIntervention()];
      const ctx: DynamicsContext = {
        minuteOfDay: 0,
        circadianMinuteOfDay: 0,
        dayOfYear: 1,
        isAsleep: false,
        subject,
        physiology,
      };

      for (let t = 0; t < steps; t++) {
        state = integrateStep(
          state,
          t,
          1.0,
          { ...ctx, minuteOfDay: t % 1440 },
          undefined,
          undefined,
          interventions,
        );
      }
      return state.pk["pk-test_central"] ?? 0;
    }

    it("renal: eGFR=50 should slow clearance vs normal", () => {
      const normalSubject = makeSubject();
      const impairedSubject: Subject = {
        ...makeSubject(),
        bloodwork: { metabolic: { eGFR_mL_min: 50 } },
      };

      const normalConc = simulatePK(normalSubject);
      const impairedConc = simulatePK(impairedSubject);

      // Impaired renal → slower clearance → higher remaining concentration
      expect(impairedConc).toBeGreaterThan(normalConc);
    });

    it("hepatic: ALT=100 should slow clearance vs normal", () => {
      const normalSubject = makeSubject();
      const impairedSubject: Subject = {
        ...makeSubject(),
        bloodwork: { metabolic: { alt_U_L: 100 } },
      };

      const normalConc = simulatePK(normalSubject);
      const impairedConc = simulatePK(impairedSubject);

      // Elevated ALT → impaired hepatic clearance → higher remaining concentration
      expect(impairedConc).toBeGreaterThan(normalConc);
    });

    it("albumin: albumin=2.5 should increase Vd (lower concentration)", () => {
      const normalSubject: Subject = {
        ...makeSubject(),
        bloodwork: { metabolic: { albumin_g_dL: 4.0 } },
      };
      const lowAlbuminSubject: Subject = {
        ...makeSubject(),
        bloodwork: { metabolic: { albumin_g_dL: 2.5 } },
      };

      // Measure at a very early time (before clearance dominates) to isolate Vd effect
      const normalConc = simulatePK(normalSubject, 5);
      const lowAlbuminConc = simulatePK(lowAlbuminSubject, 5);

      // Low albumin → larger Vd → lower peak concentration
      expect(lowAlbuminConc).toBeLessThan(normalConc);
      // albumin 2.5 → ratio 4.0/2.5 = 1.6x Vd → ~1.6x lower concentration
      expect(normalConc / lowAlbuminConc).toBeGreaterThan(1.4);
      expect(normalConc / lowAlbuminConc).toBeLessThan(1.8);
    });

    it("no adjustment when bloodwork has normal values", () => {
      // DEFAULT_SUBJECT already has eGFR=100, ALT=25, albumin=4.0
      const defaultSubject = { ...DEFAULT_SUBJECT };
      const explicitNormalSubject: Subject = {
        ...DEFAULT_SUBJECT,
        bloodwork: {
          ...DEFAULT_SUBJECT.bloodwork,
          metabolic: {
            ...DEFAULT_SUBJECT.bloodwork!.metabolic,
            eGFR_mL_min: 100,
            alt_U_L: 25,
            albumin_g_dL: 4.0,
          },
        },
      };

      const defaultConc = simulatePK(defaultSubject);
      const explicitConc = simulatePK(explicitNormalSubject);

      // Both have the same normal values → identical PK
      expect(explicitConc).toBeCloseTo(defaultConc, 2);
    });
  });
});
