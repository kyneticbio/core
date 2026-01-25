<script setup>
import { data as conditions } from './conditions.data.ts'
import GroupedCatalog from '../components/GroupedCatalog.vue'
</script>

# Condition

Conditions represent long-term baseline adjustments to a subject's physiology. They are categorized into **Clinical** conditions (e.g., ADHD, POTS) and **Genetic** variants (e.g., COMT, MTHFR).

## Categories

- **Clinical**: Long-term traits or neurophysiological profiles.
- **Genetic**: Specific gene variants (SNPs) that modify enzyme activity or receptor density.
- **Lifestyle**: Chronic physiological states driven by long-term behavior (e.g., chronic sleep deprivation).

## API Reference

```typescript
import { CONDITION_LIBRARY, type ConditionDef } from '@kyneticbio/core'

// CONDITION_LIBRARY contains all neurophysiological profiles
const adhd = CONDITION_LIBRARY.find(c => c.key === 'adhd')
```

<GroupedCatalog :items="conditions" />