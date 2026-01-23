# Getting Started

## Installation

Install the package via npm:

```bash
npm install @kyneticbio/core
```

## Basic Concepts

The engine operates on a few core concepts:

1. **State**: A snapshot of all signals, auxiliary variables, and PK compartments.
2. **Context**: Environmental variables like time of day and subject physiology.
3. **Integration**: The process of advancing the state forward in time.

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
