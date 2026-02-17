# Subject

The Subject represents the biological profile of the individual being simulated. It defines the baseline constraints and physical characteristics that the engine uses to scale all physiological processes.

## API Reference

```typescript
import {
  type Subject,
  type Physiology,
  type Bloodwork,
  DEFAULT_SUBJECT,
  DEFAULT_BLOODWORK,
  derivePhysiology
} from '@kyneticbio/core'

const subject: Subject = DEFAULT_SUBJECT
const physiology: Physiology = derivePhysiology(subject)
```

## Core Parameters

| Parameter | Description |
|-----------|-------------|
| **Age** | Used to scale metabolic rate and organ function over time. |
| **Weight** | Essential for calculating volume of distribution (Vd) for interventions. |
| **Height** | Used alongside weight to determine Body Surface Area (BSA) and BMI. |
| **Sex** | Determines hormonal baselines and certain metabolic clearance rates. |
| **Cycle State** | For female subjects, defines the current phase of the menstrual cycle. |
| **Bloodwork** | Optional lab results used to personalize signal baselines and PK parameters. |

## Derived Physiology

The engine automatically calculates several secondary values based on the subject's biometrics:
- **BMR**: Basal Metabolic Rate (Mifflin-St Jeor).
- **TBW**: Total Body Water (critical for water-soluble drug distribution).
- **eGFR**: Estimated Glomerular Filtration Rate (kidney clearance). When bloodwork includes a measured eGFR, that value is used instead of the Cockcroft-Gault estimate.
- **Liver Blood Flow**: Used for hepatic clearance of substances.

## Bloodwork

The optional `bloodwork` property on `Subject` allows you to provide real lab results. When present, these values personalize:

1. **Signal baselines** - Signals initialize at the subject's measured value instead of population averages.
2. **Signal setpoints** - Homeostatic targets shift to match the subject's labs, so the simulation equilibrates around their real physiology.
3. **Drug clearance** - Renal elimination scales with eGFR; hepatic elimination scales with ALT; volume of distribution adjusts for low albumin.

When `bloodwork` is omitted or a specific field is missing, the engine falls back to population defaults. Existing simulations without bloodwork produce identical results.

### Bloodwork Types

```typescript
interface Bloodwork {
  metabolic?: Partial<MetabolicPanel>;
  hematology?: Partial<HematologyPanel>;
  inflammation?: Partial<InflammatoryPanel>;
  hormones?: Partial<HormonalPanel>;
}
```

Every field at every level is optional. You can provide as little or as much data as you have.

### MetabolicPanel

| Field | Unit | Population Default | Normal Range |
|-------|------|--------------------|--------------|
| `albumin_g_dL` | g/dL | 4.0 | 3.5 - 5.0 |
| `creatinine_mg_dL` | mg/dL | 0.9 | 0.6 - 1.2 |
| `eGFR_mL_min` | mL/min | 100 | 90 - 120 |
| `alt_U_L` | U/L | 25 | 7 - 56 |
| `ast_U_L` | U/L | 22 | 10 - 40 |
| `bilirubin_mg_dL` | mg/dL | 0.7 | 0.1 - 1.2 |
| `potassium_mmol_L` | mmol/L | 4.2 | 3.5 - 5.0 |
| `glucose_mg_dL` | mg/dL | 90 | 70 - 100 (fasting) |

### HematologyPanel

| Field | Unit | Population Default | Normal Range |
|-------|------|--------------------|--------------|
| `hemoglobin_g_dL` | g/dL | 14.5 | 12.0 - 17.5 |
| `hematocrit_pct` | % | 43 | 36 - 54 |
| `platelet_count_k_uL` | K/uL | 250 | 150 - 400 |
| `wbc_count_k_uL` | K/uL | 7.0 | 4.5 - 11.0 |

### InflammatoryPanel

| Field | Unit | Population Default | Normal Range |
|-------|------|--------------------|--------------|
| `hsCRP_mg_L` | mg/L | 1.0 | < 3.0 |
| `ferritin_ng_mL` | ng/mL | 50 | 12 - 300 |

### HormonalPanel

| Field | Unit | Population Default | Normal Range |
|-------|------|--------------------|--------------|
| `tsh_uIU_mL` | uIU/mL | 2.0 | 0.4 - 4.0 |
| `cortisol_ug_dL` | ug/dL | 12 | 6 - 18 |
| `free_testosterone_pg_mL` | pg/mL | 15 | Varies by sex |

### Example: Subject with Impaired Renal Function

```typescript
import { type Subject, DEFAULT_SUBJECT, derivePhysiology } from '@kyneticbio/core'

const subject: Subject = {
  ...DEFAULT_SUBJECT,
  bloodwork: {
    metabolic: {
      eGFR_mL_min: 50,        // Stage 3 CKD
      creatinine_mg_dL: 1.8,  // Elevated
      albumin_g_dL: 3.2,      // Low
    }
  }
}

const physiology = derivePhysiology(subject)
// physiology.estimatedGFR === 50 (uses bloodwork, not Cockcroft-Gault)

// When this subject takes a renally-cleared drug:
// - Elimination rate is halved (eGFR 50 / 100)
// - Effective Vd is increased (albumin 4.0 / 3.2 = 1.25x)
// - Drug half-life approximately doubles
```

### Example: Personalized Metabolic Baseline

```typescript
const prediabeticSubject: Subject = {
  ...DEFAULT_SUBJECT,
  bloodwork: {
    metabolic: { glucose_mg_dL: 110 },
    inflammation: { hsCRP_mg_L: 4.5, ferritin_ng_mL: 280 },
  }
}

// Glucose signal initializes at 110 mg/dL (not the default 90)
// Glucose setpoint equilibrates at 110 mg/dL
// hs-CRP and Ferritin signals reflect the subject's elevated values
```

### How Bloodwork Affects PK

The engine adjusts pharmacokinetic parameters for drugs that declare renal or hepatic clearance routes:

| Bloodwork Marker | PK Parameter Affected | Adjustment |
|------------------|----------------------|------------|
| **eGFR** | Renal elimination rate ($k_e$) | Scaled by `subjectGFR / 100` |
| **ALT** | Hepatic elimination rate ($k_e$) | Normal if ALT ≤ 40; progressively reduced above 40, floor at 30% |
| **Albumin** | Volume of distribution ($V_d$) | Increased when albumin < 3.5 g/dL (ratio: `4.0 / subjectAlbumin`) |

These adjustments are applied automatically and only when the drug's PK definition includes the relevant clearance route (`pk.clearance.renal` or `pk.clearance.hepatic`).
