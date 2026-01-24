import { describe, it } from 'vitest';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: ADHD Medications', () => {
  describe('Methylphenidate', () => {
    it('should inhibit DAT and increase dopamine', async () => {
      await ScenarioBuilder.with()
        .duration(960)
        .taking('ritalinIR10', { mg: 10 }, 480)
        .expect('dopamine').toRise()
        .run();
    });
  });

  describe('Amphetamine', () => {
    it('should increase dopamine both via DAT inhibition and direct agonism', async () => {
      await ScenarioBuilder.with()
        .duration(1440)
        .taking('adderallIR', { mg: 20 }, 480)
        .expect('dopamine').toRise()
        .run();
    });
  });
});
