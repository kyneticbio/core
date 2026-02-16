# Getting Started

## Try Kinetic Studio

Check out the [Kynetic Studio](https://physim.jeffjassky.com) app and learn how to use it:

- [Demo video part 1 (5 min)](https://www.loom.com/share/56e0a83634974a1da8f4d94cd6b6ecea)
- [Demo video part 2 (4 min)](https://www.loom.com/share/adafe688d69e4f8d99d7d4648736ba80)

## Join the Community on Discord

Join other users, testers, scientists and developers on the [Kynetic Bio Discord Server](https://discord.gg/FUqxCk8J)

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
