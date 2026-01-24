import { describe, it } from 'vitest';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: Caffeine', () => {
  it('should build caffeine concentration and disinhibit dopamine', async () => {
    // 7 AM Caffeine (100mg)
    await ScenarioBuilder.with()
      .duration(720) // Run until 7 PM
      .taking('caffeine', { mg: 100 }, 420)
      .expect('dopamine').toRise()
      .run();
  });

  it('should suppress melatonin at night', async () => {
    // 6 PM Caffeine (200mg)
    await ScenarioBuilder.with()
      .duration(1440)
      .taking('caffeine', { mg: 200 }, 1080)
      .expect('dopamine').toRise()
      .run();
  });
});
