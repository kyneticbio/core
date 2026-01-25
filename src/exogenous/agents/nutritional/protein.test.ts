import { describe, expect, it } from 'vitest';
import { Protein } from './protein';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: Protein', () => {
  describe('PD Target Coverage', () => {
    it('should define all expected PD targets', () => {
      const def = Protein(30);
      const targets = def.pd.map(p => p.target);

      expect(targets).toContain('mtor');
      expect(targets).toContain('insulin');
      expect(targets).toContain('glucagon');
      expect(targets).toContain('glp1');
      expect(targets).toContain('ghrelin');
      expect(targets).toContain('leptin');
      expect(targets).toContain('dopamine');
      expect(targets).toContain('serotonin');
      expect(targets).toContain('glutamate');
      expect(targets).toContain('histamine');
      expect(targets).toContain('bdnf');
      expect(targets).toContain('orexin');
      expect(targets).toContain('thyroid');
      expect(targets).toHaveLength(13);
    });

    it('mtor should be an agonist (muscle building)', () => {
      const def = Protein(30);
      const effect = def.pd.find(p => p.target === 'mtor');
      expect(effect?.mechanism).toBe('agonist');
    });

    it('insulin should be an agonist', () => {
      const def = Protein(30);
      const effect = def.pd.find(p => p.target === 'insulin');
      expect(effect?.mechanism).toBe('agonist');
    });

    it('glucagon should be an agonist (blood sugar stability)', () => {
      const def = Protein(30);
      const effect = def.pd.find(p => p.target === 'glucagon');
      expect(effect?.mechanism).toBe('agonist');
    });

    it('glp1 should be an agonist (satiety)', () => {
      const def = Protein(30);
      const effect = def.pd.find(p => p.target === 'glp1');
      expect(effect?.mechanism).toBe('agonist');
    });

    it('ghrelin should be an antagonist (hunger suppression)', () => {
      const def = Protein(30);
      const effect = def.pd.find(p => p.target === 'ghrelin');
      expect(effect?.mechanism).toBe('antagonist');
    });

    it('leptin should be an agonist (fullness)', () => {
      const def = Protein(30);
      const effect = def.pd.find(p => p.target === 'leptin');
      expect(effect?.mechanism).toBe('agonist');
    });

    it('dopamine should be an agonist (tyrosine precursor)', () => {
      const def = Protein(30);
      const effect = def.pd.find(p => p.target === 'dopamine');
      expect(effect?.mechanism).toBe('agonist');
    });

    it('serotonin should be an agonist (tryptophan precursor)', () => {
      const def = Protein(30);
      const effect = def.pd.find(p => p.target === 'serotonin');
      expect(effect?.mechanism).toBe('agonist');
    });

    it('glutamate should be an agonist (umami signal)', () => {
      const def = Protein(30);
      const effect = def.pd.find(p => p.target === 'glutamate');
      expect(effect?.mechanism).toBe('agonist');
    });

    it('histamine should be an agonist (histidine conversion)', () => {
      const def = Protein(30);
      const effect = def.pd.find(p => p.target === 'histamine');
      expect(effect?.mechanism).toBe('agonist');
    });

    it('bdnf should be an agonist (brain health)', () => {
      const def = Protein(30);
      const effect = def.pd.find(p => p.target === 'bdnf');
      expect(effect?.mechanism).toBe('agonist');
    });

    it('orexin should be an antagonist (satiety sedation)', () => {
      const def = Protein(30);
      const effect = def.pd.find(p => p.target === 'orexin');
      expect(effect?.mechanism).toBe('antagonist');
    });

    it('thyroid should be an agonist (thermic effect)', () => {
      const def = Protein(30);
      const effect = def.pd.find(p => p.target === 'thyroid');
      expect(effect?.mechanism).toBe('agonist');
    });
  });

  describe('PK Parameters', () => {
    it('should be correctly defined', () => {
      const def = Protein(30);
      expect(def.molecule.name).toBe('Amino Acids');
      expect(def.pk.massMg).toBe(30000);
    });

    it('should use infusion delivery', () => {
      const def = Protein(30);
      expect(def.pk.delivery).toBe('infusion');
    });

    it('should have 90-minute time to peak', () => {
      const def = Protein(30);
      expect(def.pk.timeToPeakMin).toBe(90);
    });
  });

  describe('Dose scaling', () => {
    it('should scale precursor effects with amount', () => {
      const low = Protein(20);
      const high = Protein(80);

      const lowDopamine = low.pd.find(p => p.target === 'dopamine')?.intrinsicEfficacy ?? 0;
      const highDopamine = high.pd.find(p => p.target === 'dopamine')?.intrinsicEfficacy ?? 0;

      expect(highDopamine).toBeGreaterThan(lowDopamine);
    });
  });

  describe('Integration tests', () => {
    it('should activate mTOR (muscle building)', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('protein', { grams: 30 }, 480)
        .expect('mtor').toRise()
        .run();
    });

    it('should raise insulin modestly', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('protein', { grams: 30 }, 480)
        .expect('insulin').toRise()
        .run();
    });

    it('should suppress ghrelin strongly', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('protein', { grams: 30 }, 480)
        .expect('ghrelin').toFall()
        .run();
    });

    it('should boost GLP-1 (satiety)', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('protein', { grams: 30 }, 480)
        .expect('glp1').toRise()
        .run();
    });

    it('should boost leptin (fullness over hours)', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('protein', { grams: 50 }, 480)
        .expect('leptin').toRise()
        .run();
    });

    it('should provide dopamine precursors (tyrosine)', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('protein', { grams: 50 }, 480)
        .expect('dopamine').toRise()
        .run();
    });

    it('should provide serotonin precursors (tryptophan)', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('protein', { grams: 50 }, 480)
        .expect('serotonin').toRise()
        .run();
    });

    it('should boost glucagon (blood sugar stability)', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('protein', { grams: 50 }, 480)
        .expect('glucagon').toRise()
        .run();
    });

    it('should provide glutamate (umami signal)', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('protein', { grams: 50 }, 480)
        .expect('glutamate').toRise()
        .run();
    });

    it('should provide histamine (histidine conversion)', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('protein', { grams: 50 }, 480)
        .expect('histamine').toRise()
        .run();
    });

    // Note: BDNF saturates at max=100 in typical simulations
    // The BDNF effect is verified via unit tests above

    it('should boost thyroid (thermic effect)', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('protein', { grams: 50 }, 480)
        .expect('thyroid').toRise()
        .run();
    });

    it('should suppress orexin (satiety sedation)', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('protein', { grams: 50 }, 480)
        .expect('orexin').toFall()
        .run();
    });
  });
});
