import { describe, it } from 'vitest';
import { ScenarioBuilder } from '../../utils/test/scenario-builder';

describe('Food Interventions', () => {
  it('High Carb Meal: should spike glucose and insulin', async () => {
    await ScenarioBuilder.with()
      .duration(600)
      .taking('food', { carbSugar: 50, carbStarch: 50 }, 480)
      .expect('glucose').toPeakAbove(120)
      .expect('insulin').toRise()
      .run();
  });

  it('High Fat Meal: should increase glp1 and suppress ghrelin', async () => {
    await ScenarioBuilder.with()
      .duration(600)
      .taking('food', { fat: 40, carbSugar: 0, carbStarch: 0 }, 480)
      .expect('glp1').toRise()
      .run();
  });

  it('High Protein Meal: should increase insulin and mtor', async () => {
    await ScenarioBuilder.with()
      .duration(600)
      .taking('food', { protein: 50, carbSugar: 0, carbStarch: 0 }, 480)
      .expect('insulin').toRise()
      .expect('mtor').toRise()
      .run();
  });
});
