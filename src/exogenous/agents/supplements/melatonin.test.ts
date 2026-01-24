import { describe, it } from 'vitest';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: Melatonin', () => {
  it('should increase melatonin and suppress orexin', async () => {
    await ScenarioBuilder.with()
      .taking('melatonin', { mg: 3 }, 1320) // 10 PM
      .duration(1440)
      .expect('melatonin').toRise()
      .expect('orexin').toFall()
      .run();
  });
});
