# Core Concepts

In KyneticBio Core, the simulation process is very straightforward:

> The **Engine** takes a **Subject** (a person) with specific **Conditions** (like ADHD), applies **Interventions** (like caffeine) over time, and produces **Signals** (like dopamine) as the output.

### A Concrete Example:

The **Engine** simulates a **Subject** (a 30-year-old male) who has **ADHD** (Condition). When he drinks a cup of **Caffeine** (Intervention), the engine calculates how his **Dopamine** (Signal) levels will change over the next few hours.

---

### 1. The Engine

The **Engine** is the "brain" of the simulation. It is a high-performance mathematical solver that calculates how biological systems change over time using Ordinary Differential Equations (ODEs).

### 2. The Subject

The **Subject** represents the person being simulated. This includes their basic physical profile:

- **Biometrics**: Age, weight, height, and sex.
- **Physiology**: Derived values like metabolic rate (BMR), body water, and organ blood flow.
- **Cycles**: For female subjects, this includes their hormonal cycle state.

### 3. Signals

**Signals** are the outputs of the simulation. They represent measurable physiological values that change over time.

- **Example**: **Dopamine** is a signal. The engine tracks its concentration in the brain, which affects focus and mood. Other examples include Heart Rate, Blood Glucose, or Sleep Pressure.
- **How they work**: Signals interact with each other in complex "Systems." For example, high dopamine might inhibit the signal for sleepiness.

### 4. Conditions

**Conditions** are baseline adjustments to the subject's physiology. They represent long-term traits or neurophysiological profiles.

- **Example**: **ADHD** is a condition. It tells the engine that this specific subject has different baseline dopamine receptor densities or neurotransmitter clearance rates compared to a "typical" profile.
- **How they work**: A condition doesn't just add a fixed value; it changes the "rules" of the simulation for that subject.

### 5. Interventions

**Interventions** are external events that affect the simulation over time.

- **Example**: **Caffeine** is an intervention. When added to the timeline, the engine simulates its absorption into the blood and its subsequent effect on adenosine receptors and dopamine signaling.
- **How they work**: Interventions enter the body, are metabolized (Pharmacokinetics), and then interact with biological targets (Pharmacodynamics) to modify signals.
