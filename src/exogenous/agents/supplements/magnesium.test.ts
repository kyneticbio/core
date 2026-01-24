import { describe, it } from 'vitest';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: Magnesium', () => {
  it('should reduce cortisol and increase melatonin slightly', async () => {
    await ScenarioBuilder.with()
      .taking('magnesium', { mg: 400 }, 1260) // 9 PM
      .duration(1440)
      .expect('cortisol').toFall()
      .expect('melatonin').toRise()
      .run();
  });
});
