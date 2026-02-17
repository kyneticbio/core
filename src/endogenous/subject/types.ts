// --- Subject Types ---
export type BiologicalSex = "male" | "female";

// --- Bloodwork Panel Types ---

export interface MetabolicPanel {
  albumin_g_dL?: number;
  creatinine_mg_dL?: number;
  eGFR_mL_min?: number;
  alt_U_L?: number;
  ast_U_L?: number;
  bilirubin_mg_dL?: number;
  potassium_mmol_L?: number;
  glucose_mg_dL?: number;
  fasting_insulin_uIU_mL?: number;
}

export interface HematologyPanel {
  hemoglobin_g_dL?: number;
  hematocrit_pct?: number;
  platelet_count_k_uL?: number;
  wbc_count_k_uL?: number;
}

export interface InflammatoryPanel {
  hsCRP_mg_L?: number;
  ferritin_ng_mL?: number;
}

export interface HormonalPanel {
  tsh_uIU_mL?: number;
  cortisol_ug_dL?: number;
  free_testosterone_pg_mL?: number;
  total_testosterone_ng_dL?: number;
  estradiol_pg_mL?: number;
  progesterone_ng_mL?: number;
  lh_IU_L?: number;
  fsh_IU_L?: number;
  shbg_nmol_L?: number;
  dheas_ug_dL?: number;
  igf1_ng_mL?: number;
  freeT4_ng_dL?: number;
}

export interface NutritionalPanel {
  vitaminD3_ng_mL?: number;
  b12_pg_mL?: number;
  iron_ug_dL?: number;
  folate_ng_mL?: number;
  zinc_ug_dL?: number;
  magnesium_mg_dL?: number;
}

export interface Bloodwork {
  metabolic?: Partial<MetabolicPanel>;
  hematology?: Partial<HematologyPanel>;
  inflammation?: Partial<InflammatoryPanel>;
  hormones?: Partial<HormonalPanel>;
  nutritional?: Partial<NutritionalPanel>;
}

export interface Subject {
  age: number;
  weight: number;
  height: number;
  sex: BiologicalSex;
  cycleLength: number;
  lutealPhaseLength: number;
  cycleDay: number;
  bloodwork?: Bloodwork;
}

export interface Physiology {
  bmr: number;
  tbw: number;
  bmi: number;
  bsa: number;
  metabolicCapacity: number;
  drugClearance: number;
  leanBodyMass: number;
  liverBloodFlow: number;
  estimatedGFR: number;
}

export interface NutritionTargets {
  calories: number;
  macrosEnabled: boolean;
  macros: {
    carbs: { min: number; max: number };
    fat: { min: number; max: number };
    protein: { min: number; max: number };
  };
}
