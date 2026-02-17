<script setup>
import { data as interventions } from './interventions.data.ts'
import GroupedCatalog from '../components/GroupedCatalog.vue'
</script>

# Intervention

Interventions are external events-such as taking a medication, eating a meal, or exercising-that modify the subject's physiology over time.

## API Reference

```typescript
import { INTERVENTIONS, type InterventionDef } from '@kyneticbio/core'

// INTERVENTIONS is an array of all intervention definitions
const vyvanse = INTERVENTIONS.find(i => i.key === 'vyvanse')
```

<GroupedCatalog :items="interventions" />
