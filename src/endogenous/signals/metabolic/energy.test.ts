import { describe, it } from 'vitest';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Metabolic Energy & Body Composition Dynamics', () => {
  it('Exercise should increase burnRate and decrease strengthReadiness', async () => {
    await ScenarioBuilder.with({ weight: 70 })
      .duration(180)
      .performing('exercise_resistance', 60, 0.8, 60)
      .expect('burnRate').toRise()
      .expect('strengthReadiness').toFall()
      .run();
  });

  it('Food should increase caloricIntake and netEnergy', async () => {
    await ScenarioBuilder.with({ weight: 70 })
      .duration(180)
      .taking('food', { carbSugar: 50, protein: 30, fat: 20 }, 60)
      .expect('caloricIntake').toRise()
      .expect('netEnergy').toRise()
      .run();
  });

  it('Consistent caloric surplus should increase fatMass and weight', async () => {
    // Simulate a massive meal to see drift
    await ScenarioBuilder.with({ weight: 70 })
      .duration(300)
      .taking('food', { carbSugar: 200, fat: 100, protein: 100 }, 10)
      .expectAuxiliary('fatMass').toRise()
      .expect('weight').toRise()
      .run();
  });

  it('mTOR activation from protein should drive muscleProteinSynthesis', async () => {
    await ScenarioBuilder.with({ weight: 70 })
      .duration(240)
      .taking('food', { protein: 100 }, 30)
      .expect('mtor').toPeakAbove(1.0)
      .expectAuxiliary('muscleProteinSynthesis').toRise()
      .run();
  });
});