import { describe, it, expect } from 'vitest';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Infusion Scaling Logic', () => {
  it('Assumption: Insulin peak should scale down when meal duration is stretched', async () => {
    // 100g sugar over 30 mins
    const shortMeal = await ScenarioBuilder.with({ weight: 70 })
      .duration(180)
      .add('food', { params: { carbSugar: 100 }, duration: 30, start: 10 })
      .run();

    // 100g sugar over 600 mins (10 hours)
    const longMeal = await ScenarioBuilder.with({ weight: 70 })
      .duration(700)
      .add('food', { params: { carbSugar: 100 }, duration: 600, start: 10 })
      .run();

    const shortInsulinPeak = Math.max(...shortMeal.signals.insulin);
    const longInsulinPeak = Math.max(...longMeal.signals.insulin);

    console.log(`Insulin Peak: Short=${shortInsulinPeak.toFixed(2)}, Long=${longInsulinPeak.toFixed(2)}`);

    // Long meal peak should be significantly lower than short meal peak
    expect(longInsulinPeak).toBeLessThan(shortInsulinPeak * 0.7);
  });

  it('Assumption: mTOR peak should scale down when protein infusion is stretched', async () => {
    // 100g protein over 30 mins
    const shortProtein = await ScenarioBuilder.with({ weight: 70 })
      .duration(180)
      .add('food', { params: { protein: 100 }, duration: 30, start: 10 })
      .run();

    // 100g protein over 600 mins
    const longProtein = await ScenarioBuilder.with({ weight: 70 })
      .duration(700)
      .add('food', { params: { protein: 100 }, duration: 600, start: 10 })
      .run();

    const shortMTORPeak = Math.max(...shortProtein.signals.mtor);
    const longMTORPeak = Math.max(...longProtein.signals.mtor);

    console.log(`mTOR Peak: Short=${shortMTORPeak.toFixed(2)}, Long=${longMTORPeak.toFixed(2)}`);

    expect(longMTORPeak).toBeLessThan(shortMTORPeak * 0.7);
  });

  it('Assumption: Inflammation peak should scale down when fat infusion is stretched', async () => {
    // 100g fat over 30 mins
    const shortFat = await ScenarioBuilder.with({ weight: 70 })
      .duration(180)
      .add('food', { params: { fat: 100 }, duration: 30, start: 10 })
      .run();

    // 100g fat over 600 mins
    const longFat = await ScenarioBuilder.with({ weight: 70 })
      .duration(700)
      .add('food', { params: { fat: 100 }, duration: 600, start: 10 })
      .run();

    const shortInflammationPeak = Math.max(...shortFat.signals.inflammation);
    const longInflammationPeak = Math.max(...longFat.signals.inflammation);

    console.log(`Inflammation Peak: Short=${shortInflammationPeak.toFixed(2)}, Long=${longInflammationPeak.toFixed(2)}`);

    expect(longInflammationPeak).toBeLessThan(shortInflammationPeak * 0.7);
  });
});
