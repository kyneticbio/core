<script setup>
import { data as signals } from './signals.data.ts'
import Catalog from '../components/Catalog.vue'
</script>

# Signal

Signals represent the state of various physiological variables in the body. They are the primary output of the simulation, tracking how everything from hormone levels to heart rate changes over time.

## API Reference

```typescript
import { SIGNALS_ALL, type Signal } from '@kyneticbio/core'

// SIGNALS_ALL is a readonly array of all supported signal keys
console.log(SIGNALS_ALL.includes('dopamine')) // true

// Signal is a TypeScript union type of all valid signal keys
const mySignal: Signal = 'cortisol'
```

<Catalog :items="signals" type="Signal" />
