# Getting Started

## Installation

Install the package via npm:

```bash
npm install @kyneticbio/core
```

## Basic Concepts

Before diving into the code, it's helpful to understand the [Core Concepts](./concepts) of the engine: Engine, Subject, Signals, Conditions, and Interventions.

## Quick Example

```typescript
import { createInitialState, integrateStep, DEFAULT_SUBJECT, derivePhysiology } from '@kyneticbio/core';

// Prepare the subject
const subject = DEFAULT_SUBJECT;
const physiology = derivePhysiology(subject);

// Create initial physiological state
let state = createInitialState({ subject, physiology, isAsleep: false });

// Advance by 1 minute
const ctx = { minuteOfDay: 0, dayOfYear: 1, isAsleep: false, subject, physiology };
const nextState = integrateStep(state, 0, 1.0, ctx);
```
