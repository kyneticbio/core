# Submissions & Modifications

To ensure the biological and mathematical integrity of the KyneticBio engine, we adhere to a strict **Evidence-First** Testing Standard.

> **The Standard:** EVERY condition, agent, and intervention MUST have EVERY one of its defined effects validated by a corresponding test case derived from peer-reviewed research.

## The TDD Workflow

Before an intervention or agent is defined in the codebase, a test must be written to validate it against established research data.

1. **Identify Research:** Find a peer-reviewed study (e.g., "Caffeine increases systolic blood pressure by X% in healthy males").
2. **Define Test:** Codify the study's parameters (subject profile, dose, timing) and expected outcome.
3. **Implement:** Define the agent/intervention PK/PD parameters until the simulation passes the test.
4. **Validate:** Ensure the result falls within the statistical tolerance defined by the study's evidence level.

---

## Evidence Levels & Confidence Scores

We do not treat all data as equal. Every validation test must be tagged with an `evidenceLevel` which determines the allowed simulation tolerance.

| Score   | Tier              | Description                                     | Simulation Tolerance                               |
| :------ | :---------------- | :---------------------------------------------- | :------------------------------------------------- |
| **5/5** | **Gold Standard** | Meta-Analysis or Systematic Review of RCTs.     | Strict. Must match mean within **±5%**.            |
| **4/5** | **Robust**        | Single large Randomized Controlled Trial (RCT). | High. Must match mean within **±10%**.             |
| **3/5** | **Indicative**    | Cohort Studies or Case-Control Studies.         | Moderate. Must land inside the study's **95% CI**. |
| **2/5** | **Mechanistic**   | Animal Studies (Murine/Rat) or In-Vitro.        | Loosest. Validates **Directionality** only.        |
| **1/5** | **Theoretical**   | Expert opinion or mechanistic hypothesis.       | **Experimental**. No validation required.          |

### Statistical Precision (The "Sigma" Standard)

Biology is noisy. We move away from arbitrary fixed percentages (like "within 1%") and towards scientific significance. A simulation is considered "passing" if it falls within the **95% Confidence Interval (2 Sigma)** of the reference study, unless it is a Tier 5 "Gold Standard" source.

---

## Data Schema

When submitting new agents or interventions, the following metadata should be used in the test definitions:

```typescript
interface ScientificReference {
  citation: string;   // e.g., "Smith et al. 2024, Nature Metabolism"
  doi: string;        // Digital Object Identifier link
  evidenceLevel: 1 | 2 | 3 | 4 | 5;
  sampleSize: number; // N=50
  demographic: string; // e.g., "healthy-male" | "pcos-female"
}

interface TestExpectation {
  reference: ScientificReference;
  variable: SignalKey;
  meanChange: number;         // e.g., +15%
  standardDeviation?: number; // e.g., +/- 5%
  matchType: "strict_mean" | "confidence_interval" | "direction_only";
}
```

---

## The Kynetic Validation Manifesto

### 1. No Agent Without Representation

No biological Agent (drug, nutrient, stressor) is accepted into the core library without at least one `ValidationTest` derived from peer-reviewed literature. We do not hardcode "guessed" values.

### 2. Regression Guardrails

Our CI/CD pipeline runs thousands of "Virtual Clinical Trials" before every deploy. If a code change causes any scenario to deviate from its established pharmacokinetic curve, the build fails immediately and deployment is paused.

### 3. Submission Guidelines

Pull Requests for new Agents, Conditions, or Interventions must include:

- The **Definition File** (PK/PD or adjustment parameters).
- The **Reference DOI**.
- A **Codified Test Case** asserting the expected physiological change.
