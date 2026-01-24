# @kyneticbio/core

> The high-performance physiological simulation engine powering KyneticBio.

**[Read the Documentation](https://kyneticbio.github.io/core/)** | **[Try the Interactive Demo](https://kyneticbio.github.io/core/demo.html)**

`@kyneticbio/core` is an ODE-based mathematical model of human physiology. It simulates the complex interplay between endogenous signals (hormones, neurotransmitters, metabolites) and exogenous interventions (pharmacology, nutrition, lifestyle).

## Key Features

- **Mechanistic Simulation**: Uses an Optimized V2 ODE solver for stable, high-performance biological modeling.
- **Pharmacokinetics (PK)**: 1-compartment, 2-compartment, and activity-dependent models with support for bolus and continuous delivery.
- **Pharmacodynamics (PD)**: Operational agonism, competitive/non-competitive antagonism, and receptor-to-signal coupling.
- **Endogenous Systems**: Deep modeling of Circadian rhythms, Metabolism, Autonomic Nervous System, and more.
- **Condition Profiles**: Mechanistic modeling of conditions like ADHD, POTS, and MCAS via receptor/transporter adjustments.
- **Zero Dependencies**: Pure TypeScript/JavaScript, runs in any environment (Node, Browser, Web Workers).

## Installation

```bash
npm install @kyneticbio/core
```

## Quick Start

```typescript
import { 
  createInitialState, 
  integrateStep, 
  DEFAULT_SUBJECT, 
  derivePhysiology 
} from '@kyneticbio/core';

const subject = DEFAULT_SUBJECT;
const physiology = derivePhysiology(subject);

// 1. Initialize state
let state = createInitialState({
  subject,
  physiology,
  isAsleep: false
});

// 2. Define a context
const ctx = {
  minuteOfDay: 480, // 8:00 AM
  circadianMinuteOfDay: 480,
  dayOfYear: 1,
  isAsleep: false,
  subject,
  physiology
};

// 3. Run a simulation step (1 minute)
const dt = 1.0;
const nextState = integrateStep(state, 480, dt, ctx);

console.log('Dopamine Level:', nextState.signals.dopamine);
```

## Testing

The core is rigorously tested with over 160 unit tests covering mathematical accuracy, monotonicity, and biological regressions.

```bash
npm test
```

## License

MIT © KyneticBio