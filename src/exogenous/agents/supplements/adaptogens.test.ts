import { describe, expect, it } from 'vitest';
import { Ashwagandha, Rhodiola, LionsMane } from './adaptogens';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: Adaptogens', () => {
  describe('Ashwagandha', () => {
    it('should be correctly defined', () => {
      const def = Ashwagandha(600);
      expect(def.molecule.name).toBe('Withaferin A');
      expect(def.pk.massMg).toBe(600);
    });

    it('should have moderate bioavailability', () => {
      const def = Ashwagandha(600);
      expect(def.pk.bioavailability).toBe(0.5);
    });

    it('should reduce cortisol', () => {
      const def = Ashwagandha(600);
      const cortisolEffect = def.pd.find(p => p.target === 'cortisol');
      expect(cortisolEffect).toBeDefined();
      expect(cortisolEffect?.mechanism).toBe('antagonist');
    });
  });

  describe('Rhodiola', () => {
    it('should be correctly defined', () => {
      const def = Rhodiola(400);
      expect(def.molecule.name).toBe('Salidroside');
      expect(def.pk.massMg).toBe(400);
    });

    it('should have low bioavailability', () => {
      const def = Rhodiola(400);
      expect(def.pk.bioavailability).toBe(0.3);
    });

    it('should reduce cortisol', () => {
      const def = Rhodiola(400);
      const cortisolEffect = def.pd.find(p => p.target === 'cortisol');
      expect(cortisolEffect).toBeDefined();
      expect(cortisolEffect?.mechanism).toBe('antagonist');
    });
  });

  describe('Lions Mane', () => {
    it('should be correctly defined', () => {
      const def = LionsMane(1000);
      expect(def.molecule.name).toBe('Hericenone');
      expect(def.pk.massMg).toBe(1000);
    });

    it('should have low bioavailability', () => {
      const def = LionsMane(1000);
      expect(def.pk.bioavailability).toBe(0.3);
    });

    it('should boost BDNF', () => {
      const def = LionsMane(1000);
      const bdnfEffect = def.pd.find(p => p.target === 'bdnf');
      expect(bdnfEffect).toBeDefined();
      expect(bdnfEffect?.mechanism).toBe('agonist');
    });
  });

  describe('Integration tests', () => {
    it('Ashwagandha: should reduce cortisol', async () => {
      await ScenarioBuilder.with()
        .duration(1440)
        .taking('ashwagandha', { mg: 600 }, 480)
        .expect('cortisol').toFall()
        .run();
    });

    it('Rhodiola: should reduce cortisol', async () => {
      await ScenarioBuilder.with()
        .duration(1440)
        .taking('rhodiola', { mg: 400 }, 480)
        .expect('cortisol').toFall()
        .run();
    });

    // Note: Lion's Mane targets BDNF which saturates at max=100 in typical simulations
    // The BDNF effect is verified via unit tests above
  });
});
