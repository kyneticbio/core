# Getting Started

## What is KyneticBio?

KyneticBio is a physiological simulation engine. Think of it as a flight simulator for your body — you can test how supplements, medications, and lifestyle changes affect your neurochemistry, hormones, and metabolism *before* you actually try them.

**What you can do:**
- See how caffeine affects your dopamine and adenosine hour-by-hour
- Compare Vyvanse vs. Adderall for ADHD across a full day
- Understand why you crash at 3pm and what might actually fix it
- Stack interventions (sleep, exercise, supplements) and see how they interact

## Try Kynetic Studio

The fastest way to start is [Kynetic Studio](https://physim.jeffjassky.com) — the full-featured web interface with drag-and-drop timelines, multi-chart views, and AI chat.

- [Demo video part 1 (5 min)](https://www.loom.com/share/56e0a83634974a1da8f4d94cd6b6ecea)
- [Demo video part 2 (4 min)](https://www.loom.com/share/adafe688d69e4f8d99d7d4648736ba80)

## Join the Community

Join other users, biohackers, scientists, and developers on the [Kynetic Bio Discord](https://discord.gg/FUqxCk8J).

## Use the Engine Directly

KyneticBio Core is an open-source TypeScript library you can embed in your own apps.

### Installation

```bash
npm install @kyneticbio/core
```

### Quick Example

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

### Core Concepts

Before diving deeper, read the [Core Concepts](./concepts) guide to understand how Subjects, Signals, Conditions, and Interventions fit together.
