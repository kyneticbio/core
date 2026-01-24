# Subject

The Subject represents the biological profile of the individual being simulated. It defines the baseline constraints and physical characteristics that the engine uses to scale all physiological processes.

## API Reference

```typescript
import { 
  type Subject, 
  type Physiology, 
  DEFAULT_SUBJECT, 
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

## Derived Physiology

The engine automatically calculates several secondary values based on the subject's biometrics:
- **BMR**: Basal Metabolic Rate.
- **TBW**: Total Body Water (critical for water-soluble drug distribution).
- **eGFR**: Estimated Glomerular Filtration Rate (kidney clearance).
- **Liver Blood Flow**: Used for hepatic clearance of substances.