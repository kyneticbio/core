import { describe, expect, it } from 'vitest';
import { Inositol, DigestiveEnzymes } from './other';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: Other Supplements', () => {
  describe('Inositol', () => {
    it('should be correctly defined', () => {
      const def = Inositol(2000);
      expect(def.molecule.name).toBe('Inositol');
      expect(def.pk.massMg).toBe(2000);
    });

    it('should have high bioavailability', () => {
      const def = Inositol(2000);
      expect(def.pk.bioavailability).toBe(0.9);
    });

    it('should boost GABA', () => {
      const def = Inositol(2000);
      const gabaEffect = def.pd.find(p => p.target === 'gaba');
      expect(gabaEffect).toBeDefined();
      expect(gabaEffect?.mechanism).toBe('agonist');
    });

    it('should scale effect with dose up to cap', () => {
      const low = Inositol(1000);
      const high = Inositol(18000);

      const lowGaba = low.pd.find(p => p.target === 'gaba')?.intrinsicEfficacy ?? 0;
      const highGaba = high.pd.find(p => p.target === 'gaba')?.intrinsicEfficacy ?? 0;

      expect(highGaba).toBeGreaterThan(lowGaba);
      expect(highGaba).toBeLessThanOrEqual(30); // capped
    });
  });

  describe('Digestive Enzymes', () => {
    it('should be correctly defined', () => {
      const def = DigestiveEnzymes(1);
      expect(def.molecule.name).toBe('Digestive Enzymes');
    });

    it('should use activity-dependent model', () => {
      const def = DigestiveEnzymes(1);
      expect(def.pk.model).toBe('activity-dependent');
    });

    it('should boost GLP-1', () => {
      const def = DigestiveEnzymes(1);
      const glp1Effect = def.pd.find(p => p.target === 'glp1');
      expect(glp1Effect).toBeDefined();
      expect(glp1Effect?.mechanism).toBe('agonist');
    });

    it('should scale with units', () => {
      const single = DigestiveEnzymes(1);
      const double = DigestiveEnzymes(2);

      const singleEffect = single.pd.find(p => p.target === 'glp1')?.intrinsicEfficacy ?? 0;
      const doubleEffect = double.pd.find(p => p.target === 'glp1')?.intrinsicEfficacy ?? 0;

      expect(doubleEffect).toBeGreaterThan(singleEffect);
    });
  });

  describe('Integration tests', () => {
    it('Inositol: should boost GABA', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('inositol', { mg: 2000 }, 480)
        .expect('gaba').toRise()
        .run();
    });

    it('Digestive Enzymes: should boost GLP-1', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('digestiveEnzymes', { units: 1 }, 480)
        .expect('glp1').toRise()
        .run();
    });
  });
});
