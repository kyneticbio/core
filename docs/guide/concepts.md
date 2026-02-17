# Core Concepts

KyneticBio models your body as a system of interacting signals - neurotransmitters, hormones, metabolic markers - that respond to the things you do: take a supplement, drink coffee, exercise, sleep. Instead of guessing what happens, you simulate it.

The core idea is simple:

> **You** (a Subject) have a unique physiology and **Conditions**. When you apply **Interventions** (drugs, supplements, lifestyle), the **Engine** calculates how your **Signals** (dopamine, cortisol, glucose, etc.) change over time.

### A Concrete Example

You're a 30-year-old male with ADHD. You drink a cup of coffee at 8am. KyneticBio shows you exactly how your dopamine, adenosine, and cortisol respond over the next 6 hours - and what happens differently if you take L-theanine with it.

---

### 1. The Engine

The **Engine** is the "brain" of the simulation. It is a high-performance mathematical solver that calculates how biological systems change over time using Ordinary Differential Equations (ODEs).

### 2. The Subject

The **Subject** represents the person being simulated. It defines the physical constraints like age, weight, and sex which the engine uses to scale metabolic rates and volumes of distribution.

#### TypeScript Shape

```typescript
interface Subject {
  age: number;
  weight: number;      // kg
  height: number;      // cm
  sex: "male" | "female";
  cycleLength: number; // For female subjects
  cycleDay: number;    // Current day in cycle
}
```

#### Example

```typescript
const subject: Subject = {
  age: 32,
  weight: 80,
  height: 180,
  sex: "male",
  cycleLength: 28,
  cycleDay: 1
};
```

### 3. Signals

**Signals** are the outputs of the simulation. They represent measurable physiological values that change over time.

#### TypeScript Shape

```typescript
interface SignalDefinition {
  key: string;
  label: string;
  unit: string;
  initialValue: number;
  dynamics: {
    setpoint: (ctx: DynamicsContext) => number; // Target level
    tau: number;                                // Speed of change (min)
    production: ProductionTerm[];               // What creates it
    clearance: ClearanceTerm[];                 // What removes it
    couplings: DynamicCoupling[];               // How other signals affect it
  };
}
```

#### Example

```typescript
const dopamine: SignalDefinition = {
  key: "dopamine",
  label: "Dopamine",
  unit: "nM",
  initialValue: 10,
  dynamics: {
    setpoint: (ctx) => ctx.isAsleep ? 5 : 12,
    tau: 120,
    production: [{ source: "constant", coefficient: 0.01 }],
    clearance: [{ type: "enzyme-dependent", enzyme: "DAT", rate: 0.02 }],
    couplings: [{ source: "cortisol", effect: "stimulate", strength: 0.001 }]
  }
};
```

### 4. Conditions

**Conditions** are baseline adjustments to the subject's physiology. They represent long-term traits or neurophysiological profiles by modifying receptor densities or signal baselines.

#### TypeScript Shape

```typescript
interface ConditionDef {
  key: string;
  label: string;
  params: ConditionParam[]; // Adjustable intensity
  receptorModifiers?: ReceptorModifier[];
  transporterModifiers?: TransporterModifier[];
  signalModifiers?: SignalModifier[];
}
```

#### Example

```typescript
const adhd: ConditionDef = {
  key: "adhd",
  label: "ADHD",
  params: [{ key: "severity", label: "Severity", default: 0.5, min: 0, max: 1 }],
  receptorModifiers: [
    { receptor: "D2", density: -0.3 } // 30% reduction in D2 density
  ],
  transporterModifiers: [
    { transporter: "DAT", activity: 0.2 } // 20% increase in DAT clearance
  ]
};
```

### 5. Interventions

**Interventions** are external events that affect the simulation. They use **Pharmacology** (PK/PD) to interact with the engine's targets.

#### TypeScript Shape

```typescript
interface InterventionDef {
  key: string;
  label: string;
  params: ParamDef[]; // Dose, duration, etc.
  pharmacology: (params: any) => PharmacologyDef;
}

interface PharmacologyDef {
  pk: { halfLifeMin: number; bioavailability: number; ... };
  pd: Array<{
    target: string;
    mechanism: "agonist" | "antagonist" | "PAM" | "NAM";
    intrinsicEfficacy: number;
  }>;
}
```

#### Example

```typescript
const caffeinePill: InterventionDef = {
  key: "caffeinePill",
  label: "Caffeine Pill",
  params: [{ key: "mg", label: "Dose", default: 100 }],
  pharmacology: (params) => ({
    pk: { halfLifeMin: 300, bioavailability: 0.99 },
    pd: [
      { target: "A1", mechanism: "antagonist", intrinsicEfficacy: 50 },
      { target: "A2A", mechanism: "antagonist", intrinsicEfficacy: 50 }
    ]
  })
};
```
