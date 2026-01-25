import { describe, expect, it } from 'vitest';
import { Nicotine } from './nicotine';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: Nicotine', () => {
  it('should be correctly defined', () => {
    const def = Nicotine(2, 'smoked');
    expect(def.molecule.name).toBe('Nicotine');
    expect(def.pk.massMg).toBe(2);
  });

  describe('Route-dependent pharmacokinetics', () => {
    it('smoked should have fastest onset', () => {
      const smoked = Nicotine(2, 'smoked');
      expect(smoked.pk.timeToPeakMin).toBe(2);
      expect(smoked.pk.bioavailability).toBe(0.8);
    });

    it('vaped should have fast onset', () => {
      const vaped = Nicotine(2, 'vaped');
      expect(vaped.pk.timeToPeakMin).toBe(5);
      expect(vaped.pk.bioavailability).toBe(0.6);
    });

    it('gum should have slower onset', () => {
      const gum = Nicotine(2, 'gum');
      expect(gum.pk.timeToPeakMin).toBe(30);
      expect(gum.pk.bioavailability).toBe(0.5);
    });

    it('pouch should have moderate onset', () => {
      const pouch = Nicotine(2, 'pouch');
      expect(pouch.pk.timeToPeakMin).toBe(20);
      expect(pouch.pk.bioavailability).toBe(0.6);
    });

    it('patch should use infusion delivery', () => {
      const patch = Nicotine(21, 'patch');
      expect(patch.pk.delivery).toBe('infusion');
      expect(patch.pk.timeToPeakMin).toBe(120);
      expect(patch.pk.bioavailability).toBe(0.7);
    });
  });

  describe('Pharmacodynamics', () => {
    it('should increase acetylcholine', () => {
      const def = Nicotine(2, 'smoked');
      const achEffect = def.pd.find(p => p.target === 'acetylcholine');
      expect(achEffect).toBeDefined();
      expect(achEffect?.mechanism).toBe('agonist');
    });

    it('should increase dopamine', () => {
      const def = Nicotine(2, 'smoked');
      const dopamineEffect = def.pd.find(p => p.target === 'dopamine');
      expect(dopamineEffect).toBeDefined();
      expect(dopamineEffect?.mechanism).toBe('agonist');
    });

    it('should increase norepinephrine', () => {
      const def = Nicotine(2, 'smoked');
      const norepiEffect = def.pd.find(p => p.target === 'norepi');
      expect(norepiEffect).toBeDefined();
      expect(norepiEffect?.mechanism).toBe('agonist');
    });

    it('should increase cortisol', () => {
      const def = Nicotine(2, 'smoked');
      const cortisolEffect = def.pd.find(p => p.target === 'cortisol');
      expect(cortisolEffect).toBeDefined();
      expect(cortisolEffect?.mechanism).toBe('agonist');
    });

    it('should increase endorphins', () => {
      const def = Nicotine(2, 'smoked');
      const endorphinEffect = def.pd.find(p => p.target === 'endorphin');
      expect(endorphinEffect).toBeDefined();
      expect(endorphinEffect?.mechanism).toBe('agonist');
    });
  });

  describe('Dose scaling', () => {
    it('should scale effects with dose', () => {
      const low = Nicotine(1, 'smoked');
      const high = Nicotine(4, 'smoked');

      const lowDopamine = low.pd.find(p => p.target === 'dopamine')?.intrinsicEfficacy ?? 0;
      const highDopamine = high.pd.find(p => p.target === 'dopamine')?.intrinsicEfficacy ?? 0;

      expect(highDopamine).toBeGreaterThan(lowDopamine);
    });
  });

  describe('Integration tests', () => {
    it('tobacco should spike acetylcholine and dopamine', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('tobacco', { delivery: 'smoked', mg: 2 }, 480)
        .expect('acetylcholine').toRise()
        .expect('dopamine').toRise()
        .run();
    });

    it('tobacco should spike norepinephrine', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('tobacco', { delivery: 'smoked', mg: 2 }, 480)
        .expect('norepi').toRise()
        .run();
    });

    it('tobacco should spike cortisol', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('tobacco', { delivery: 'smoked', mg: 2 }, 480)
        .expect('cortisol').toRise()
        .run();
    });

    it('tobacco should spike endorphins', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('tobacco', { delivery: 'smoked', mg: 2 }, 480)
        .expect('endorphin').toRise()
        .run();
    });
  });
});
