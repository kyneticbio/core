import { describe, expect, it } from 'vitest';
import { ColdExposure, HeatExposure } from './exposure';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: Thermal Exposure', () => {
  describe('Cold Exposure', () => {
    describe('PD Target Coverage', () => {
      it('should define all expected PD targets', () => {
        const def = ColdExposure(5, 1.0);
        const targets = def.pd.map(p => p.target);

        expect(targets).toContain('norepi');
        expect(targets).toContain('adrenaline');
        expect(targets).toContain('dopamine');
        expect(targets).toContain('cortisol');
        expect(targets).toContain('bdnf');
        expect(targets).toContain('thyroid');
        expect(targets).toContain('vagal');
        expect(targets).toContain('inflammation');
        expect(targets).toContain('orexin');
        expect(targets).toContain('thermogenesis');
        expect(targets).toContain('heatShockProteins');
        expect(targets).toHaveLength(11);
      });

      it('norepi should be an agonist (cold shock)', () => {
        const def = ColdExposure(5, 1.0);
        const effect = def.pd.find(p => p.target === 'norepi');
        expect(effect?.mechanism).toBe('agonist');
      });

      it('adrenaline should be an agonist (fight-or-flight)', () => {
        const def = ColdExposure(5, 1.0);
        const effect = def.pd.find(p => p.target === 'adrenaline');
        expect(effect?.mechanism).toBe('agonist');
      });

      it('dopamine should be an agonist (reward)', () => {
        const def = ColdExposure(5, 1.0);
        const effect = def.pd.find(p => p.target === 'dopamine');
        expect(effect?.mechanism).toBe('agonist');
      });

      it('cortisol should be an agonist (stress response)', () => {
        const def = ColdExposure(5, 1.0);
        const effect = def.pd.find(p => p.target === 'cortisol');
        expect(effect?.mechanism).toBe('agonist');
      });

      it('bdnf should be an agonist (neuroplasticity)', () => {
        const def = ColdExposure(5, 1.0);
        const effect = def.pd.find(p => p.target === 'bdnf');
        expect(effect?.mechanism).toBe('agonist');
      });

      it('thyroid should be an agonist (thermogenesis)', () => {
        const def = ColdExposure(5, 1.0);
        const effect = def.pd.find(p => p.target === 'thyroid');
        expect(effect?.mechanism).toBe('agonist');
      });

      it('vagal should be an agonist (post-exposure recovery)', () => {
        const def = ColdExposure(5, 1.0);
        const effect = def.pd.find(p => p.target === 'vagal');
        expect(effect?.mechanism).toBe('agonist');
      });

      it('inflammation should be an antagonist (anti-inflammatory)', () => {
        const def = ColdExposure(5, 1.0);
        const effect = def.pd.find(p => p.target === 'inflammation');
        expect(effect?.mechanism).toBe('antagonist');
      });

      it('orexin should be an agonist (wakefulness)', () => {
        const def = ColdExposure(5, 1.0);
        const effect = def.pd.find(p => p.target === 'orexin');
        expect(effect?.mechanism).toBe('agonist');
      });
    });

    describe('PK Parameters', () => {
      it('should be correctly defined', () => {
        const def = ColdExposure(5, 1.0);
        expect(def.molecule.name).toBe('Cold Exposure');
      });

      it('should use activity-dependent model', () => {
        const def = ColdExposure(5, 1.0);
        expect(def.pk.model).toBe('activity-dependent');
      });
    });

    describe('Temperature and Intensity Scaling', () => {
      it('should scale with temperature (colder = stronger)', () => {
        const warm = ColdExposure(14, 1.0);
        const cold = ColdExposure(2, 1.0);

        const warmNorepi = warm.pd.find(p => p.target === 'norepi')?.intrinsicEfficacy ?? 0;
        const coldNorepi = cold.pd.find(p => p.target === 'norepi')?.intrinsicEfficacy ?? 0;

        expect(coldNorepi).toBeGreaterThan(warmNorepi);
      });

      it('should scale with intensity', () => {
        const mild = ColdExposure(5, 0.5);
        const intense = ColdExposure(5, 1.0);

        const mildNorepi = mild.pd.find(p => p.target === 'norepi')?.intrinsicEfficacy ?? 0;
        const intenseNorepi = intense.pd.find(p => p.target === 'norepi')?.intrinsicEfficacy ?? 0;

        expect(intenseNorepi).toBeGreaterThan(mildNorepi);
      });
    });

    describe('Integration tests', () => {
      it('should spike norepi and adrenaline', async () => {
        await ScenarioBuilder.with()
          .duration(600)
          .taking('coldExposure', { temperature: 5, intensity: 1.0 }, 480)
          .expect('norepi').toPeakAbove(200)
          .expect('adrenaline').toRise()
          .run();
      });

      it('should boost dopamine (cold immersion reward)', async () => {
        await ScenarioBuilder.with()
          .duration(600)
          .taking('coldExposure', { temperature: 5, intensity: 1.0 }, 480)
          .expect('dopamine').toRise()
          .run();
      });

      it('should boost cortisol (stress response)', async () => {
        await ScenarioBuilder.with()
          .duration(600)
          .taking('coldExposure', { temperature: 5, intensity: 1.0 }, 480)
          .expect('cortisol').toRise()
          .run();
      });

      it('should boost orexin (wakefulness)', async () => {
        await ScenarioBuilder.with()
          .duration(600)
          .taking('coldExposure', { temperature: 5, intensity: 1.0 }, 480)
          .expect('orexin').toRise()
          .run();
      });
    });
  });

  describe('Heat Exposure (Sauna)', () => {
    describe('PD Target Coverage', () => {
      it('should define all expected PD targets', () => {
        const def = HeatExposure(85, 'dry', 1.0);
        const targets = def.pd.map(p => p.target);

        expect(targets).toContain('growthHormone');
        expect(targets).toContain('prolactin');
        expect(targets).toContain('bdnf');
        expect(targets).toContain('serotonin');
        expect(targets).toContain('vagal');
        expect(targets).toContain('cortisol');
        expect(targets).toContain('inflammation');
        expect(targets).toContain('vasopressin');
        expect(targets).toContain('orexin');
        expect(targets).toContain('endocannabinoid');
        expect(targets).toContain('heatShockProteins');
        expect(targets).toContain('burnRate');
        expect(targets).toHaveLength(12);
      });

      it('growthHormone should be an agonist', () => {
        const def = HeatExposure(85, 'dry', 1.0);
        const effect = def.pd.find(p => p.target === 'growthHormone');
        expect(effect?.mechanism).toBe('agonist');
      });

      it('prolactin should be an agonist', () => {
        const def = HeatExposure(85, 'dry', 1.0);
        const effect = def.pd.find(p => p.target === 'prolactin');
        expect(effect?.mechanism).toBe('agonist');
      });

      it('bdnf should be an agonist (neuroplasticity)', () => {
        const def = HeatExposure(85, 'dry', 1.0);
        const effect = def.pd.find(p => p.target === 'bdnf');
        expect(effect?.mechanism).toBe('agonist');
      });

      it('serotonin should be an agonist (mood)', () => {
        const def = HeatExposure(85, 'dry', 1.0);
        const effect = def.pd.find(p => p.target === 'serotonin');
        expect(effect?.mechanism).toBe('agonist');
      });

      it('vagal should be an agonist (relaxation)', () => {
        const def = HeatExposure(85, 'dry', 1.0);
        const effect = def.pd.find(p => p.target === 'vagal');
        expect(effect?.mechanism).toBe('agonist');
      });

      it('cortisol should be an antagonist (stress reduction)', () => {
        const def = HeatExposure(85, 'dry', 1.0);
        const effect = def.pd.find(p => p.target === 'cortisol');
        expect(effect?.mechanism).toBe('antagonist');
      });

      it('inflammation should be an antagonist (anti-inflammatory)', () => {
        const def = HeatExposure(85, 'dry', 1.0);
        const effect = def.pd.find(p => p.target === 'inflammation');
        expect(effect?.mechanism).toBe('antagonist');
      });

      it('vasopressin should be an agonist (fluid regulation)', () => {
        const def = HeatExposure(85, 'dry', 1.0);
        const effect = def.pd.find(p => p.target === 'vasopressin');
        expect(effect?.mechanism).toBe('agonist');
      });

      it('orexin should be an antagonist (relaxation/sedation)', () => {
        const def = HeatExposure(85, 'dry', 1.0);
        const effect = def.pd.find(p => p.target === 'orexin');
        expect(effect?.mechanism).toBe('antagonist');
      });

      it('endocannabinoid should be an agonist (bliss)', () => {
        const def = HeatExposure(85, 'dry', 1.0);
        const effect = def.pd.find(p => p.target === 'endocannabinoid');
        expect(effect?.mechanism).toBe('agonist');
      });
    });

    describe('PK Parameters', () => {
      it('should be correctly defined', () => {
        const def = HeatExposure(85, 'dry', 1.0);
        expect(def.molecule.name).toBe('Heat Exposure');
      });

      it('should use activity-dependent model', () => {
        const def = HeatExposure(85, 'dry', 1.0);
        expect(def.pk.model).toBe('activity-dependent');
      });
    });

    describe('Sauna types', () => {
      it('dry sauna should have highest GH multiplier', () => {
        const dry = HeatExposure(85, 'dry', 1.0);
        const infrared = HeatExposure(60, 'infrared', 1.0);
        const steam = HeatExposure(45, 'steam', 1.0);

        const dryGH = dry.pd.find(p => p.target === 'growthHormone')?.intrinsicEfficacy ?? 0;
        const infraredGH = infrared.pd.find(p => p.target === 'growthHormone')?.intrinsicEfficacy ?? 0;
        const steamGH = steam.pd.find(p => p.target === 'growthHormone')?.intrinsicEfficacy ?? 0;

        expect(dryGH).toBeGreaterThan(infraredGH);
        expect(dryGH).toBeGreaterThan(steamGH);
      });
    });

    describe('Temperature Scaling', () => {
      it('should scale with temperature', () => {
        const moderate = HeatExposure(70, 'dry', 1.0);
        const hot = HeatExposure(100, 'dry', 1.0);

        const moderateGH = moderate.pd.find(p => p.target === 'growthHormone')?.intrinsicEfficacy ?? 0;
        const hotGH = hot.pd.find(p => p.target === 'growthHormone')?.intrinsicEfficacy ?? 0;

        expect(hotGH).toBeGreaterThan(moderateGH);
      });
    });

    describe('Integration tests', () => {
      it('should boost growth hormone', async () => {
        await ScenarioBuilder.with()
          .duration(600)
          .taking('heatSauna', { temperature: 85, type: 'dry' }, 480)
          .expect('growthHormone').toRise()
          .run();
      });

      it('should boost prolactin', async () => {
        await ScenarioBuilder.with()
          .duration(600)
          .taking('heatSauna', { temperature: 85, type: 'dry' }, 480)
          .expect('prolactin').toRise()
          .run();
      });

      it('should boost serotonin (mood)', async () => {
        await ScenarioBuilder.with()
          .duration(600)
          .taking('heatSauna', { temperature: 85, type: 'dry' }, 480)
          .expect('serotonin').toRise()
          .run();
      });

      it('should boost vagal tone (relaxation)', async () => {
        await ScenarioBuilder.with()
          .duration(600)
          .taking('heatSauna', { temperature: 85, type: 'dry' }, 480)
          .expect('vagal').toRise()
          .run();
      });

      it('should reduce cortisol (stress reduction)', async () => {
        await ScenarioBuilder.with()
          .duration(600)
          .taking('heatSauna', { temperature: 85, type: 'dry' }, 480)
          .expect('cortisol').toFall()
          .run();
      });

      it('should boost vasopressin (fluid regulation)', async () => {
        await ScenarioBuilder.with()
          .duration(600)
          .taking('heatSauna', { temperature: 85, type: 'dry' }, 480)
          .expect('vasopressin').toRise()
          .run();
      });

      it('should suppress orexin (relaxation)', async () => {
        await ScenarioBuilder.with()
          .duration(600)
          .taking('heatSauna', { temperature: 85, type: 'dry' }, 480)
          .expect('orexin').toFall()
          .run();
      });

      it('should boost endocannabinoids (bliss)', async () => {
        await ScenarioBuilder.with()
          .duration(600)
          .taking('heatSauna', { temperature: 85, type: 'dry' }, 480)
          .expect('endocannabinoid').toRise()
          .run();
      });
    });
  });
});
