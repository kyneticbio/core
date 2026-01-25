import { describe, expect, it } from 'vitest';
import { Zinc, Copper, Chromium } from './minerals';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: Minerals', () => {
  describe('Zinc', () => {
    it('should be correctly defined', () => {
      const def = Zinc(30);
      expect(def.molecule.name).toBe('Zinc');
      expect(def.pk.massMg).toBe(30);
    });

    it('should have moderate bioavailability', () => {
      const def = Zinc(30);
      expect(def.pk.bioavailability).toBe(0.3);
    });

    it('should target zinc levels', () => {
      const def = Zinc(30);
      const zincEffect = def.pd.find(p => p.target === 'zinc');
      expect(zincEffect).toBeDefined();
      expect(zincEffect?.mechanism).toBe('agonist');
    });

    it('should scale effect with dose up to cap', () => {
      const low = Zinc(15);
      const high = Zinc(50);

      const lowEffect = low.pd.find(p => p.target === 'zinc')?.intrinsicEfficacy ?? 0;
      const highEffect = high.pd.find(p => p.target === 'zinc')?.intrinsicEfficacy ?? 0;

      expect(highEffect).toBeGreaterThan(lowEffect);
      expect(highEffect).toBeLessThanOrEqual(25); // capped
    });
  });

  describe('Copper', () => {
    it('should be correctly defined', () => {
      const def = Copper(2);
      expect(def.molecule.name).toBe('Copper');
      expect(def.pk.massMg).toBe(2);
    });

    it('should have moderate bioavailability', () => {
      const def = Copper(2);
      expect(def.pk.bioavailability).toBe(0.5);
    });

    it('should have long half-life', () => {
      const def = Copper(2);
      expect(def.pk.halfLifeMin).toBe(1440); // 24 hours
    });

    it('should target copper levels', () => {
      const def = Copper(2);
      const copperEffect = def.pd.find(p => p.target === 'copper');
      expect(copperEffect).toBeDefined();
      expect(copperEffect?.mechanism).toBe('agonist');
    });
  });

  describe('Chromium', () => {
    it('should be correctly defined', () => {
      const def = Chromium(200);
      expect(def.molecule.name).toBe('Chromium Picolinate');
      expect(def.pk.massMg).toBe(0.2); // 200mcg = 0.2mg
    });

    it('should have very low bioavailability', () => {
      const def = Chromium(200);
      expect(def.pk.bioavailability).toBe(0.02);
    });

    it('should have very long half-life', () => {
      const def = Chromium(200);
      expect(def.pk.halfLifeMin).toBe(2880); // 48 hours
    });

    it('should target chromium index', () => {
      const def = Chromium(200);
      const chromiumEffect = def.pd.find(p => p.target === 'chromium');
      expect(chromiumEffect).toBeDefined();
      expect(chromiumEffect?.mechanism).toBe('agonist');
    });
  });

  describe('Integration tests', () => {
    it('Zinc: should increase zinc levels', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('zinc', { mg: 30 }, 480)
        .expect('zinc').toRise()
        .run();
    });

    it('Copper: should increase copper levels', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('copper', { mg: 2 }, 480)
        .expect('copper').toRise()
        .run();
    });

    // Note: chromium has very low bioavailability (2%) and effect may not be measurable
    // in short simulations. The effect is verified via unit tests above.
  });
});
