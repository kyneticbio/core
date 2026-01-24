import { describe, it } from 'vitest';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: Exercise', () => {
  it('Cardio: should increase adrenaline and reduce glucose', async () => {
    await ScenarioBuilder.with()
      .duration(600)
      .performing('exercise_cardio', 30, 0.8, 480)
      .expect('adrenaline').toRise()
      .expect('glucose').toFall()
      .run();
  });
});
