# Mechanism

Mechanisms (specifically PD Mechanisms) define the mathematical relationship between an Agent and its biological target (like a receptor or enzyme).

## API Reference

```typescript
import { type PDMechanism } from '@kyneticbio/core'

// PDMechanism is a union type: 'agonist' | 'antagonist' | 'PAM' | 'NAM'
const mechanism: PDMechanism = 'agonist'
```

## Supported Mechanisms

| Mechanism | Description |
|-----------|-------------|
| **Agonist** | Binds to a receptor and activates it, mimicking the effect of a natural signal. |
| **Antagonist** | Binds to a receptor and blocks it, preventing other signals from activating it. |
| **PAM** | **Positive Allosteric Modulator**: Increases the activity of a receptor when a natural signal is present. |
| **NAM** | **Negative Allosteric Modulator**: Decreases the activity of a receptor when a natural signal is present. |

## How they are used
Mechanisms are defined in an agent's pharmacology. For example, Caffeine acts as an **Antagonist** for Adenosine receptors, while many medications act as **Agonists** for specific receptors.