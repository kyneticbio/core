import { describe, expect, it } from 'vitest';
import { Lipids } from './lipids';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: Lipids (Fat)', () => {
  describe('PD Target Coverage', () => {
    it('should define all expected PD targets', () => {
      const def = Lipids(30);
      const targets = def.pd.map(p => p.target);

      expect(targets).toContain('ghrelin');
      expect(targets).toContain('leptin');
      expect(targets).toContain('glp1');
      expect(targets).toContain('vagal');
      expect(targets).toContain('acetylcholine');
      expect(targets).toContain('dopamine');
      expect(targets).toContain('oxytocin');
      expect(targets).toContain('endocannabinoid');
      expect(targets).toContain('orexin');
      expect(targets).toContain('norepi');
      expect(targets).toContain('cortisol');
      expect(targets).toContain('inflammation');
      expect(targets).toContain('thyroid');
      expect(targets).toContain('caloricIntake');
      expect(targets).toHaveLength(14);
    });

    it('ghrelin should be an antagonist (hunger suppression)', () => {
      const def = Lipids(30);
      const effect = def.pd.find(p => p.target === 'ghrelin');
      expect(effect?.mechanism).toBe('antagonist');
    });

    it('leptin should be an agonist (fullness)', () => {
      const def = Lipids(30);
      const effect = def.pd.find(p => p.target === 'leptin');
      expect(effect?.mechanism).toBe('agonist');
    });

    it('glp1 should be a linear agonist (gut fullness)', () => {
      const def = Lipids(30);
      const effect = def.pd.find(p => p.target === 'glp1');
      expect(effect?.mechanism).toBe('linear');
    });

    it('vagal should be an agonist (rest-and-digest)', () => {
      const def = Lipids(30);
      const effect = def.pd.find(p => p.target === 'vagal');
      expect(effect?.mechanism).toBe('agonist');
    });

    it('acetylcholine should be an agonist (parasympathetic)', () => {
      const def = Lipids(30);
      const effect = def.pd.find(p => p.target === 'acetylcholine');
      expect(effect?.mechanism).toBe('agonist');
    });

    it('dopamine should be an agonist (reward)', () => {
      const def = Lipids(30);
      const effect = def.pd.find(p => p.target === 'dopamine');
      expect(effect?.mechanism).toBe('agonist');
    });

    it('oxytocin should be an agonist (comfort food)', () => {
      const def = Lipids(30);
      const effect = def.pd.find(p => p.target === 'oxytocin');
      expect(effect?.mechanism).toBe('agonist');
    });

    it('endocannabinoid should be an agonist (bliss molecules)', () => {
      const def = Lipids(30);
      const effect = def.pd.find(p => p.target === 'endocannabinoid');
      expect(effect?.mechanism).toBe('agonist');
    });

    it('orexin should be an antagonist (sedation)', () => {
      const def = Lipids(30);
      const effect = def.pd.find(p => p.target === 'orexin');
      expect(effect?.mechanism).toBe('antagonist');
    });

    it('norepi should be an antagonist (reduced alertness)', () => {
      const def = Lipids(30);
      const effect = def.pd.find(p => p.target === 'norepi');
      expect(effect?.mechanism).toBe('antagonist');
    });

    it('cortisol should be an antagonist (comfort eating reduces stress)', () => {
      const def = Lipids(30);
      const effect = def.pd.find(p => p.target === 'cortisol');
      expect(effect?.mechanism).toBe('antagonist');
    });

    it('inflammation should be a linear agonist (post-prandial inflammation)', () => {
      const def = Lipids(30);
      const effect = def.pd.find(p => p.target === 'inflammation');
      expect(effect?.mechanism).toBe('linear');
    });

    it('thyroid should be an agonist (metabolic cost)', () => {
      const def = Lipids(30);
      const effect = def.pd.find(p => p.target === 'thyroid');
      expect(effect?.mechanism).toBe('agonist');
    });
  });

  describe('PK Parameters', () => {
    it('should be correctly defined', () => {
      const def = Lipids(30);
      expect(def.molecule.name).toBe('Lipids');
      expect(def.pk.massMg).toBe(30000);
    });

    it('should use infusion delivery (slow digestion)', () => {
      const def = Lipids(30);
      expect(def.pk.delivery).toBe('infusion');
    });

    it('should have long time to peak', () => {
      const def = Lipids(30);
      expect(def.pk.timeToPeakMin).toBe(180);
    });
  });

  describe('Dose scaling', () => {
    it('should scale mass with grams', () => {
      const small = Lipids(10);
      const large = Lipids(50);
      expect(large.pk.massMg).toBeGreaterThan(small.pk.massMg);
    });

    it('should scale leptin with caloric load', () => {
      const small = Lipids(10);
      const large = Lipids(50);

      const smallLeptin = small.pd.find(p => p.target === 'leptin')?.intrinsicEfficacy ?? 0;
      const largeLeptin = large.pd.find(p => p.target === 'leptin')?.intrinsicEfficacy ?? 0;

      expect(largeLeptin).toBeGreaterThan(smallLeptin);
    });
  });

  describe('Integration tests', () => {
    it('should powerfully suppress ghrelin', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('lipids', { grams: 30 }, 480)
        .expect('ghrelin').toFall()
        .run();
    });

    it('should boost leptin (fullness)', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('lipids', { grams: 30 }, 480)
        .expect('leptin').toRise()
        .run();
    });

    it('should boost GLP-1 (gut satiety)', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('lipids', { grams: 30 }, 480)
        .expect('glp1').toRise()
        .run();
    });

    it('should trigger dopamine reward', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('lipids', { grams: 30 }, 480)
        .expect('dopamine').toRise()
        .run();
    });

    it('should boost endocannabinoids', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('lipids', { grams: 30 }, 480)
        .expect('endocannabinoid').toRise()
        .run();
    });

    it('should boost oxytocin (comfort food effect)', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('lipids', { grams: 30 }, 480)
        .expect('oxytocin').toRise()
        .run();
    });

    it('should cause post-prandial sedation', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('lipids', { grams: 50 }, 480)
        .expect('orexin').toFall()
        .expect('norepi').toFall()
        .run();
    });

    it('should increase parasympathetic activity', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('lipids', { grams: 30 }, 480)
        .expect('vagal').toRise()
        .expect('acetylcholine').toRise()
        .run();
    });

    it('should reduce cortisol (comfort eating)', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('lipids', { grams: 50 }, 480)
        .expect('cortisol').toFall()
        .run();
    });

    it('should cause post-prandial inflammation', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('lipids', { grams: 50 }, 480)
        .expect('inflammation').toRise()
        .run();
    });

    it('should boost thyroid (metabolic cost of digestion)', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('lipids', { grams: 50 }, 480)
        .expect('thyroid').toRise()
        .run();
    });
  });
});
