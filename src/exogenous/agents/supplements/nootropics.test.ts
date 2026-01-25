import { describe, expect, it } from 'vitest';
import { LTheanine, LTyrosine, LDopa, P5P, FiveHTP } from './nootropics';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: Nootropics', () => {
  describe('L-Theanine', () => {
    it('should be correctly defined', () => {
      const def = LTheanine(200);
      expect(def.molecule.name).toBe('L-Theanine');
      expect(def.pk.massMg).toBe(200);
    });

    it('should have high bioavailability', () => {
      const def = LTheanine(200);
      expect(def.pk.bioavailability).toBe(0.95);
    });

    it('should be a GABA-A PAM (calming)', () => {
      const def = LTheanine(200);
      const gabaEffect = def.pd.find(p => p.target === 'GABA_A');
      expect(gabaEffect).toBeDefined();
      expect(gabaEffect?.mechanism).toBe('PAM');
    });

    it('should mildly antagonize NMDA', () => {
      const def = LTheanine(200);
      const nmdaEffect = def.pd.find(p => p.target === 'NMDA');
      expect(nmdaEffect).toBeDefined();
      expect(nmdaEffect?.mechanism).toBe('antagonist');
    });

    it('should have both renal and hepatic clearance', () => {
      const def = LTheanine(200);
      expect(def.pk.clearance?.renal).toBeDefined();
      expect(def.pk.clearance?.hepatic).toBeDefined();
    });
  });

  describe('L-Tyrosine', () => {
    it('should be correctly defined', () => {
      const def = LTyrosine(500);
      expect(def.molecule.name).toBe('L-Tyrosine');
      expect(def.pk.massMg).toBe(500);
    });

    it('should boost dopamine', () => {
      const def = LTyrosine(500);
      const dopamineEffect = def.pd.find(p => p.target === 'dopamine');
      expect(dopamineEffect).toBeDefined();
      expect(dopamineEffect?.mechanism).toBe('agonist');
    });

    it('should have good bioavailability', () => {
      const def = LTyrosine(500);
      expect(def.pk.bioavailability).toBe(0.8);
    });

    it('should cap dopamine effect', () => {
      const def = LTyrosine(2000);
      const dopamineEffect = def.pd.find(p => p.target === 'dopamine')?.intrinsicEfficacy ?? 0;
      expect(dopamineEffect).toBeLessThanOrEqual(8); // capped
    });
  });

  describe('L-DOPA', () => {
    it('should be correctly defined', () => {
      const def = LDopa(100);
      expect(def.molecule.name).toBe('L-DOPA');
      expect(def.pk.massMg).toBe(100);
    });

    it('should strongly boost dopamine', () => {
      const def = LDopa(100);
      const dopamineEffect = def.pd.find(p => p.target === 'dopamine');
      expect(dopamineEffect).toBeDefined();
      expect(dopamineEffect?.mechanism).toBe('agonist');
    });

    it('should have faster onset than tyrosine', () => {
      const ldopa = LDopa(100);
      const tyrosine = LTyrosine(500);
      expect(ldopa.pk.timeToPeakMin).toBeLessThan(tyrosine.pk.timeToPeakMin!);
    });

    it('should have stronger effect per mg than tyrosine', () => {
      const ldopa = LDopa(100);
      const tyrosine = LTyrosine(100);

      const ldopaEffect = ldopa.pd.find(p => p.target === 'dopamine')?.intrinsicEfficacy ?? 0;
      const tyrosineEffect = tyrosine.pd.find(p => p.target === 'dopamine')?.intrinsicEfficacy ?? 0;

      expect(ldopaEffect).toBeGreaterThan(tyrosineEffect);
    });
  });

  describe('P5P (Active B6)', () => {
    it('should be correctly defined', () => {
      const def = P5P(50);
      expect(def.molecule.name).toBe('Pyridoxal-5-Phosphate');
      expect(def.pk.massMg).toBe(50);
    });

    it('should boost GABA', () => {
      const def = P5P(50);
      const gabaEffect = def.pd.find(p => p.target === 'gaba');
      expect(gabaEffect).toBeDefined();
      expect(gabaEffect?.mechanism).toBe('agonist');
    });
  });

  describe('5-HTP', () => {
    it('should be correctly defined', () => {
      const def = FiveHTP(100);
      expect(def.molecule.name).toBe('5-Hydroxytryptophan');
      expect(def.pk.massMg).toBe(100);
    });

    it('should boost serotonin', () => {
      const def = FiveHTP(100);
      const serotoninEffect = def.pd.find(p => p.target === 'serotonin');
      expect(serotoninEffect).toBeDefined();
      expect(serotoninEffect?.mechanism).toBe('agonist');
    });

    it('should have good bioavailability', () => {
      const def = FiveHTP(100);
      expect(def.pk.bioavailability).toBe(0.7);
    });

    it('should have fast onset', () => {
      const def = FiveHTP(100);
      expect(def.pk.timeToPeakMin).toBe(45);
    });
  });

  describe('Integration tests', () => {
    // Note: GABA_A and NMDA are receptor targets that don't exist as simulation signals
    // These effects are verified via unit tests above

    it('L-Tyrosine: should boost dopamine', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('lTyrosine', { mg: 500 }, 480)
        .expect('dopamine').toRise()
        .run();
    });

    it('L-DOPA: should boost dopamine', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('lDopa', { mg: 100 }, 480)
        .expect('dopamine').toRise()
        .run();
    });

    it('P5P: should boost GABA', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('p5p', { mg: 50 }, 480)
        .expect('gaba').toRise()
        .run();
    });

    it('5-HTP: should boost serotonin', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('fiveHTP', { mg: 100 }, 480)
        .expect('serotonin').toRise()
        .run();
    });
  });
});
