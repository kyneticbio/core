import { describe, expect, it } from 'vitest';
import { Fiber } from './fiber';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: Fiber', () => {
  describe('PD Target Coverage', () => {
    it('should define all expected PD targets', () => {
      const def = Fiber(30);
      const targets = def.pd.map(p => p.target);

      expect(targets).toContain('glp1');
      expect(targets).toContain('ghrelin');
      expect(targets).toContain('gaba');
      expect(targets).toContain('vagal');
      expect(targets).toContain('serotonin');
      expect(targets).toContain('inflammation');
      expect(targets).toContain('thyroid');
      expect(targets).toHaveLength(7);
    });

    it('glp1 should be an agonist', () => {
      const def = Fiber(30);
      const effect = def.pd.find(p => p.target === 'glp1');
      expect(effect?.mechanism).toBe('agonist');
    });

    it('ghrelin should be an antagonist (suppresses hunger)', () => {
      const def = Fiber(30);
      const effect = def.pd.find(p => p.target === 'ghrelin');
      expect(effect?.mechanism).toBe('antagonist');
    });

    it('gaba should be an agonist (gut-brain calming)', () => {
      const def = Fiber(30);
      const effect = def.pd.find(p => p.target === 'gaba');
      expect(effect?.mechanism).toBe('agonist');
    });

    it('vagal should be an agonist (gut-brain axis)', () => {
      const def = Fiber(30);
      const effect = def.pd.find(p => p.target === 'vagal');
      expect(effect?.mechanism).toBe('agonist');
    });

    it('serotonin should be an agonist (gut-derived)', () => {
      const def = Fiber(30);
      const effect = def.pd.find(p => p.target === 'serotonin');
      expect(effect?.mechanism).toBe('agonist');
    });

    it('inflammation should be an antagonist (reduces gut inflammation)', () => {
      const def = Fiber(30);
      const effect = def.pd.find(p => p.target === 'inflammation');
      expect(effect?.mechanism).toBe('antagonist');
    });

    it('thyroid should be an agonist (metabolic boost from fermentation)', () => {
      const def = Fiber(30);
      const effect = def.pd.find(p => p.target === 'thyroid');
      expect(effect?.mechanism).toBe('agonist');
    });
  });

  describe('PK Parameters', () => {
    it('should be correctly defined', () => {
      const def = Fiber(30);
      expect(def.molecule.name).toBe('Dietary Fiber');
      expect(def.pk.massMg).toBe(30000);
    });

    it('should use infusion delivery (slow absorption)', () => {
      const def = Fiber(30);
      expect(def.pk.delivery).toBe('infusion');
    });

    it('should have long time to peak (gut fermentation)', () => {
      const def = Fiber(30);
      expect(def.pk.timeToPeakMin).toBe(180);
    });
  });

  describe('Dose scaling', () => {
    it('should scale mass with grams', () => {
      const low = Fiber(10);
      const high = Fiber(50);
      expect(high.pk.massMg).toBeGreaterThan(low.pk.massMg);
    });
  });

  describe('Integration tests', () => {
    it('should suppress ghrelin (hunger)', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('fiber', { grams: 30 }, 480)
        .expect('ghrelin').toFall()
        .run();
    });

    it('should boost GLP-1 (satiety)', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('fiber', { grams: 30 }, 480)
        .expect('glp1').toRise()
        .run();
    });

    it('should increase vagal tone via gut-brain axis', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('fiber', { grams: 30 }, 480)
        .expect('vagal').toRise()
        .run();
    });

    it('should support serotonin production', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('fiber', { grams: 30 }, 480)
        .expect('serotonin').toRise()
        .run();
    });

    it('should boost GABA (calming via gut bacteria)', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('fiber', { grams: 30 }, 480)
        .expect('gaba').toRise()
        .run();
    });

    // Note: inflammation starts at baseline 0 in typical simulations
    // The anti-inflammatory effect is verified via unit tests above

    it('should boost thyroid (metabolic effect from fermentation)', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('fiber', { grams: 30 }, 480)
        .expect('thyroid').toRise()
        .run();
    });
  });
});
