<script setup>
import { data as conditions } from './conditions.data.ts'
import Catalog from '../components/Catalog.vue'
</script>

# Condition

Conditions represent long-term baseline adjustments to a subject's physiology. They are used to simulate neurodivergence, chronic illnesses, or specific physiological profiles.

## API Reference

```typescript
import { CONDITION_LIBRARY, type ConditionDef } from '@kyneticbio/core'

// CONDITION_LIBRARY contains all neurophysiological profiles
const adhd = CONDITION_LIBRARY.find(c => c.key === 'adhd')
```

<Catalog :items="conditions" type="Condition" />