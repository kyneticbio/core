<script setup>
import { data as systems } from './systems.data.ts'
import Catalog from '../components/Catalog.vue'
</script>

# System

Systems are logical groupings of related Signals and their governing rules. They represent broad biological domains like the nervous system, metabolism, or organ health.

## API Reference

```typescript
import { BIOLOGICAL_SYSTEMS, type BioSystemDef } from '@kyneticbio/core'

// BIOLOGICAL_SYSTEMS is an array of all top-level system definitions
console.log(BIOLOGICAL_SYSTEMS.map(s => s.label))
```

<Catalog :items="systems" type="System" />