// --- Subject Types ---
export type BiologicalSex = "male" | "female";
// --- Bloodwork Panel Types ---

export interface MetabolicPanel {
  // Kidney & Waste
  bun_mg_dL?: number;
  creatinine_mg_dL?: number;
  bun_creatinine_ratio?: number;
  eGFR_mL_min?: number;
  uric_acid_mg_dL?: number;

  // Liver
  total_protein_g_dL?: number;
  albumin_g_dL?: number;
  globulin_g_dL?: number;
  albumin_globulin_ratio?: number;
  bilirubin_mg_dL?: number; // Total Bilirubin
  direct_bilirubin_mg_dL?: number;
  indirect_bilirubin_mg_dL?: number;
  alp_U_L?: number; // Alkaline Phosphatase
  alt_U_L?: number;
  ast_U_L?: number;
  ggt_U_L?: number; // Gamma-Glutamyl Transferase
  ldh_U_L?: number; // Lactate Dehydrogenase

  // Electrolytes & General
  sodium_mmol_L?: number;
  potassium_mmol_L?: number;
  chloride_mmol_L?: number;
  co2_mmol_L?: number; // Bicarbonate
  calcium_mg_dL?: number;
  phosphorus_mg_dL?: number;
  anion_gap_mmol_L?: number;
  osmolality_mOsm_kg?: number;

  // Glycemic Control
  glucose_mg_dL?: number;
  fasting_insulin_uIU_mL?: number;
  hba1c_pct?: number;
  c_peptide_ng_mL?: number;
}

export interface LipidPanel {
  total_cholesterol_mg_dL?: number;
  hdl_mg_dL?: number;
  ldl_mg_dL?: number;
  vldl_mg_dL?: number;
  triglycerides_mg_dL?: number;
  non_hdl_cholesterol_mg_dL?: number;
  cholesterol_hdl_ratio?: number;
  apob_mg_dL?: number;
  apoa1_mg_dL?: number;
  apob_apoa1_ratio?: number;
  lpa_nmol_L?: number; // Lipoprotein(a)
  sdLDL_mg_dL?: number; // Small dense LDL
  oxLDL_U_L?: number; // Oxidized LDL
}

export interface HematologyPanel {
  // Red Blood Cells
  rbc_count_m_uL?: number;
  hemoglobin_g_dL?: number;
  hematocrit_pct?: number;
  mcv_fL?: number; // Mean Corpuscular Volume
  mch_pg?: number;
  mchc_g_dL?: number;
  rdw_pct?: number; // Red Cell Distribution Width
  reticulocyte_count_pct?: number;
  nucleated_rbc_pct?: number;
  blood_smear_morphology?: string;

  // Platelets
  platelet_count_k_uL?: number;
  mpv_fL?: number; // Mean Platelet Volume

  // White Blood Cells & Differential
  wbc_count_k_uL?: number;
  neutrophils_absolute_k_uL?: number;
  lymphocytes_absolute_k_uL?: number;
  monocytes_absolute_k_uL?: number;
  eosinophils_absolute_k_uL?: number;
  basophils_absolute_k_uL?: number;
}

export interface InflammatoryPanel {
  hsCRP_mg_L?: number;
  ferritin_ng_mL?: number;
  esr_mm_hr?: number; // Erythrocyte Sedimentation Rate
  homocysteine_umol_L?: number;
  fibrinogen_mg_dL?: number;
  lp_pla2_ng_mL?: number;
}

export interface HormonalPanel {
  // Thyroid
  tsh_uIU_mL?: number;
  freeT4_ng_dL?: number;
  totalT4_ug_dL?: number;
  freeT3_pg_mL?: number;
  totalT3_ng_dL?: number;
  reverseT3_ng_dL?: number;
  tpo_antibodies_IU_mL?: number; // Thyroid Peroxidase Antibodies
  tgab_IU_mL?: number; // Thyroglobulin Antibodies
  trab_IU_L?: number; // TSH Receptor Antibodies

  // Sex Hormones
  total_testosterone_ng_dL?: number;
  free_testosterone_pg_mL?: number;
  estradiol_pg_mL?: number; // E2
  estrone_pg_mL?: number; // E1
  estriol_ng_mL?: number; // E3
  progesterone_ng_mL?: number;
  dht_ng_dL?: number; // Dihydrotestosterone
  lh_IU_L?: number; // Luteinizing Hormone
  fsh_IU_L?: number; // Follicle Stimulating Hormone
  shbg_nmol_L?: number;
  prolactin_ng_mL?: number;

  // Adrenal, Pituitary & Parathyroid
  cortisol_ug_dL?: number;
  dheas_ug_dL?: number;
  pregnenolone_ng_dL?: number;
  igf1_ng_mL?: number;
  acth_pg_mL?: number;
  pth_pg_mL?: number; // Intact Parathyroid Hormone
  aldosterone_ng_dL?: number;
  renin_ng_mL_hr?: number;
}

export interface NutritionalPanel {
  // Vitamins
  vitaminD3_ng_mL?: number; // 25-OH Vitamin D
  b12_pg_mL?: number;
  folate_ng_mL?: number;
  vitaminA_mcg_dL?: number;
  vitaminE_mg_L?: number;
  vitaminC_mg_dL?: number;

  // Functional B12 marker
  mma_nmol_L?: number; // Methylmalonic Acid

  // Iron Studies
  iron_ug_dL?: number;
  tibc_ug_dL?: number; // Total Iron Binding Capacity
  transferrin_saturation_pct?: number;

  // Minerals & Trace Elements
  magnesium_mg_dL?: number;
  rbc_magnesium_mg_dL?: number;
  zinc_ug_dL?: number;
  copper_ug_dL?: number;
  ceruloplasmin_mg_dL?: number; // Copper transport protein
  selenium_ug_L?: number;
  chromium_ug_L?: number;
  iodine_ug_L?: number;

  // Other
  choline_umol_L?: number;
  omega3_index_pct?: number;
  coq10_mg_L?: number;
}

export interface CoagulationPanel {
  pt_sec?: number; // Prothrombin Time
  inr?: number; // International Normalized Ratio
  aptt_sec?: number; // Activated Partial Thromboplastin Time
  d_dimer_ng_mL_FEU?: number;
}

export interface AutoimmunePanel {
  ana_titer?: string; // e.g., "1:40", "1:80"
  dsdna_IU_mL?: number; // Lupus marker
  rheumatoid_factor_IU_mL?: number;
  anti_ccp_U_mL?: number;
  anca_titer?: string; // Vasculitis marker
  ttg_iga_U_mL?: number; // Celiac marker
}

export interface CardiacPanel {
  troponin_i_ng_mL?: number;
  troponin_t_ng_mL?: number;
  nt_probnp_pg_mL?: number; // Heart failure marker
}

export interface TumorMarkersPanel {
  psa_ng_mL?: number; // Prostate
  free_psa_pct?: number;
  cea_ng_mL?: number; // Colon/Broad
  ca125_U_mL?: number; // Ovarian
  ca19_9_U_mL?: number; // Pancreatic
  ca15_3_U_mL?: number; // Breast
  afp_ng_mL?: number; // Liver/Testicular
  beta_hcg_mIU_mL?: number; // Testicular/Pregnancy
}

export interface ToxicityPanel {
  // Heavy Metals
  lead_mcg_dL?: number;
  mercury_mcg_L?: number;
  arsenic_mcg_L?: number;
  cadmium_mcg_L?: number;
}

export interface UrinalysisPanel {
  specific_gravity?: number;
  ph?: number;
  protein_mg_dL?: number;
  glucose_mg_dL?: number;
  ketones_mg_dL?: number;
  bilirubin?: string; // "Negative", "Trace", "Small", etc.
  urobilinogen_mg_dL?: number;
  leukocyte_esterase?: string;
  nitrites?: string;
  rbc_per_hpf?: number; // High Power Field
  wbc_per_hpf?: number;
  squamous_epithelial_cells_per_hpf?: number;

  // Early kidney disease markers
  microalbumin_mg_L?: number;
  urine_creatinine_mg_dL?: number;
  microalbumin_creatinine_ratio_mg_g?: number;

  // Microscopy
  crystals?: string; // e.g., "Calcium Oxalate", "Negative"
  casts?: string;
  bacteria?: string; // "Few", "Moderate", "Many"
}

export interface InfectiousDiseasePanel {
  // Hepatitis
  hbsag?: string; // Hepatitis B Surface Antigen
  hcv_antibody?: string; // Hepatitis C

  // Retroviral & Venereal
  hiv_1_2_ag_ab?: string;
  rpr_titer?: string; // Syphilis

  // Other Common Pathogens
  ebv_vca_igg_U_mL?: number; // Epstein-Barr Virus
  cmv_igg_U_mL?: number; // Cytomegalovirus
  lyme_ab_index?: number;
}

export interface ImmunologyAllergyPanel {
  // Immunoglobulins
  iga_mg_dL?: number;
  igg_mg_dL?: number;
  igm_mg_dL?: number;
  ige_total_IU_mL?: number; // Baseline allergy/parasite marker

  // Complement System
  c3_mg_dL?: number;
  c4_mg_dL?: number;
}

export interface Bloodwork {
  metabolic?: MetabolicPanel;
  lipids?: LipidPanel;
  hematology?: HematologyPanel;
  inflammation?: InflammatoryPanel;
  hormones?: HormonalPanel;
  nutritional?: NutritionalPanel;
  coagulation?: CoagulationPanel;
  autoimmune?: AutoimmunePanel;
  cardiac?: CardiacPanel;
  tumor_markers?: TumorMarkersPanel;
  toxicity?: ToxicityPanel;
  urinalysis?: UrinalysisPanel;
  infectious_disease?: InfectiousDiseasePanel;
  immunology?: ImmunologyAllergyPanel;
}

export interface MicrobiomeAndGIPanel {
  // Enterohepatic Recirculation & Drug Metabolism
  beta_glucuronidase_U_g?: number; // High levels cleave glucuronide off excreted drugs/estrogen, reabsorbing them into the bloodstream.

  // Diversity & SCFA (Short Chain Fatty Acids)
  firmicutes_bacteroidetes_ratio?: number; // General metabolic/obesity marker
  butyrate_pct?: number; // Gut barrier integrity (affects absorption permeability)
  acetate_pct?: number;
  propionate_pct?: number;

  // Key Keystones (Impacts inflammation & gut transit time)
  akkermansia_muciniphila_pct?: number;
  bifidobacterium_pct?: number;
  lactobacillus_pct?: number;

  // GI Function & Breath Tests (Crucial for Oral PK Absorption)
  gastric_emptying_time_mins?: number; // Directly determines T_max (time to peak concentration) for oral agents
  sibo_hydrogen_peak_ppm?: number; // Small Intestinal Bacterial Overgrowth (alters pH and absorption)
  sibo_methane_peak_ppm?: number; // Methane slows gut motility (decreases k_a, prolongs absorption)
  fecal_calprotectin_ug_g?: number; // Gut inflammation (can impair transporter function)
}

export interface BodyCompositionPanel {
  // Typically from DEXA or InBody scans
  body_fat_pct?: number;
  lean_body_mass_kg?: number; // Primary driver for basal metabolic rate and hydrophilic drug V_d
  visceral_fat_mass_kg?: number; // Inflammatory fat (affects liver metabolism speed)
  skeletal_muscle_mass_kg?: number;

  // Fluid Compartments (Crucial for PK Concentration: C = Dose / V_d)
  total_body_water_L?: number;
  intracellular_water_L?: number;
  extracellular_water_L?: number;

  bone_mineral_density_g_cm2?: number; // T-score / Z-score context
  basal_metabolic_rate_kcal?: number; // Baseline energy expenditure for the 24h simulation
}

export interface DiurnalHormonePanel {
  // 24-Hour Free Cortisol Curve (The baseline for endogenous stress/energy)
  cortisol_waking_ng_mL?: number; // T=0
  cortisol_morning_ng_mL?: number; // T=+30-60 mins (Cortisol Awakening Response)
  cortisol_afternoon_ng_mL?: number; // T=+6-8 hours
  cortisol_night_ng_mL?: number; // T=+12-14 hours

  // Total daily production vs clearance
  total_metabolized_cortisol_mg?: number; // Shows if liver is clearing cortisol fast or slow
  cortisol_to_cortisone_ratio?: number; // 11b-HSD enzyme activity (Systemic preference for active vs inactive stress hormone)

  // Sleep Baseline
  melatonin_mt6s_waking_ug?: number; // Urinary melatonin metabolite (determines baseline sleep pressure clearance)
}

// Common utility types for recurring genetic statuses
export type Zygosity = "Normal" | "Heterozygous" | "Homozygous";
export type MetabolizerStatus =
  | "Ultrarapid"
  | "Rapid"
  | "Normal"
  | "Intermediate"
  | "Poor";
export type RiskLevel = "Low" | "Average" | "Elevated" | "High";

export interface PharmacogenomicsPanel {
  // Cytochrome P450 System (Drug Metabolism)
  cyp2d6_status?: MetabolizerStatus; // Metabolizes ~25% of all drugs (e.g., SSRIs, beta-blockers)
  cyp2c19_status?: MetabolizerStatus; // Plavix, PPIs, antidepressants
  cyp2c9_status?: MetabolizerStatus; // Warfarin, NSAIDs
  cyp3a4_status?: MetabolizerStatus; // Statins, calcium channel blockers
  cyp1a2_status?: MetabolizerStatus; // Caffeine, duloxetine

  // Specific Drug Transporters & Receptors
  slco1b1_status?: "Normal Function" | "Decreased Function" | "Poor Function"; // Statin-induced myopathy risk
  vkorc1_sensitivity?: "Low" | "Intermediate" | "High"; // Warfarin sensitivity
  dpyd_status?: "Normal" | "Intermediate" | "Poor"; // Fluorouracil (chemo) toxicity
  tpmt_status?: "Normal" | "Intermediate" | "Poor"; // Thiopurine toxicity
}
export interface NutrigenomicsPanel {
  // Methylation & Folate Cycle
  mthfr_c677t?: Zygosity; // Folate conversion (cardiovascular/neuro risk)
  mthfr_a1298c?: Zygosity; // Neurotransmitter synthesis
  mtr_a2756g?: Zygosity; // Methionine synthase
  mtrr_a66g?: Zygosity; // Methionine synthase reductase
  cbs_c699t?: Zygosity; // Transsulfuration pathway (homocysteine to glutathione)

  // Neurotransmitter Clearance & Mood
  comt_v158m?: "Val/Val (Fast)" | "Val/Met (Intermediate)" | "Met/Met (Slow)"; // Dopamine/Estrogen clearance
  mao_a_r297r?: Zygosity; // Serotonin/Dopamine breakdown (often called the "Warrior Gene")

  // Vitamin & Mineral Receptors
  vdr_taq?: Zygosity; // Vitamin D Receptor
  vdr_bsm?: Zygosity;
  fads1_rs174537?: Zygosity; // Omega-3 fatty acid metabolism
  bcm01_rs12934922?: Zygosity; // Vitamin A (Beta-carotene to Retinol conversion)

  // Detoxification Pathways
  gstm1_status?: "Present" | "Null"; // Glutathione S-Transferase (Phase II Detox)
  gstt1_status?: "Present" | "Null";
  gstp1_i105v?: Zygosity;
}
export interface CardiovascularGeneticsPanel {
  // Lipid Metabolism & Alzheimer's Dual-Marker
  apoe_genotype?: "e2/e2" | "e2/e3" | "e2/e4" | "e3/e3" | "e3/e4" | "e4/e4"; // e4 indicates higher CVD and Alzheimer's risk

  // Clotting Factors
  factor_v_leiden?: "Negative" | "Heterozygous" | "Homozygous"; // Deep Vein Thrombosis risk
  prothrombin_g20210a?: "Negative" | "Heterozygous" | "Homozygous"; // Factor II

  // Endothelial & Heart Risk
  mthfr_homocysteine_risk?: RiskLevel; // Derived from MTHFR status
  chr9p21_risk?: RiskLevel; // Primary independent risk factor for myocardial infarction
  nos3_t786c?: Zygosity; // Nitric oxide synthase (blood pressure/vasodilation)
}
export interface OncologyGeneticsPanel {
  // Hereditary Breast and Ovarian Cancer Syndrome (HBOC)
  brca1_mutation?:
    | "Positive"
    | "Negative"
    | "Variant of Uncertain Significance";
  brca2_mutation?:
    | "Positive"
    | "Negative"
    | "Variant of Uncertain Significance";
  palb2_mutation?: "Positive" | "Negative";

  // Lynch Syndrome (Colorectal & Endometrial)
  mlh1_mutation?: "Positive" | "Negative";
  msh2_mutation?: "Positive" | "Negative";
  msh6_mutation?: "Positive" | "Negative";
  pms2_mutation?: "Positive" | "Negative";

  // Other Common Hereditary Cancers
  apc_mutation?: "Positive" | "Negative"; // Familial adenomatous polyposis
  mutyh_mutation?: "Positive" | "Negative";
}
export interface ImmunologyAutoimmuneGeneticsPanel {
  // HLA Typing (Human Leukocyte Antigen)
  hla_dq2_present?: boolean; // Celiac Disease risk
  hla_dq8_present?: boolean; // Celiac Disease risk
  hla_b27_present?: boolean; // Ankylosing Spondylitis / Autoimmune arthritis
  hla_drb1_shared_epitope?: boolean; // Rheumatoid Arthritis severity marker
}
export interface CarrierStatusPanel {
  // Recessive genetic disorders (relevant for family planning)
  cftr_variants?: string[]; // Cystic Fibrosis (Array of specific variant IDs found, empty if none)
  hbb_variants?: string[]; // Sickle Cell Anemia / Beta Thalassemia
  hexA_variants?: string[]; // Tay-Sachs Disease
  smn1_copy_number?: 0 | 1 | 2 | 3; // Spinal Muscular Atrophy (0 or 1 indicates carrier/affected)
  galt_variants?: string[]; // Classic Galactosemia
}
export interface FitnessAndTraitsPanel {
  // Muscle & Performance
  actn3_r577x?: "C/C (Power/Sprint)" | "C/T (Mixed)" | "T/T (Endurance)";
  ace_i_d?: "I/I (Endurance)" | "I/D (Mixed)" | "D/D (Power)";

  // Diet & Body Composition
  fto_rs9939609?: Zygosity; // "Obesity gene" - propensity to gain weight
  mcm6_rs4988235?: "Lactose Tolerant" | "Lactose Intolerant"; // Lactase persistence
  aldh2_rs671?:
    | "Normal"
    | "Heterozygous (Moderate Flush)"
    | "Homozygous (Severe Flush)"; // Alcohol flush reaction
  cyp1a2_caffeine_metabolism?: "Fast" | "Slow"; // Practical translation of CYP1A2 for fitness/sleep
}
export interface GeneticProfile {
  pharmacogenomics?: PharmacogenomicsPanel;
  nutrigenomics?: NutrigenomicsPanel;
  cardiovascular?: CardiovascularGeneticsPanel;
  oncology?: OncologyGeneticsPanel;
  immunology?: ImmunologyAutoimmuneGeneticsPanel;
  carrier_status?: CarrierStatusPanel;
  fitness_and_traits?: FitnessAndTraitsPanel;

  // Metadata for the genetic test itself
  test_provider?: string; // e.g., "23andMe", "Color", "MaxGen"
  date_analyzed?: string; // ISO 8601 Date
}

export interface Subject {
  age: number;
  weight: number;
  height: number;
  sex: BiologicalSex;
  cycleLength: number;
  lutealPhaseLength: number;
  cycleDay: number;
  bodyComposition?: BodyCompositionPanel;
  genetics: GeneticProfile;
  bloodwork?: Bloodwork;
  microbiome?: MicrobiomeAndGIPanel;
  diurnalHormone?: DiurnalHormonePanel;
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
