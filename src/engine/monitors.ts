/**
 * Monitor Evaluation Engine
 *
 * Efficiently evaluates monitors against simulation data.
 * Each pattern type is optimized to minimize operations:
 * - Threshold checks: single pass with early exit
 * - Trend detection: compare endpoints only (O(1))
 * - AUC: single pass summation
 * - Variability: single pass with running sums
 */

import type {
  Monitor,
  MonitorResult,
  SimpleMonitorPattern,
  Signal,
  Minute,
} from "./types";

/** Result of evaluating a single pattern */
interface PatternMatch {
  triggered: boolean;
  detectedAt?: Minute;
  triggerValue?: number | number[];
}

/** Context for pattern evaluation */
interface EvalContext {
  data: Float32Array;
  gridStep: number;
  startMin: number;
}

/** All signal data for composite patterns */
type SignalDataMap = Record<string, Float32Array>;

// ============================================================================
// Pattern Evaluators - Each optimized for minimal operations
// ============================================================================

/**
 * Exceeds: Find first value > threshold
 * O(n) worst case, but exits early on first match
 */
function evalExceeds(
  ctx: EvalContext,
  value: number,
  sustainedMins?: number
): PatternMatch {
  const { data, gridStep, startMin } = ctx;
  const sustainedSteps = sustainedMins ? Math.ceil(sustainedMins / gridStep) : 1;

  let consecutiveCount = 0;
  let firstExceedIdx = -1;

  for (let i = 0; i < data.length; i++) {
    if (data[i] > value) {
      if (consecutiveCount === 0) firstExceedIdx = i;
      consecutiveCount++;
      if (consecutiveCount >= sustainedSteps) {
        return {
          triggered: true,
          detectedAt: startMin + firstExceedIdx * gridStep,
          triggerValue: data[firstExceedIdx],
        };
      }
    } else {
      consecutiveCount = 0;
      firstExceedIdx = -1;
    }
  }
  return { triggered: false };
}

/**
 * Falls Below: Find first value < threshold
 * O(n) worst case, exits early on first match
 */
function evalFallsBelow(
  ctx: EvalContext,
  value: number,
  sustainedMins?: number
): PatternMatch {
  const { data, gridStep, startMin } = ctx;
  const sustainedSteps = sustainedMins ? Math.ceil(sustainedMins / gridStep) : 1;

  let consecutiveCount = 0;
  let firstBelowIdx = -1;

  for (let i = 0; i < data.length; i++) {
    if (data[i] < value) {
      if (consecutiveCount === 0) firstBelowIdx = i;
      consecutiveCount++;
      if (consecutiveCount >= sustainedSteps) {
        return {
          triggered: true,
          detectedAt: startMin + firstBelowIdx * gridStep,
          triggerValue: data[firstBelowIdx],
        };
      }
    } else {
      consecutiveCount = 0;
      firstBelowIdx = -1;
    }
  }
  return { triggered: false };
}

/**
 * Outside Range: Find first value outside [min, max]
 * O(n) worst case, exits early
 */
function evalOutsideRange(
  ctx: EvalContext,
  min: number,
  max: number,
  sustainedMins?: number
): PatternMatch {
  const { data, gridStep, startMin } = ctx;
  const sustainedSteps = sustainedMins ? Math.ceil(sustainedMins / gridStep) : 1;

  let consecutiveCount = 0;
  let firstOutsideIdx = -1;

  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    if (v < min || v > max) {
      if (consecutiveCount === 0) firstOutsideIdx = i;
      consecutiveCount++;
      if (consecutiveCount >= sustainedSteps) {
        return {
          triggered: true,
          detectedAt: startMin + firstOutsideIdx * gridStep,
          triggerValue: data[firstOutsideIdx],
        };
      }
    } else {
      consecutiveCount = 0;
      firstOutsideIdx = -1;
    }
  }
  return { triggered: false };
}

/**
 * Increases By: Find if any window of windowMins shows an increase >= amount
 * O(n) - sliding window
 */
function evalIncreasesBy(
  ctx: EvalContext,
  amount: number,
  mode: "absolute" | "percent",
  windowMins: number
): PatternMatch {
  const { data, gridStep, startMin } = ctx;
  const windowSteps = Math.ceil(windowMins / gridStep);

  if (data.length < windowSteps) return { triggered: false };

  for (let i = 0; i <= data.length - windowSteps; i++) {
    const startVal = data[i];
    const endVal = data[i + windowSteps - 1]; // Use the actual window end
    const increase = endVal - startVal;
    const threshold = mode === "percent" ? startVal * (amount / 100) : amount;

    if (increase >= threshold) {
      return {
        triggered: true,
        detectedAt: startMin + (i + windowSteps - 1) * gridStep,
        triggerValue: [startVal, endVal],
      };
    }
  }
  return { triggered: false };
}

/**
 * Decreases By: Find if any window of windowMins shows a decrease >= amount
 * O(n) - sliding window
 */
function evalDecreasesBy(
  ctx: EvalContext,
  amount: number,
  mode: "absolute" | "percent",
  windowMins: number
): PatternMatch {
  const { data, gridStep, startMin } = ctx;
  const windowSteps = Math.ceil(windowMins / gridStep);

  if (data.length < windowSteps) return { triggered: false };

  for (let i = 0; i <= data.length - windowSteps; i++) {
    const startVal = data[i];
    const endVal = data[i + windowSteps - 1];
    const decrease = startVal - endVal;
    const threshold = mode === "percent" ? startVal * (amount / 100) : amount;

    if (decrease >= threshold) {
      return {
        triggered: true,
        detectedAt: startMin + (i + windowSteps - 1) * gridStep,
        triggerValue: [startVal, endVal],
      };
    }
  }
  return { triggered: false };
}

/**
 * Trending Up: Compare endpoint to start after window
 * O(1) for simple check, O(n) if confidence required
 */
function evalTrendingUp(
  ctx: EvalContext,
  windowDays: number,
  minSlopePerDay?: number,
  minConfidence?: number
): PatternMatch {
  const { data, gridStep, startMin } = ctx;
  const windowMins = windowDays * 1440;
  const windowSteps = Math.ceil(windowMins / gridStep);

  if (data.length < windowSteps) return { triggered: false };

  const startVal = data[0];
  const endIdx = Math.min(windowSteps, data.length - 1);
  const endVal = data[endIdx];

  // Simple slope check (units per day)
  const slopePerMin = (endVal - startVal) / (endIdx * gridStep);
  const slopePerDay = slopePerMin * 1440;

  if (slopePerDay <= 0) return { triggered: false };

  if (minSlopePerDay && slopePerDay < minSlopePerDay) {
    return { triggered: false };
  }

  // Skip confidence check if not required (saves O(n) computation)
  if (minConfidence) {
    const r2 = computeR2(data, 0, endIdx);
    if (r2 < minConfidence) return { triggered: false };
  }

  return {
    triggered: true,
    detectedAt: startMin + endIdx * gridStep,
    triggerValue: [startVal, endVal],
  };
}

/**
 * Trending Down: Compare endpoint to start after window
 * O(1) for simple check
 */
function evalTrendingDown(
  ctx: EvalContext,
  windowDays: number,
  minSlopePerDay?: number,
  minConfidence?: number
): PatternMatch {
  const { data, gridStep, startMin } = ctx;
  const windowMins = windowDays * 1440;
  const windowSteps = Math.ceil(windowMins / gridStep);

  if (data.length < windowSteps) return { triggered: false };

  const startVal = data[0];
  const endIdx = Math.min(windowSteps, data.length - 1);
  const endVal = data[endIdx];

  const slopePerMin = (endVal - startVal) / (endIdx * gridStep);
  const slopePerDay = slopePerMin * 1440;

  if (slopePerDay >= 0) return { triggered: false };

  if (minSlopePerDay && Math.abs(slopePerDay) < minSlopePerDay) {
    return { triggered: false };
  }

  if (minConfidence) {
    const r2 = computeR2(data, 0, endIdx);
    if (r2 < minConfidence) return { triggered: false };
  }

  return {
    triggered: true,
    detectedAt: startMin + endIdx * gridStep,
    triggerValue: [startVal, endVal],
  };
}

/**
 * High Exposure (AUC): Single-pass trapezoidal sum
 * O(n) - unavoidable for AUC
 */
function evalHighExposure(
  ctx: EvalContext,
  windowMins: number,
  threshold: number
): PatternMatch {
  const { data, gridStep, startMin } = ctx;
  const windowSteps = Math.ceil(windowMins / gridStep);
  const n = Math.min(windowSteps, data.length);

  if (n < 2) return { triggered: false };

  // Trapezoidal integration
  let auc = 0;
  for (let i = 1; i < n; i++) {
    auc += (data[i - 1] + data[i]) * 0.5 * gridStep;
  }

  if (auc > threshold) {
    return {
      triggered: true,
      detectedAt: startMin + (n - 1) * gridStep,
      triggerValue: auc,
    };
  }
  return { triggered: false };
}

/**
 * Low Exposure (AUC): Single-pass trapezoidal sum
 * O(n)
 */
function evalLowExposure(
  ctx: EvalContext,
  windowMins: number,
  threshold: number
): PatternMatch {
  const { data, gridStep, startMin } = ctx;
  const windowSteps = Math.ceil(windowMins / gridStep);
  const n = Math.min(windowSteps, data.length);

  if (n < 2) return { triggered: false };

  let auc = 0;
  for (let i = 1; i < n; i++) {
    auc += (data[i - 1] + data[i]) * 0.5 * gridStep;
  }

  if (auc < threshold) {
    return {
      triggered: true,
      detectedAt: startMin + (n - 1) * gridStep,
      triggerValue: auc,
    };
  }
  return { triggered: false };
}

/**
 * High Variability: Single-pass mean and variance (Welford's algorithm)
 * O(n) - computes CV efficiently
 */
function evalHighVariability(
  ctx: EvalContext,
  windowMins: number,
  cvThreshold: number
): PatternMatch {
  const { data, gridStep, startMin } = ctx;
  const windowSteps = Math.ceil(windowMins / gridStep);
  const n = Math.min(windowSteps, data.length);

  if (n < 2) return { triggered: false };

  // Welford's online algorithm for mean and variance
  let mean = 0;
  let m2 = 0;
  for (let i = 0; i < n; i++) {
    const delta = data[i] - mean;
    mean += delta / (i + 1);
    m2 += delta * (data[i] - mean);
  }

  const variance = m2 / (n - 1);
  const stdDev = Math.sqrt(variance);
  const cv = mean !== 0 ? stdDev / Math.abs(mean) : 0;

  if (cv > cvThreshold) {
    return {
      triggered: true,
      detectedAt: startMin + (n - 1) * gridStep,
      triggerValue: cv,
    };
  }
  return { triggered: false };
}

/**
 * Low Variability: Single-pass CV calculation
 * O(n)
 */
function evalLowVariability(
  ctx: EvalContext,
  windowMins: number,
  cvThreshold: number
): PatternMatch {
  const { data, gridStep, startMin } = ctx;
  const windowSteps = Math.ceil(windowMins / gridStep);
  const n = Math.min(windowSteps, data.length);

  if (n < 2) return { triggered: false };

  let mean = 0;
  let m2 = 0;
  for (let i = 0; i < n; i++) {
    const delta = data[i] - mean;
    mean += delta / (i + 1);
    m2 += delta * (data[i] - mean);
  }

  const variance = m2 / (n - 1);
  const stdDev = Math.sqrt(variance);
  const cv = mean !== 0 ? stdDev / Math.abs(mean) : 0;

  if (cv < cvThreshold) {
    return {
      triggered: true,
      detectedAt: startMin + (n - 1) * gridStep,
      triggerValue: cv,
    };
  }
  return { triggered: false };
}

/**
 * Deviates from Baseline: Compute rolling mean, check deviation
 * O(n) for baseline, then O(n) for deviation check
 */
function evalDeviatesFromBaseline(
  ctx: EvalContext,
  deviation: number,
  mode: "absolute" | "percent",
  direction: "above" | "below" | "either",
  baselineWindowMins: number
): PatternMatch {
  const { data, gridStep, startMin } = ctx;
  const baselineSteps = Math.ceil(baselineWindowMins / gridStep);

  if (data.length < baselineSteps) return { triggered: false };

  // Compute baseline mean over the window
  let baselineSum = 0;
  for (let i = 0; i < baselineSteps; i++) {
    baselineSum += data[i];
  }
  const baseline = baselineSum / baselineSteps;

  // Check subsequent values for deviation
  const threshold = mode === "percent"
    ? baseline * (deviation / 100)
    : deviation;

  for (let i = baselineSteps; i < data.length; i++) {
    const diff = data[i] - baseline;
    const absDiff = Math.abs(diff);

    let triggered = false;
    if (direction === "either" && absDiff > threshold) triggered = true;
    if (direction === "above" && diff > threshold) triggered = true;
    if (direction === "below" && diff < -threshold) triggered = true;

    if (triggered) {
      return {
        triggered: true,
        detectedAt: startMin + i * gridStep,
        triggerValue: data[i],
      };
    }
  }
  return { triggered: false };
}

/**
 * Deviates from Setpoint: Would need setpoint function, skip for now
 * This requires access to the signal definition's setpoint function
 */
function evalDeviatesFromSetpoint(
  ctx: EvalContext,
  deviation: number,
  mode: "absolute" | "percent",
  direction: "above" | "below" | "either",
  _setpointFn?: (idx: number) => number
): PatternMatch {
  // For now, use mean as proxy for setpoint
  // In full implementation, would evaluate setpoint function at each time
  const { data, gridStep, startMin } = ctx;

  // Compute mean as setpoint proxy
  let sum = 0;
  for (let i = 0; i < data.length; i++) sum += data[i];
  const setpoint = sum / data.length;

  const threshold = mode === "percent"
    ? setpoint * (deviation / 100)
    : deviation;

  for (let i = 0; i < data.length; i++) {
    const diff = data[i] - setpoint;
    const absDiff = Math.abs(diff);

    let triggered = false;
    if (direction === "either" && absDiff > threshold) triggered = true;
    if (direction === "above" && diff > threshold) triggered = true;
    if (direction === "below" && diff < -threshold) triggered = true;

    if (triggered) {
      return {
        triggered: true,
        detectedAt: startMin + i * gridStep,
        triggerValue: data[i],
      };
    }
  }
  return { triggered: false };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Compute R² (coefficient of determination) for linear fit
 * O(n) - only called when confidence check is required
 */
function computeR2(data: Float32Array, startIdx: number, endIdx: number): number {
  const n = endIdx - startIdx + 1;
  if (n < 2) return 0;

  // Compute means
  let sumX = 0, sumY = 0;
  for (let i = startIdx; i <= endIdx; i++) {
    sumX += i;
    sumY += data[i];
  }
  const meanX = sumX / n;
  const meanY = sumY / n;

  // Compute slope and intercept
  let num = 0, denX = 0, denY = 0;
  for (let i = startIdx; i <= endIdx; i++) {
    const dx = i - meanX;
    const dy = data[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  if (denX === 0 || denY === 0) return 0;

  // R² = (covariance)² / (var_x * var_y)
  const r2 = (num * num) / (denX * denY);
  return r2;
}

// ============================================================================
// Main Evaluation Functions
// ============================================================================

/**
 * Evaluate a single pattern against signal data
 */
function evaluatePattern(
  pattern: SimpleMonitorPattern,
  ctx: EvalContext
): PatternMatch {
  switch (pattern.type) {
    case "exceeds":
      return evalExceeds(ctx, pattern.value, pattern.sustainedMins);

    case "falls_below":
      return evalFallsBelow(ctx, pattern.value, pattern.sustainedMins);

    case "outside_range":
      return evalOutsideRange(
        ctx,
        pattern.min ?? -Infinity,
        pattern.max ?? Infinity,
        pattern.sustainedMins
      );

    case "deviates_from_setpoint":
      return evalDeviatesFromSetpoint(
        ctx,
        pattern.deviation,
        pattern.mode,
        pattern.direction
      );

    case "deviates_from_baseline":
      return evalDeviatesFromBaseline(
        ctx,
        pattern.deviation,
        pattern.mode,
        pattern.direction,
        pattern.baselineWindowMins
      );

    case "increases_by":
      return evalIncreasesBy(ctx, pattern.amount, pattern.mode, pattern.windowMins);

    case "decreases_by":
      return evalDecreasesBy(ctx, pattern.amount, pattern.mode, pattern.windowMins);

    case "trending_up":
      return evalTrendingUp(
        ctx,
        pattern.windowDays,
        pattern.minSlopePerDay,
        pattern.minConfidence
      );

    case "trending_down":
      return evalTrendingDown(
        ctx,
        pattern.windowDays,
        pattern.minSlopePerDay,
        pattern.minConfidence
      );

    case "high_exposure":
      return evalHighExposure(ctx, pattern.windowMins, pattern.threshold);

    case "low_exposure":
      return evalLowExposure(ctx, pattern.windowMins, pattern.threshold);

    case "high_variability":
      return evalHighVariability(ctx, pattern.windowMins, pattern.cvThreshold);

    case "low_variability":
      return evalLowVariability(ctx, pattern.windowMins, pattern.cvThreshold);

    default:
      return { triggered: false };
  }
}

/**
 * Evaluate a composite pattern
 */
function evaluateCompositePattern(
  pattern: { operator: "and" | "or"; patterns: Array<{ signal: Signal; pattern: SimpleMonitorPattern }> },
  signalData: SignalDataMap,
  gridStep: number,
  startMin: number
): PatternMatch {
  const results: PatternMatch[] = [];

  for (const sub of pattern.patterns) {
    const data = signalData[sub.signal];
    if (!data) continue;

    const ctx: EvalContext = { data, gridStep, startMin };
    const result = evaluatePattern(sub.pattern, ctx);
    results.push(result);

    // Early exit for OR: first match wins
    if (pattern.operator === "or" && result.triggered) {
      return result;
    }

    // Early exit for AND: first non-match fails
    if (pattern.operator === "and" && !result.triggered) {
      return { triggered: false };
    }
  }

  if (pattern.operator === "and") {
    // All must have triggered
    const allTriggered = results.every(r => r.triggered);
    if (allTriggered && results.length > 0) {
      // Return the latest detection time
      const latestResult = results.reduce((latest, r) =>
        (r.detectedAt ?? 0) > (latest.detectedAt ?? 0) ? r : latest
      );
      // Collect all trigger values, filtering out undefined
      const triggerValues = results
        .map(r => r.triggerValue)
        .filter((v): v is number | number[] => v !== undefined)
        .flat();
      return {
        triggered: true,
        detectedAt: latestResult.detectedAt,
        triggerValue: triggerValues.length > 0 ? triggerValues : 0,
      };
    }
    return { triggered: false };
  }

  // OR: would have returned early if any triggered
  return { triggered: false };
}

/**
 * Evaluate a single monitor against simulation data
 */
export function evaluateMonitor(
  monitor: Monitor,
  signalData: SignalDataMap,
  gridStep: number,
  startMin: number = 0
): MonitorResult | null {
  const pattern = monitor.pattern;

  let match: PatternMatch;

  if (pattern.type === "composite") {
    match = evaluateCompositePattern(pattern, signalData, gridStep, startMin);
  } else {
    const data = signalData[monitor.signal];
    if (!data) return null;

    const ctx: EvalContext = { data, gridStep, startMin };
    match = evaluatePattern(pattern, ctx);
  }

  if (match.triggered) {
    return {
      monitor,
      detectedAt: match.detectedAt ?? startMin,
      triggerValue: match.triggerValue ?? 0,
    };
  }

  return null;
}

/**
 * Evaluate all monitors against simulation data
 * Returns only triggered monitors (for efficiency)
 */
export function evaluateMonitors(
  monitors: Monitor[],
  signalData: SignalDataMap,
  gridStep: number,
  startMin: number = 0
): MonitorResult[] {
  const results: MonitorResult[] = [];

  for (const monitor of monitors) {
    const result = evaluateMonitor(monitor, signalData, gridStep, startMin);
    if (result) {
      results.push(result);
    }
  }

  return results;
}

/**
 * Collect all monitors from signal definitions
 */
export function collectSignalMonitors(
  signalDefs: Partial<Record<string, { monitors?: Monitor[] }>>
): Monitor[] {
  const monitors: Monitor[] = [];

  for (const def of Object.values(signalDefs)) {
    if (def?.monitors) {
      monitors.push(...def.monitors);
    }
  }

  return monitors;
}
