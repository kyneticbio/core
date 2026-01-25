import { describe, expect, it } from 'vitest';
import { Sertraline, Fluoxetine, Escitalopram, Venlafaxine, Duloxetine, Bupropion } from './antidepressants';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: Antidepressants', () => {
  describe('SSRIs', () => {
    describe('Sertraline (Zoloft)', () => {
      it('should be correctly defined', () => {
        const def = Sertraline(50);
        expect(def.molecule.name).toBe('Sertraline');
        expect(def.pk.massMg).toBe(50);
      });

      it('should inhibit SERT', () => {
        const def = Sertraline(50);
        const sertEffect = def.pd.find(p => p.target === 'SERT');
        expect(sertEffect).toBeDefined();
        expect(sertEffect?.mechanism).toBe('antagonist');
      });

      it('should have long half-life', () => {
        const def = Sertraline(50);
        expect(def.pk.halfLifeMin).toBe(1560); // ~26 hours
      });

      it('should be metabolized by CYP2D6', () => {
        const def = Sertraline(50);
        expect(def.pk.clearance?.hepatic?.CYP).toBe('CYP2D6');
      });
    });

    describe('Fluoxetine (Prozac)', () => {
      it('should have very long half-life', () => {
        const def = Fluoxetine(20);
        expect(def.pk.halfLifeMin).toBe(2880); // ~48 hours
      });

      it('should inhibit SERT', () => {
        const def = Fluoxetine(20);
        const sertEffect = def.pd.find(p => p.target === 'SERT');
        expect(sertEffect?.mechanism).toBe('antagonist');
      });
    });

    describe('Escitalopram (Lexapro)', () => {
      it('should have high bioavailability', () => {
        const def = Escitalopram(10);
        expect(def.pk.bioavailability).toBe(0.8);
      });

      it('should inhibit SERT', () => {
        const def = Escitalopram(10);
        const sertEffect = def.pd.find(p => p.target === 'SERT');
        expect(sertEffect).toBeDefined();
        expect(sertEffect?.mechanism).toBe('antagonist');
      });

      it('should be metabolized by CYP2C19', () => {
        const def = Escitalopram(10);
        expect(def.pk.clearance?.hepatic?.CYP).toBe('CYP2C19');
      });
    });
  });

  describe('SNRIs', () => {
    describe('Venlafaxine (Effexor)', () => {
      it('should inhibit SERT', () => {
        const def = Venlafaxine(75);
        const sertEffect = def.pd.find(p => p.target === 'SERT');
        expect(sertEffect).toBeDefined();
      });

      it('should have shorter half-life than SSRIs', () => {
        const venlafaxine = Venlafaxine(75);
        const sertraline = Sertraline(50);
        expect(venlafaxine.pk.halfLifeMin!).toBeLessThan(sertraline.pk.halfLifeMin!);
      });
    });

    describe('Duloxetine (Cymbalta)', () => {
      it('should inhibit both SERT and NET', () => {
        const def = Duloxetine(60);
        const sertEffect = def.pd.find(p => p.target === 'SERT');
        const netEffect = def.pd.find(p => p.target === 'NET');
        expect(sertEffect).toBeDefined();
        expect(netEffect).toBeDefined();
      });

      it('should be metabolized by CYP1A2', () => {
        const def = Duloxetine(60);
        expect(def.pk.clearance?.hepatic?.CYP).toBe('CYP1A2');
      });
    });
  });

  describe('NDRIs', () => {
    describe('Bupropion (Wellbutrin)', () => {
      it('should inhibit DAT', () => {
        const def = Bupropion(150);
        const datEffect = def.pd.find(p => p.target === 'DAT');
        expect(datEffect).toBeDefined();
        expect(datEffect?.mechanism).toBe('antagonist');
      });

      it('should have high bioavailability', () => {
        const def = Bupropion(150);
        expect(def.pk.bioavailability).toBe(0.87);
      });

      it('should be metabolized by CYP2B6', () => {
        const def = Bupropion(150);
        expect(def.pk.clearance?.hepatic?.CYP).toBe('CYP2B6');
      });
    });
  });

  // Note: SERT, NET, and DAT are transporter targets that don't exist as simulation signals
  // These effects are verified via unit tests above
});
