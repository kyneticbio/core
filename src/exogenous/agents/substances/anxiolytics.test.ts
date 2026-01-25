import { describe, expect, it } from 'vitest';
import { Alprazolam, Lorazepam, Clonazepam, Buspirone, Hydroxyzine } from './anxiolytics';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: Anxiolytics', () => {
  describe('Benzodiazepines', () => {
    describe('Alprazolam (Xanax)', () => {
      it('should be correctly defined', () => {
        const def = Alprazolam(0.5);
        expect(def.molecule.name).toBe('Alprazolam');
        expect(def.pk.massMg).toBe(0.5);
      });

      it('should be a GABA-A PAM', () => {
        const def = Alprazolam(0.5);
        const gabaEffect = def.pd.find(p => p.target === 'GABA_A');
        expect(gabaEffect).toBeDefined();
        expect(gabaEffect?.mechanism).toBe('PAM');
      });

      it('should have fast onset', () => {
        const def = Alprazolam(0.5);
        expect(def.pk.timeToPeakMin).toBe(60);
      });

      it('should have high bioavailability', () => {
        const def = Alprazolam(0.5);
        expect(def.pk.bioavailability).toBe(0.9);
      });
    });

    describe('Lorazepam (Ativan)', () => {
      it('should be a GABA-A PAM', () => {
        const def = Lorazepam(1);
        const gabaEffect = def.pd.find(p => p.target === 'GABA_A');
        expect(gabaEffect?.mechanism).toBe('PAM');
      });

      it('should have slower onset than alprazolam', () => {
        const alprazolam = Alprazolam(0.5);
        const lorazepam = Lorazepam(1);
        expect(lorazepam.pk.timeToPeakMin).toBeGreaterThan(alprazolam.pk.timeToPeakMin!);
      });
    });

    describe('Clonazepam (Klonopin)', () => {
      it('should have long half-life', () => {
        const def = Clonazepam(0.5);
        expect(def.pk.halfLifeMin).toBe(2160); // ~36 hours
      });

      it('should have high potency (high intrinsic efficacy per mg)', () => {
        const def = Clonazepam(0.5);
        const gabaEffect = def.pd.find(p => p.target === 'GABA_A');
        expect(gabaEffect?.intrinsicEfficacy).toBe(50); // 0.5 * 100
      });
    });
  });

  describe('Non-benzodiazepines', () => {
    describe('Buspirone (Buspar)', () => {
      it('should be a serotonin agonist', () => {
        const def = Buspirone(10);
        const serotoninEffect = def.pd.find(p => p.target === 'serotonin');
        expect(serotoninEffect).toBeDefined();
        expect(serotoninEffect?.mechanism).toBe('agonist');
      });

      it('should have low bioavailability', () => {
        const def = Buspirone(10);
        expect(def.pk.bioavailability).toBe(0.04);
      });

      it('should have short half-life', () => {
        const def = Buspirone(10);
        expect(def.pk.halfLifeMin).toBe(150); // ~2.5 hours
      });
    });

    describe('Hydroxyzine (Vistaril)', () => {
      it('should be a histamine antagonist', () => {
        const def = Hydroxyzine(25);
        const histamineEffect = def.pd.find(p => p.target === 'histamine');
        expect(histamineEffect).toBeDefined();
        expect(histamineEffect?.mechanism).toBe('antagonist');
      });

      it('should have good bioavailability', () => {
        const def = Hydroxyzine(25);
        expect(def.pk.bioavailability).toBe(0.8);
      });

      it('should have long half-life', () => {
        const def = Hydroxyzine(25);
        expect(def.pk.halfLifeMin).toBe(1200); // ~20 hours
      });
    });
  });

  describe('Dose scaling', () => {
    it('benzodiazepines should scale GABA effect with dose', () => {
      const low = Alprazolam(0.25);
      const high = Alprazolam(2);

      const lowEffect = low.pd.find(p => p.target === 'GABA_A')?.intrinsicEfficacy ?? 0;
      const highEffect = high.pd.find(p => p.target === 'GABA_A')?.intrinsicEfficacy ?? 0;

      expect(highEffect).toBeGreaterThan(lowEffect);
    });
  });

  describe('Integration tests', () => {
    // Note: GABA_A is a receptor target that doesn't exist as a simulation signal
    // Benzodiazepine GABA-A effects are verified via unit tests above

    it('Buspirone: should increase serotonin', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('buspirone', { mg: 10 }, 480)
        .expect('serotonin').toRise()
        .run();
    });

    it('Hydroxyzine: should antagonize histamine', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('hydroxyzine', { mg: 25 }, 480)
        .expect('histamine').toFall()
        .run();
    });
  });
});
