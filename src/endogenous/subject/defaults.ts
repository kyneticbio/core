import type { Subject, NutritionTargets, Bloodwork } from "./types";

export const DEFAULT_BLOODWORK: Bloodwork = {
  metabolic: {
    albumin_g_dL: 4.0,
    creatinine_mg_dL: 0.9,
    eGFR_mL_min: 100,
    alt_U_L: 25,
    ast_U_L: 22,
    bilirubin_mg_dL: 0.7,
    potassium_mmol_L: 4.2,
    glucose_mg_dL: 90,
    fasting_insulin_uIU_mL: 8.0,
  },
  hematology: {
    hemoglobin_g_dL: 14.5,
    hematocrit_pct: 43,
    platelet_count_k_uL: 250,
    wbc_count_k_uL: 7.0,
  },
  inflammation: {
    hsCRP_mg_L: 1.0,
    ferritin_ng_mL: 50,
  },
  hormones: {
    tsh_uIU_mL: 2.0,
    cortisol_ug_dL: 12,
    free_testosterone_pg_mL: 15,
    total_testosterone_ng_dL: 500,
    estradiol_pg_mL: 40,
    progesterone_ng_mL: 0.5,
    lh_IU_L: 5.0,
    fsh_IU_L: 5.0,
    shbg_nmol_L: 40,
    dheas_ug_dL: 200,
    igf1_ng_mL: 150,
    freeT4_ng_dL: 1.2,
  },
  nutritional: {
    vitaminD3_ng_mL: 35,
    b12_pg_mL: 500,
    iron_ug_dL: 100,
    folate_ng_mL: 12,
    zinc_ug_dL: 90,
    magnesium_mg_dL: 2.0,
  },
};

export const DEFAULT_SUBJECT: Subject = {
  age: 30,
  weight: 70,
  height: 175,
  sex: 'male',
  cycleLength: 28,
  lutealPhaseLength: 14,
  cycleDay: 0,
  genetics: {}, // Default empty GeneticProfile
  bloodwork: DEFAULT_BLOODWORK,
};

export const DEFAULT_NUTRITION_TARGETS: NutritionTargets = {
  calories: 2000,
  macrosEnabled: false,
  macros: {
    carbs: { min: 200, max: 300 },
    fat: { min: 50, max: 90 },
    protein: { min: 100, max: 150 },
  },
};
