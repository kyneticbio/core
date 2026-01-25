import { describe, it, expect } from 'vitest';
import { Methylphenidate, Amphetamine, Lisdexamfetamine, MethylphenidateXR, Guanfacine } from './adhd_meds';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: ADHD Medications', () => {
  describe('PD Target Coverage', () => {
    it('Methylphenidate should target DAT, NET, and cortisol', () => {
      const def = Methylphenidate(10);
      const targets = def.pd.map(p => p.target);

      expect(targets).toContain('DAT');
      expect(targets).toContain('NET');
      expect(targets).toContain('cortisol');
      expect(targets).toHaveLength(3);
    });

    it('Amphetamine should target DAT, NET, and dopamine', () => {
      const def = Amphetamine(20);
      const targets = def.pd.map(p => p.target);

      expect(targets).toContain('DAT');
      expect(targets).toContain('NET');
      expect(targets).toContain('dopamine');
      expect(targets).toHaveLength(3);
    });

    it('Guanfacine should target norepi', () => {
      const def = Guanfacine(1);
      const targets = def.pd.map(p => p.target);

      expect(targets).toContain('norepi');
      expect(targets).toHaveLength(1);
    });
  });

  describe('Methylphenidate Integration tests', () => {
    // Note: DAT and NET are receptor/transporter targets that don't exist as simulation signals
    // These effects are verified via unit tests above

    it('should increase cortisol', async () => {
      await ScenarioBuilder.with()
        .duration(960)
        .taking('ritalinIR10', { mg: 10 }, 480)
        .expect('cortisol').toRise()
        .run();
    });
  });

  describe('Amphetamine Integration tests', () => {
    // Note: DAT and NET are receptor/transporter targets that don't exist as simulation signals
    // These effects are verified via unit tests above

    it('should increase dopamine (direct agonism)', async () => {
      await ScenarioBuilder.with()
        .duration(1440)
        .taking('adderallIR', { mg: 20 }, 480)
        .expect('dopamine').toRise()
        .run();
    });
  });

  describe('Guanfacine Integration tests', () => {
    it('should reduce norepinephrine', async () => {
      await ScenarioBuilder.with()
        .duration(1440)
        .taking('guanfacine', { mg: 1 }, 480)
        .expect('norepi').toFall()
        .run();
    });
  });
});
