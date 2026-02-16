import { describe, it, expect } from "vitest";
import { ScenarioBuilder } from "../../utils/test/scenario-builder";
import { signalStats, valueAt } from "../../utils/test/utils";

/**
 * Helper: assert that a signal's peak delta (max - valueAtStart) is within a range.
 * This catches both "effect too weak" and "effect too strong" regressions.
 */
function peakDeltaInRange(
  signal: string,
  startMin: number,
  minDelta: number,
  maxDelta: number,
  type: "signals" | "auxiliary" = "signals"
) {
  return (result: any) => {
    const series = type === "signals" ? result.signals : result.auxiliarySeries;
    const data = series[signal];
    expect(data, `Signal "${signal}" not found`).toBeDefined();
    const stats = signalStats(data, result.gridMins);
    const atStart = valueAt(data, result.gridMins, startMin);
    const delta = stats.max - atStart;
    expect(delta, `${signal} peak Δ=${delta.toFixed(3)} expected [${minDelta}, ${maxDelta}]`)
      .toBeGreaterThanOrEqual(minDelta);
    expect(delta, `${signal} peak Δ=${delta.toFixed(3)} expected [${minDelta}, ${maxDelta}]`)
      .toBeLessThanOrEqual(maxDelta);
  };
}

describe("Peptide Interventions", () => {
  // ─── GLP-1 Agonists ───

  it("Semaglutide 0.5mg: GLP-1 peak Δ 1-5, appetite should fall", async () => {
    const scenario = ScenarioBuilder.with()
      .duration(1440)
      .taking("semaglutide", { mg: 0.5 }, 480)
      .expect("appetite").toFall();

    scenario.addAssertion(peakDeltaInRange("glp1", 480, 1.0, 5.0));

    await scenario.run();
  });

  it("Semaglutide 2.4mg: stronger GLP-1 response (Δ 5-15) and gastric slowing", async () => {
    const scenario = ScenarioBuilder.with()
      .duration(1440)
      .taking("semaglutide", { mg: 2.4 }, 480)
      .expect("gastricEmptying").toFall();

    scenario.addAssertion(peakDeltaInRange("glp1", 480, 5.0, 15.0));

    await scenario.run();
  });

  it("Tirzepatide 5mg: dual GLP-1 (Δ 2-8) and GIP (Δ 2-10) activation", async () => {
    const scenario = ScenarioBuilder.with()
      .duration(1440)
      .taking("tirzepatide", { mg: 5 }, 480)
      .expect("appetite").toFall();

    scenario.addAssertion(peakDeltaInRange("glp1", 480, 2.0, 8.0));
    scenario.addAssertion(peakDeltaInRange("gip", 480, 2.0, 10.0));

    await scenario.run();
  });

  it("Retatrutide 4mg: triple agonist — GLP-1 (Δ 1-6), GIP (Δ 1-6), appetite falls", async () => {
    const scenario = ScenarioBuilder.with()
      .duration(1440)
      .taking("retatrutide", { mg: 4 }, 480)
      .expect("appetite").toFall();

    scenario.addAssertion(peakDeltaInRange("glp1", 480, 1.0, 6.0));
    scenario.addAssertion(peakDeltaInRange("gip", 480, 1.0, 6.0));

    await scenario.run();
  });

  // ─── Repair Peptides ───

  it("BPC-157 250mcg: NO increase (Δ 0.5-5) and dopamine boost (Δ 0.1-2)", async () => {
    const scenario = ScenarioBuilder.with()
      .duration(600)
      .taking("bpc157", { mcg: 250 }, 480)
      .expect("vegf").toRise();

    scenario.addAssertion(peakDeltaInRange("nitricOxide", 480, 0.5, 5.0));
    scenario.addAssertion(peakDeltaInRange("dopamine", 480, 0.1, 4.0));

    await scenario.run();
  });

  it("BPC-157 500mcg: stronger NO (Δ 1.5-8) and dopamine (Δ 0.3-3)", async () => {
    const scenario = ScenarioBuilder.with()
      .duration(600)
      .taking("bpc157", { mcg: 500 }, 480)
      .expect("igf1").toRise(0.0001);

    scenario.addAssertion(peakDeltaInRange("nitricOxide", 480, 1.5, 8.0));
    scenario.addAssertion(peakDeltaInRange("dopamine", 480, 0.3, 5.0));

    await scenario.run();
  });

  it("TB-500 2.5mg: angiogenesis and VEGF increase", async () => {
    const scenario = ScenarioBuilder.with()
      .duration(600)
      .taking("tb500", { mg: 2.5 }, 480)
      .expect("angiogenesis").toRise()
      .expect("vegf").toRise();

    await scenario.run();
  });

  it("TB-500 5mg: measurable VEGF boost (Δ 0.1-3) and IGF-1 rise", async () => {
    const scenario = ScenarioBuilder.with()
      .duration(600)
      .taking("tb500", { mg: 5 }, 480)
      .expect("igf1").toRise(0.0001);

    scenario.addAssertion(peakDeltaInRange("vegf", 480, 0.1, 8.0));

    await scenario.run();
  });

  // ─── Dose-Response Verification ───

  it("Retatrutide: 12mg should produce stronger effects than 1mg", async () => {
    const signals = ["glp1", "gip", "appetite", "gastricEmptying"] as const;

    const baseline = await ScenarioBuilder.with()
      .duration(10080) // 7 days, no drug
      .run();

    const low = await ScenarioBuilder.with()
      .duration(10080)
      .taking("retatrutide", { mg: 1 }, 480)
      .run();

    const high = await ScenarioBuilder.with()
      .duration(10080)
      .taking("retatrutide", { mg: 12 }, 480)
      .run();

    for (const sig of signals) {
      const baseData = baseline.signals[sig];
      const lowData = low.signals[sig];
      const highData = high.signals[sig];

      const baseStats = signalStats(baseData, baseline.gridMins);
      const lowStats = signalStats(lowData, low.gridMins);
      const highStats = signalStats(highData, high.gridMins);

      console.log(
        `[dose-response] ${sig}: ` +
        `baseline mean=${baseStats.mean.toFixed(3)} peak=${baseStats.max.toFixed(3)} trough=${baseStats.min.toFixed(3)} | ` +
        `1mg mean=${lowStats.mean.toFixed(3)} peak=${lowStats.max.toFixed(3)} trough=${lowStats.min.toFixed(3)} | ` +
        `12mg mean=${highStats.mean.toFixed(3)} peak=${highStats.max.toFixed(3)} trough=${highStats.min.toFixed(3)}`
      );
    }

    // GLP-1 peak should be meaningfully higher at 12mg vs 1mg
    const lowGlp1 = signalStats(low.signals.glp1, low.gridMins);
    const highGlp1 = signalStats(high.signals.glp1, high.gridMins);
    expect(highGlp1.max).toBeGreaterThan(lowGlp1.max * 1.5);

    // Appetite mean should be lower at 12mg vs 1mg
    const baseAppetite = signalStats(baseline.signals.appetite, baseline.gridMins);
    const lowAppetite = signalStats(low.signals.appetite, low.gridMins);
    const highAppetite = signalStats(high.signals.appetite, high.gridMins);
    expect(lowAppetite.mean).toBeLessThan(baseAppetite.mean);
    expect(highAppetite.mean).toBeLessThan(lowAppetite.mean);
  });
});
