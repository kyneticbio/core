import { describe, it } from 'vitest';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: Alcohol', () => {
  it('should increase dopamine and building BAC', async () => {
    await ScenarioBuilder.with()
      .taking('alcohol', { units: 2 }, 480)
      .duration(720)
      .expect('dopamine').toRise()
      .expect('ethanol').toRise()
      .run();
  });
});
