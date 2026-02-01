import { describe, it, expect } from 'vitest';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Metabolic Progression & Scaling', () => {
  it('Assumption: Fasting should result in weight loss over 24h', async () => {
    const scenario = await ScenarioBuilder.with({ weight: 70 })
      .duration(1440)
      .run();

    const weight = scenario.signals.weight;
    const finalWeight = weight[weight.length - 1];

    // 24 hours of BMR (~1600 kcal) should lose ~0.2kg of fat
    expect(finalWeight).toBeLessThan(70);
  });

  it('Assumption: Meal duration should scale caloricIntake flux inversely', async () => {
    // 100g sugar over 30 mins (default)
    const shortMeal = await ScenarioBuilder.with({ weight: 70 })
      .duration(180)
      .add('food', { params: { carbSugar: 100 }, duration: 30, start: 10 })
      .run();

    // 100g sugar over 120 mins
    const longMeal = await ScenarioBuilder.with({ weight: 70 })
      .duration(180)
      .add('food', { params: { carbSugar: 100 }, duration: 120, start: 10 })
      .run();

    const shortPeak = Math.max(...shortMeal.signals.caloricIntake);
    const longPeak = Math.max(...longMeal.signals.caloricIntake);

    // Long meal peak should be significantly lower than short meal peak
    // 400kcal / 30m vs 400kcal / 120m
    // Note: Due to ODE curves, the peak doesn't scale perfectly linearly with duration
    expect(longPeak).toBeLessThan(shortPeak * 0.9);
  });

  it('Assumption: Eating should slow weight loss compared to fasting', async () => {
    // Over a short period, eating slows weight loss but doesn't cause immediate gain
    // This is physiologically realistic - fat storage is slow (tau = 30 days)

    const fasting = await ScenarioBuilder.with({ weight: 70 })
      .duration(300)
      .run();

    const eating = await ScenarioBuilder.with({ weight: 70 })
      .duration(300)
      .add('food', { params: { carbSugar: 200, fat: 50 }, duration: 30, start: 10 })
      .run();

    const fastingFinalWeight = fasting.signals.weight[fasting.signals.weight.length - 1];
    const eatingFinalWeight = eating.signals.weight[eating.signals.weight.length - 1];

    // Both should lose weight due to BMR (5 hours of ~1.15 kcal/min = ~345 kcal = ~0.05 kg)
    expect(fastingFinalWeight).toBeLessThan(70);
    expect(eatingFinalWeight).toBeLessThan(70);

    // But eating should result in less weight loss (higher final weight)
    expect(eatingFinalWeight).toBeGreaterThan(fastingFinalWeight);
  });

  it('Assumption: Exercise should raise burnRate during activity', async () => {
    const scenario = await ScenarioBuilder.with({ weight: 70 })
      .duration(120)
      .performing('exercise_cardio', 30, 0.7, 30) // 30 min cardio at 70% intensity starting at min 30
      .run();

    const burnRate = scenario.signals.burnRate;

    // Baseline burnRate should be around 1.15 kcal/min (BMR/1440)
    const baseline = burnRate[0];

    // Peak burnRate during exercise should be significantly higher
    const peakBurnRate = Math.max(...Array.from(burnRate));

    expect(peakBurnRate).toBeGreaterThan(baseline * 2); // Exercise should at least double burn rate
  });
});
