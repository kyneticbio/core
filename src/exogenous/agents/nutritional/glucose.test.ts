import { describe, expect, it } from 'vitest';
import { Glucose } from './glucose';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: Glucose', () => {
  describe('PD Target Coverage', () => {
    it('should define all expected PD targets', () => {
      const def = Glucose(50);
      const targets = def.pd.map(p => p.target);

      expect(targets).toContain('glucose');
      expect(targets).toContain('insulin');
      expect(targets).toContain('dopamine');
      expect(targets).toContain('serotonin');
      expect(targets).toContain('gaba');
      expect(targets).toContain('leptin');
      expect(targets).toContain('orexin');
      expect(targets).toContain('norepi');
      expect(targets).toContain('cortisol');
      expect(targets).toContain('caloricIntake');
      expect(targets).toHaveLength(10);
    });

    it('glucose should be an agonist', () => {
      const def = Glucose(50);
      const effect = def.pd.find(p => p.target === 'glucose');
      expect(effect?.mechanism).toBe('agonist');
    });

    it('insulin should be a linear agonist', () => {
      const def = Glucose(50);
      const effect = def.pd.find(p => p.target === 'insulin');
      expect(effect?.mechanism).toBe('linear');
    });

    it('dopamine should be an agonist (reward response)', () => {
      const def = Glucose(50);
      const effect = def.pd.find(p => p.target === 'dopamine');
      expect(effect?.mechanism).toBe('agonist');
    });

    it('serotonin should be an agonist (carb-serotonin pathway)', () => {
      const def = Glucose(50);
      const effect = def.pd.find(p => p.target === 'serotonin');
      expect(effect?.mechanism).toBe('agonist');
    });

    it('gaba should be an agonist (satiety signaling)', () => {
      const def = Glucose(50);
      const effect = def.pd.find(p => p.target === 'gaba');
      expect(effect?.mechanism).toBe('agonist');
    });

    it('leptin should be an agonist (fullness signaling)', () => {
      const def = Glucose(50);
      const effect = def.pd.find(p => p.target === 'leptin');
      expect(effect?.mechanism).toBe('agonist');
    });

    it('orexin should be an antagonist (post-prandial sedation)', () => {
      const def = Glucose(50);
      const effect = def.pd.find(p => p.target === 'orexin');
      expect(effect?.mechanism).toBe('antagonist');
    });

    it('norepi should be an antagonist (reduced alertness)', () => {
      const def = Glucose(50);
      const effect = def.pd.find(p => p.target === 'norepi');
      expect(effect?.mechanism).toBe('antagonist');
    });

    it('cortisol should be an antagonist (stress reduction)', () => {
      const def = Glucose(50);
      const effect = def.pd.find(p => p.target === 'cortisol');
      expect(effect?.mechanism).toBe('antagonist');
    });
  });

  describe('PK Parameters', () => {
    it('should be correctly defined', () => {
      const def = Glucose(50);
      expect(def.molecule.name).toBe('Glucose');
      expect(def.pk.massMg).toBe(50000);
    });

    it('should have 100% bioavailability', () => {
      const def = Glucose(50);
      expect(def.pk.bioavailability).toBe(1.0);
    });
  });

  describe('Glycemic index effects', () => {
    it('should have faster absorption with high GI', () => {
      const lowGI = Glucose(50, { glycemicIndex: 30 });
      const highGI = Glucose(50, { glycemicIndex: 90 });

      expect(highGI.pk.halfLifeMin!).toBeLessThan(lowGI.pk.halfLifeMin!);
    });

    it('should have higher insulin spike with high GI', () => {
      const lowGI = Glucose(50, { glycemicIndex: 30 });
      const highGI = Glucose(50, { glycemicIndex: 90 });

      const lowInsulin = lowGI.pd.find(p => p.target === 'insulin')?.intrinsicEfficacy ?? 0;
      const highInsulin = highGI.pd.find(p => p.target === 'insulin')?.intrinsicEfficacy ?? 0;

      expect(highInsulin).toBeGreaterThan(lowInsulin);
    });

    it('should have higher glucose spike with high GI', () => {
      const lowGI = Glucose(50, { glycemicIndex: 30 });
      const highGI = Glucose(50, { glycemicIndex: 90 });

      const lowGlucose = lowGI.pd.find(p => p.target === 'glucose')?.intrinsicEfficacy ?? 0;
      const highGlucose = highGI.pd.find(p => p.target === 'glucose')?.intrinsicEfficacy ?? 0;

      expect(highGlucose).toBeGreaterThan(lowGlucose);
    });
  });

  describe('Fiber and fat context', () => {
    it('should slow absorption with fiber', () => {
      const plain = Glucose(50);
      const withFiber = Glucose(50, { fiberGrams: 10 });

      expect(withFiber.pk.halfLifeMin!).toBeGreaterThan(plain.pk.halfLifeMin!);
    });

    it('should slow absorption with fat', () => {
      const plain = Glucose(50);
      const withFat = Glucose(50, { fatGrams: 20 });

      expect(withFat.pk.halfLifeMin!).toBeGreaterThan(plain.pk.halfLifeMin!);
    });
  });

  describe('Sugar and palatability', () => {
    it('should scale dopamine with sugar content', () => {
      const lowSugar = Glucose(50, { sugarGrams: 5 });
      const highSugar = Glucose(50, { sugarGrams: 40 });

      const lowDopamine = lowSugar.pd.find(p => p.target === 'dopamine')?.intrinsicEfficacy ?? 0;
      const highDopamine = highSugar.pd.find(p => p.target === 'dopamine')?.intrinsicEfficacy ?? 0;

      expect(highDopamine).toBeGreaterThan(lowDopamine);
    });
  });

  describe('Post-prandial sedation', () => {
    it('should suppress orexin more with higher GI', () => {
      const lowGI = Glucose(50, { glycemicIndex: 30 });
      const highGI = Glucose(50, { glycemicIndex: 90 });

      const lowOrexin = lowGI.pd.find(p => p.target === 'orexin')?.intrinsicEfficacy ?? 0;
      const highOrexin = highGI.pd.find(p => p.target === 'orexin')?.intrinsicEfficacy ?? 0;

      expect(highOrexin).toBeGreaterThan(lowOrexin); // Higher suppression
    });
  });

  describe('Integration tests', () => {
    it('should raise blood glucose and insulin', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('glucose', { grams: 50 }, 480)
        .expect('glucose').toRise()
        .expect('insulin').toRise()
        .run();
    });

    it('should trigger dopamine reward response', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('glucose', { grams: 50, sugarGrams: 30 }, 480)
        .expect('dopamine').toRise()
        .run();
    });

    it('should cause post-prandial sedation (suppress orexin)', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('glucose', { grams: 100, glycemicIndex: 80 }, 480)
        .expect('orexin').toFall()
        .run();
    });

    it('should boost leptin (fullness signaling)', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('glucose', { grams: 100 }, 480)
        .expect('leptin').toRise()
        .run();
    });

    it('should suppress norepi (reduced alertness)', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('glucose', { grams: 100, glycemicIndex: 80 }, 480)
        .expect('norepi').toFall()
        .run();
    });

    it('should boost serotonin (carb-serotonin pathway)', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('glucose', { grams: 100 }, 480)
        .expect('serotonin').toRise()
        .run();
    });

    it('should boost GABA (satiety signaling)', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('glucose', { grams: 100 }, 480)
        .expect('gaba').toRise()
        .run();
    });

    it('should reduce cortisol (stress reduction)', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('glucose', { grams: 100 }, 480)
        .expect('cortisol').toFall()
        .run();
    });
  });
});
