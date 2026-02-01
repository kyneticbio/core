# Mechanistic Modifiers: Enzyme, Transporter, and Receptor Effects

## Problem Statement

Conditions (ADHD, MCAS, COMT genotype, etc.) compute mechanistic adjustments:

- `enzymeActivities` - modifiers to enzyme activity (DAO, MAO_A, COMT, MTHFR)
- `transporterActivities` - modifiers to transporter activity (DAT, NET, SERT)
- `receptorDensities` / `receptorSensitivities` - modifiers to receptor function

These are computed in `buildConditionAdjustments()` and passed to the engine via `options`, but **the engine ignores them**. Only `conditionBaselines` (amplitude/phase) and `conditionCouplings` are actually applied.

This means:

- MCAS's DAO reduction → histamine should rise, but doesn't
- ADHD's DAT increase → dopamine should fall faster, but doesn't
- COMT Met/Met → dopamine clearance should slow, but doesn't

## Current Architecture

### Signal Definitions

Signals define clearance mechanisms:

```typescript
// dopamine.ts
clearance: [
  { type: "enzyme-dependent", rate: 0.002, enzyme: "DAT" },
  { type: "enzyme-dependent", rate: 0.001, enzyme: "MAO_B" },
]

// histamine.ts
clearance: [
  { type: "enzyme-dependent", rate: 0.02, enzyme: "DAO" }
]
```

### Engine Clearance Calculation

The engine already handles enzyme-dependent clearance:

```typescript
if (c.type === "enzyme-dependent") {
  const enzymeVal = c.enzymeIndex !== -1 ? state[c.enzymeIndex] : 1.0;
  rate *= enzymeVal;
}
```

But `enzymeIndex` is always -1 (enzymes aren't defined as auxiliary variables), so `enzymeVal` defaults to 1.0.

### Condition Adjustments

Conditions produce modifiers like:

```typescript
enzymeActivities: { DAO: -0.3, MAO_A: -0.2 }
transporterActivities: { DAT: 0.25, NET: 0.15 }
```

These are passed to the engine but never read.

## Proposed Solution

### Core Insight

Transporters and enzymes both affect **clearance rate**. The signal definitions already use "enzyme-dependent" clearance for transporters (DAT, SERT, NET). We can unify them as **clearance modifiers**.

### Mathematical Model

For enzyme-dependent clearance:

```
effective_rate = base_rate × enzyme_value × (1 + modifier)
```

Where:

- `base_rate` = rate from signal definition (e.g., 0.002)
- `enzyme_value` = dynamic value from auxiliary state (defaults to 1.0 if not defined)
- `modifier` = condition adjustment (e.g., +0.25 for ADHD DAT, -0.3 for MCAS DAO)

**Pharmacological interpretation:**

- `modifier = +0.3` → 30% increased activity → 30% faster clearance → lower signal
- `modifier = -0.3` → 30% decreased activity → 30% slower clearance → higher signal

This correctly models:

- ADHD: DAT↑ (+0.25) → dopamine clears 25% faster → lower baseline DA
- MCAS: DAO↓ (-0.3) → histamine clears 30% slower → elevated histamine
- COMT Met/Met: Lower activity → dopamine clears slower → higher PFC dopamine

### Implementation

#### Step 1: Store enzyme name in compiled clearance terms

In `engine.ts`, the clearance compilation currently only stores `enzymeIndex`. Add `enzymeName`:

```typescript
clearance: (def.dynamics.clearance ?? []).map((c: any) => ({
  rate: c.rate,
  type: c.type,
  enzymeIndex: c.enzyme ? (layout.auxiliary.get(c.enzyme) ?? -1) : -1,
  enzymeName: c.enzyme ?? null,  // NEW
  Km: c.Km,
  transform: c.transform,
})),
```

#### Step 2: Create unified clearance modifiers map

At the start of `runOptimizedV2()`:

```typescript
// Merge enzyme and transporter activities into unified clearance modifiers
const clearanceModifiers: Record<string, number> = {
  ...(options?.enzymeActivities ?? {}),
  ...(options?.transporterActivities ?? {}),
};
```

#### Step 3: Apply modifiers during clearance calculation

In `computeDerivativesVector()` and `computeDerivativesVectorAux()`:

```typescript
if (c.type === "enzyme-dependent") {
  const enzymeVal = c.enzymeIndex !== -1 ? state[c.enzymeIndex] : 1.0;
  const modifier = c.enzymeName ? (clearanceModifiers[c.enzymeName] ?? 0) : 0;
  const effectiveEnzyme = enzymeVal * (1 + modifier);
  rate *= debug.enableEnzymes !== false ? effectiveEnzyme : 1.0;
}
```

#### Step 4: Pass clearance modifiers through the call chain

The `computeDerivativesVector` function needs access to `clearanceModifiers`. Options:

1. Add to the `options` parameter already being passed
2. Add to a context object

Cleanest: Add to the existing `options` object that's already threaded through.

### Type Updates

```typescript
// In CompiledClearance type (internal to engine)
interface CompiledClearance {
  rate: number;
  type: string;
  enzymeIndex: number;
  enzymeName: string | null;  // NEW
  Km?: number;
  transform?: Function;
}
```

## Extensibility

### Future: Drug-induced enzyme inhibition/induction

Drugs can inhibit or induce enzymes (e.g., grapefruit juice inhibits CYP3A4). This system supports that:

```typescript
// A drug's PD effect could add to clearanceModifiers
clearanceModifiers['CYP3A4'] = -0.5; // 50% inhibition
```

The same mechanism handles:

- Genetic variants (permanent modifier)
- Conditions (semi-permanent modifier)
- Drug interactions (temporary modifier during drug's action)

### Future: Dynamic enzyme auxiliary variables

If we later want enzymes to have their own dynamics (synthesis, degradation, induction over time), we can:

1. Define them as auxiliary variables with setpoint = 1.0
2. The `enzymeIndex` lookup will find them
3. The modifier still applies on top

This is backwards-compatible because `enzymeVal` defaults to 1.0 when not found.

### Future: Receptor mechanics

Receptors are more complex (affect efficacy, not just clearance), but the pattern is similar:

1. Store receptor modifiers in options
2. Apply during PD calculation where receptor binding affects response

## Testing Strategy

### Unit Tests

1. Verify `clearanceModifiers` map is correctly built from enzyme + transporter activities
2. Verify modifier application: `rate *= (1 + modifier)`
3. Verify negative modifiers decrease clearance (slower removal)
4. Verify positive modifiers increase clearance (faster removal)

### Integration Tests (ScenarioBuilder)

1. **MCAS**: DAO↓ → histamine mean should increase
2. **ADHD**: DAT↑ → dopamine mean should decrease
3. **COMT Met/Met**: Lower activity → dopamine mean should increase vs Val/Val
4. **MTHFR TT**: Signal modifiers → serotonin/dopamine should decrease

### Regression Tests

1. Baseline (no conditions) should produce same results as before
2. Existing condition tests should still pass

## Files to Modify

1. **`src/engine/engine.ts`**
   - Add `enzymeName` to clearance compilation
   - Create `clearanceModifiers` map from options
   - Apply modifier in `computeDerivativesVector()` and `computeDerivativesVectorAux()`

2. **`src/engine/types.ts`** (optional)
   - Document the clearance modifier pattern

3. **`src/endogenous/conditions/genetics/comt.ts`**
   - Update to use enzymeModifier properly (current implementation already correct)

4. **`src/endogenous/conditions/genetics/mthfr.ts`**
   - MTHFR affects synthesis, not clearance - keep using signalModifiers

5. **Test files**
   - Update genetic condition tests to verify signal effects

## Edge Cases

1. **Enzyme not in clearance terms**: Modifier has no effect (harmless)
2. **Multiple conditions affecting same enzyme**: Modifiers sum (already handled in `buildConditionAdjustments`)
3. **Modifier = -1.0 (100% inhibition)**: Clearance stops entirely (rate × 0 = 0) - biologically valid
4. **Modifier < -1.0**: Would cause negative clearance - should clamp to -1.0 or handle in condition definitions

## Implementation Order

1. Modify engine to store `enzymeName` and apply modifiers
2. Run existing tests to verify no regression
3. Update genetic condition tests to use ScenarioBuilder
4. Verify MCAS/ADHD/Anxiety signal effects work correctly
5. Document the pattern in code comments

## Note on MTHFR

MTHFR is different from COMT - it affects **synthesis** (BH4 cofactor for TH/TPH), not clearance. The current approach using `signalModifiers.amplitudeGain` is appropriate for MTHFR. The utils.ts change to allow genetic conditions to apply amplitudeGain is correct.

COMT should work via the enzyme modifier mechanism once implemented.

I've written the full plan to @core/plans/mechanism-planning.md. Key points:

The solution is clean because:

1. Minimal change - Only 3-4 lines added to clearance calculation
2. Unified model - Transporters and enzymes both work as clearance modifiers
3. Backwards compatible - No conditions = no modifiers = same behavior as before
4. Extensible - Same pattern works for drug-enzyme interactions, genetic variants, and conditions
5. Pharmacologically correct - Modifier math matches real biology (±X% activity → ±X% clearance rate)  


Note on MTHFR: It's different from COMT. MTHFR affects synthesis (BH4 cofactor), not clearance. The signalModifiers.amplitudeGain  
 approach is correct for MTHFR. The utils.ts change I made earlier (allowing genetic conditions to apply amplitudeGain) is the right fix.

COMT should work via the enzyme modifier mechanism once implemented.

Ready to implement when you approve the plan.
