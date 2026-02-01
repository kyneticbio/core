# Next Steps: Body Recomposition & Closed-Loop Simulation

## Objective
Transform KyneticBio from a "snapshot" simulator into a "progression" simulator. By closing the loop between transient signaling (mTOR, AMPK) and long-term biometrics (Weight, LBM), we create a high-interest feedback loop for users (especially AuDHD) to see the long-term impact of their routines.

---

## 1. The "Closed-Loop" Architecture
Currently, `Subject` biometrics are static inputs. We will introduce **Auxiliary Integrators**—slow-moving variables that accumulate the output of the fast-moving signal system.

### New Auxiliary Variables (`src/endogenous/targets/auxiliary.ts`)
*   **`muscleProteinSynthesis` (MPS):** Integrates the Area Under the Curve (AUC) of `mTOR` when amino acids are present.
*   **`fatOxidationRate` (FOX):** Integrates the AUC of `AMPK` when `insulin` is low.
*   **`virtualWeight`:** A slow-moving integrator that combines `leanBodyMass` and `fatMass` deltas.

---

## 2. Real-Time Energy Balance (CICO)
We will implement a `calorieBalance` system that functions as a continuous-time signal rather than a simple daily total.

### Implementation Logic
1.  **Baseline Burn:** The setpoint for `burnRate` is derived from `Physiology.bmr`.
2.  **Activity Burn:** `Exercise` interventions will now include a `caloricDemand` parameter that spikes the `burnRate` signal.
3.  **Intake:** `Food` interventions contribute to `caloricIntake` (split by macro-timing).
4.  **Signal:** `netEnergy = caloricIntake - burnRate`.
    *   If `netEnergy > 0` and `insulin` is high -> `fatMass` increases.
    *   If `netEnergy < 0` -> `glycogen` depletes first, then `fatMass` decreases (driven by `ampk`).

---

## 3. Interest-Based "Level Up" Signals
To keep the user engaged, we need signals that feel like "progression bars."

*   **`StrengthReadiness` (Signal):** 
    *   Decreases immediately after `MechanicalLoad` (Exercise).
    *   Increases during `Sleep` and `Recovery` (GABA/Growth Hormone high).
    *   **The Hook:** Users can see their "Power" returning higher than the previous baseline—the "Supercompensation" effect.
*   **`NeuroplasticityScore`:** A derived signal combining `BDNF` AUC and `SleepQuality`. Validates the "mental gains" of working out.

---

## 4. Dynamic BMR Drift
We will update `derivePhysiology` to be reactive to the simulation state.
*   **The Logic:** As `virtualLeanMass` increases in the simulation, the `BMR` parameter used in the ODE solver scales up proportionally.
*   **The Result:** A month-long simulation will show the user burning more calories at rest on Day 30 than on Day 1 because they built "Virtual Muscle."

---

## 5. TDD Validation Strategy
We will adhere to the Kynetic Validation Standard by writing long-form tests:

1.  **The "Consistent Lifter" Test (7-Day):** 
    *   **Input:** 4x Resistance Training + High Protein.
    *   **Expectation:** `virtualWeight` stable or slightly down, `leanBodyMass` increased by ~0.05kg, `BMR` shifted up by ~5-10kcal.
2.  **The "Fasted Cardio" Test (24-Hour):**
    *   **Input:** Morning Cardio (Fasted) vs Evening Cardio (Fed).
    *   **Expectation:** Fasted Cardio shows significantly higher `fatOxidationRate` (AMPK) AUC.

---

## 6. Implementation Task List
- [ ] **Phase 1:** Add `muscleMass` and `fatMass` auxiliary integrators.
- [ ] **Phase 2:** Implement `caloricIntake` and `burnRate` signals in the metabolic system.
- [ ] **Phase 3:** Update `Exercise` and `Food` interventions to drive these new integrators.
- [ ] **Phase 4:** Enable "Multi-Day Drift" in the integration loop.
