<script setup>
import { data as signals } from './signals.data.ts'
import Catalog from '../components/Catalog.vue'
</script>

# Signal

Signals represent the state of various physiological variables in the body. They are the primary output of the simulation, tracking how everything from hormone levels to heart rate changes over time.

Signals are organized into systems: Nervous, Endocrine, Metabolic, Reproductive, Cardiovascular, Organ Health, Hematology, and Nutritional. Many signals in the Organ Health, Hematology, Endocrine, Metabolic, and Nutritional systems can be personalized via [Subject bloodwork](/reference/subject#bloodwork) - when lab values are provided, the signal initializes and equilibrates at the subject's measured value instead of the population default.

## API Reference

```typescript
import { SIGNALS_ALL, type Signal, type HematologySignal } from '@kyneticbio/core'

// SIGNALS_ALL is a readonly array of all supported signal keys
console.log(SIGNALS_ALL.includes('dopamine'))   // true
console.log(SIGNALS_ALL.includes('hemoglobin')) // true

// Signal is a TypeScript union type of all valid signal keys
const mySignal: Signal = 'cortisol'
```

<Catalog :items="signals" type="Signal" />
