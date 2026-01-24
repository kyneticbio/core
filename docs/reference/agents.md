<script setup>
import { data as agents } from './agents.data.ts'
import Catalog from '../components/Catalog.vue'
</script>

# Agent

Agents are the underlying substances or specific stressors (e.g., Caffeine, Melatonin, Heat) that drive the pharmacological effects of an Intervention.

## API Reference

```typescript
import { Agents } from '@kyneticbio/core'

// Agents is an object containing factory functions for pharmacology
const caffeineDef = Agents.Caffeine(100) // 100mg
```

<Catalog :items="agents" type="Agent" />