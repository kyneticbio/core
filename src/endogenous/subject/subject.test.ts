import { describe, expect, it } from 'vitest';
import { calculateBMR, calculateTBW, calculateLBM, derivePhysiology } from './utils';
import { DEFAULT_SUBJECT } from './defaults';
import type { Subject } from './types';
import { runEngine, signalStats, mean } from '../../utils/test/utils';

describe('Subject Parameters', () => {
  // ============================================
  // PHYSIOLOGY DERIVATION TESTS
  // ============================================
  describe('Physiology Derivation', () => {
    describe('BMR (Basal Metabolic Rate) - Mifflin-St Jeor', () => {
      it('should calculate higher BMR for males than females (same demographics)', () => {
        const male: Subject = { ...DEFAULT_SUBJECT, sex: 'male', age: 30, weight: 70, height: 175 };
        const female: Subject = { ...DEFAULT_SUBJECT, sex: 'female', age: 30, weight: 70, height: 175 };

        const maleBMR = calculateBMR(male);
        const femaleBMR = calculateBMR(female);

        expect(maleBMR).toBeGreaterThan(femaleBMR);
        // Male formula: 10*70 + 6.25*175 - 5*30 + 5 = 700 + 1093.75 - 150 + 5 = 1648.75
        // Female formula: 10*70 + 6.25*175 - 5*30 - 161 = 700 + 1093.75 - 150 - 161 = 1482.75
        expect(maleBMR).toBeCloseTo(1648.75, 1);
        expect(femaleBMR).toBeCloseTo(1482.75, 1);
      });

      it('should decrease BMR with age', () => {
        const young: Subject = { ...DEFAULT_SUBJECT, age: 20 };
        const middle: Subject = { ...DEFAULT_SUBJECT, age: 40 };
        const older: Subject = { ...DEFAULT_SUBJECT, age: 60 };

        const youngBMR = calculateBMR(young);
        const middleBMR = calculateBMR(middle);
        const olderBMR = calculateBMR(older);

        expect(youngBMR).toBeGreaterThan(middleBMR);
        expect(middleBMR).toBeGreaterThan(olderBMR);
        // Each year = -5 kcal
        expect(youngBMR - middleBMR).toBeCloseTo(100, 1); // 20 years * 5 kcal
        expect(middleBMR - olderBMR).toBeCloseTo(100, 1); // 20 years * 5 kcal
      });

      it('should increase BMR with weight', () => {
        const light: Subject = { ...DEFAULT_SUBJECT, weight: 55 };
        const medium: Subject = { ...DEFAULT_SUBJECT, weight: 70 };
        const heavy: Subject = { ...DEFAULT_SUBJECT, weight: 100 };

        const lightBMR = calculateBMR(light);
        const mediumBMR = calculateBMR(medium);
        const heavyBMR = calculateBMR(heavy);

        expect(heavyBMR).toBeGreaterThan(mediumBMR);
        expect(mediumBMR).toBeGreaterThan(lightBMR);
        // Each kg = +10 kcal
        expect(heavyBMR - mediumBMR).toBeCloseTo(300, 1); // 30 kg * 10 kcal
      });

      it('should increase BMR with height', () => {
        const short: Subject = { ...DEFAULT_SUBJECT, height: 160 };
        const medium: Subject = { ...DEFAULT_SUBJECT, height: 175 };
        const tall: Subject = { ...DEFAULT_SUBJECT, height: 190 };

        const shortBMR = calculateBMR(short);
        const mediumBMR = calculateBMR(medium);
        const tallBMR = calculateBMR(tall);

        expect(tallBMR).toBeGreaterThan(mediumBMR);
        expect(mediumBMR).toBeGreaterThan(shortBMR);
        // Each cm = +6.25 kcal
        expect(tallBMR - mediumBMR).toBeCloseTo(93.75, 1); // 15 cm * 6.25 kcal
      });
    });

    describe('TBW (Total Body Water) - Watson Formula', () => {
      it('should calculate higher TBW for males than females', () => {
        const male: Subject = { ...DEFAULT_SUBJECT, sex: 'male' };
        const female: Subject = { ...DEFAULT_SUBJECT, sex: 'female' };

        const maleTBW = calculateTBW(male);
        const femaleTBW = calculateTBW(female);

        expect(maleTBW).toBeGreaterThan(femaleTBW);
      });

      it('should decrease TBW with age (males only)', () => {
        const youngMale: Subject = { ...DEFAULT_SUBJECT, sex: 'male', age: 20 };
        const olderMale: Subject = { ...DEFAULT_SUBJECT, sex: 'male', age: 60 };
        const youngFemale: Subject = { ...DEFAULT_SUBJECT, sex: 'female', age: 20 };
        const olderFemale: Subject = { ...DEFAULT_SUBJECT, sex: 'female', age: 60 };

        expect(calculateTBW(youngMale)).toBeGreaterThan(calculateTBW(olderMale));
        // Female TBW formula doesn't include age
        expect(calculateTBW(youngFemale)).toBeCloseTo(calculateTBW(olderFemale), 1);
      });

      it('should increase TBW with weight', () => {
        const light: Subject = { ...DEFAULT_SUBJECT, weight: 55 };
        const heavy: Subject = { ...DEFAULT_SUBJECT, weight: 100 };

        expect(calculateTBW(heavy)).toBeGreaterThan(calculateTBW(light));
      });

      it('should increase TBW with height', () => {
        const short: Subject = { ...DEFAULT_SUBJECT, height: 160 };
        const tall: Subject = { ...DEFAULT_SUBJECT, height: 190 };

        expect(calculateTBW(tall)).toBeGreaterThan(calculateTBW(short));
      });
    });

    describe('LBM (Lean Body Mass) - Boer Formula', () => {
      it('should calculate higher LBM for males than females', () => {
        const male: Subject = { ...DEFAULT_SUBJECT, sex: 'male' };
        const female: Subject = { ...DEFAULT_SUBJECT, sex: 'female' };

        const maleLBM = calculateLBM(male);
        const femaleLBM = calculateLBM(female);

        expect(maleLBM).toBeGreaterThan(femaleLBM);
      });

      it('should increase LBM with weight', () => {
        const light: Subject = { ...DEFAULT_SUBJECT, weight: 55 };
        const heavy: Subject = { ...DEFAULT_SUBJECT, weight: 100 };

        expect(calculateLBM(heavy)).toBeGreaterThan(calculateLBM(light));
      });

      it('should increase LBM with height', () => {
        const short: Subject = { ...DEFAULT_SUBJECT, height: 160 };
        const tall: Subject = { ...DEFAULT_SUBJECT, height: 190 };

        expect(calculateLBM(tall)).toBeGreaterThan(calculateLBM(short));
      });
    });

    describe('Derived Physiology Metrics', () => {
      it('should calculate BMI correctly', () => {
        // BMI = weight / (height/100)^2
        const subject: Subject = { ...DEFAULT_SUBJECT, weight: 70, height: 175 };
        const physiology = derivePhysiology(subject);

        const expectedBMI = 70 / Math.pow(175 / 100, 2);
        expect(physiology.bmi).toBeCloseTo(expectedBMI, 2);
        expect(physiology.bmi).toBeCloseTo(22.86, 1);
      });

      it('should calculate higher BMI for heavier subjects', () => {
        const normal: Subject = { ...DEFAULT_SUBJECT, weight: 70, height: 175 };
        const overweight: Subject = { ...DEFAULT_SUBJECT, weight: 90, height: 175 };
        const obese: Subject = { ...DEFAULT_SUBJECT, weight: 110, height: 175 };

        const normalPhys = derivePhysiology(normal);
        const overweightPhys = derivePhysiology(overweight);
        const obesePhys = derivePhysiology(obese);

        expect(normalPhys.bmi).toBeLessThan(25); // Normal range
        expect(overweightPhys.bmi).toBeGreaterThan(25); // Overweight
        expect(obesePhys.bmi).toBeGreaterThan(30); // Obese
      });

      it('should calculate BSA using Mosteller formula', () => {
        // BSA = sqrt((height * weight) / 3600)
        const subject: Subject = { ...DEFAULT_SUBJECT, weight: 70, height: 175 };
        const physiology = derivePhysiology(subject);

        const expectedBSA = Math.sqrt((175 * 70) / 3600);
        expect(physiology.bsa).toBeCloseTo(expectedBSA, 3);
      });

      it('should calculate metabolicCapacity relative to reference', () => {
        const subject: Subject = { ...DEFAULT_SUBJECT };
        const physiology = derivePhysiology(subject);

        // metabolicCapacity = BMR / 1660
        const expectedCapacity = physiology.bmr / 1660;
        expect(physiology.metabolicCapacity).toBeCloseTo(expectedCapacity, 3);
      });

      it('should calculate drugClearance relative to reference', () => {
        const subject: Subject = { ...DEFAULT_SUBJECT };
        const physiology = derivePhysiology(subject);

        // drugClearance = TBW / 42
        const expectedClearance = physiology.tbw / 42;
        expect(physiology.drugClearance).toBeCloseTo(expectedClearance, 3);
      });

      it('should calculate eGFR using Cockcroft-Gault', () => {
        // Strip bloodwork eGFR so Cockcroft-Gault is used
        const { eGFR_mL_min: _, ...metabolicNoGFR } = DEFAULT_SUBJECT.bloodwork?.metabolic ?? {};
        const bwNoGFR = { ...DEFAULT_SUBJECT.bloodwork, metabolic: metabolicNoGFR };
        const male: Subject = { ...DEFAULT_SUBJECT, sex: 'male', age: 30, weight: 70, bloodwork: bwNoGFR };
        const female: Subject = { ...DEFAULT_SUBJECT, sex: 'female', age: 30, weight: 70, bloodwork: bwNoGFR };

        const malePhys = derivePhysiology(male);
        const femalePhys = derivePhysiology(female);

        // Male: ((140 - 30) * 70) / 72 = 107
        // Female: 107 * 0.85 = 91
        expect(malePhys.estimatedGFR).toBeCloseTo(107, 0);
        expect(femalePhys.estimatedGFR).toBeCloseTo(91, 0);
      });

      it('should calculate lower eGFR with age', () => {
        // Strip bloodwork eGFR so Cockcroft-Gault is used
        const { eGFR_mL_min: _, ...metabolicNoGFR } = DEFAULT_SUBJECT.bloodwork?.metabolic ?? {};
        const bwNoGFR = { ...DEFAULT_SUBJECT.bloodwork, metabolic: metabolicNoGFR };
        const young: Subject = { ...DEFAULT_SUBJECT, age: 25, bloodwork: bwNoGFR };
        const old: Subject = { ...DEFAULT_SUBJECT, age: 65, bloodwork: bwNoGFR };

        const youngPhys = derivePhysiology(young);
        const oldPhys = derivePhysiology(old);

        expect(youngPhys.estimatedGFR).toBeGreaterThan(oldPhys.estimatedGFR);
      });

      it('should calculate liverBloodFlow from BSA', () => {
        const subject: Subject = { ...DEFAULT_SUBJECT };
        const physiology = derivePhysiology(subject);

        // liverBloodFlow = 1.5 * (BSA / 1.85)
        const expectedFlow = 1.5 * (physiology.bsa / 1.85);
        expect(physiology.liverBloodFlow).toBeCloseTo(expectedFlow, 3);
      });
    });
  });

  // ============================================
  // SEX-BASED SIGNAL MODULATION TESTS
  // ============================================
  describe('Sex-Based Signal Modulation', () => {
    describe('Testosterone', () => {
      it('males should have much higher testosterone than females', async () => {
        const maleResult = await runEngine({
          duration: 1440,
          subject: { sex: 'male', age: 30 },
          includeSignals: ['testosterone'],
        });
        const femaleResult = await runEngine({
          duration: 1440,
          subject: { sex: 'female', age: 30 },
          includeSignals: ['testosterone'],
        });

        const maleMean = mean(maleResult.signals.testosterone);
        const femaleMean = mean(femaleResult.signals.testosterone);

        // Males: ~250-500 ng/dL (circadian mean), Females: ~20-40 ng/dL
        expect(maleMean).toBeGreaterThan(femaleMean * 5);
        expect(maleMean).toBeGreaterThan(200);
        expect(femaleMean).toBeLessThan(50);
      });

      it('testosterone should decline with age in both sexes', async () => {
        const youngMale = await runEngine({
          duration: 1440,
          subject: { sex: 'male', age: 25 },
          includeSignals: ['testosterone'],
        });
        const oldMale = await runEngine({
          duration: 1440,
          subject: { sex: 'male', age: 60 },
          includeSignals: ['testosterone'],
        });
        const youngFemale = await runEngine({
          duration: 1440,
          subject: { sex: 'female', age: 25 },
          includeSignals: ['testosterone'],
        });
        const oldFemale = await runEngine({
          duration: 1440,
          subject: { sex: 'female', age: 60 },
          includeSignals: ['testosterone'],
        });

        expect(mean(youngMale.signals.testosterone)).toBeGreaterThan(mean(oldMale.signals.testosterone));
        expect(mean(youngFemale.signals.testosterone)).toBeGreaterThan(mean(oldFemale.signals.testosterone));
      });

      it('testosterone should floor at 50% of baseline at old age', async () => {
        const age30 = await runEngine({
          duration: 1440,
          subject: { sex: 'male', age: 30 },
          includeSignals: ['testosterone'],
        });
        const age80 = await runEngine({
          duration: 1440,
          subject: { sex: 'male', age: 80 },
          includeSignals: ['testosterone'],
        });

        const mean30 = mean(age30.signals.testosterone);
        const mean80 = mean(age80.signals.testosterone);

        // At age 80, 50 years past 30, decline would be 50% but floored at 50%
        expect(mean80).toBeGreaterThan(mean30 * 0.4);
        expect(mean80).toBeLessThan(mean30 * 0.6);
      });
    });

    describe('Estrogen', () => {
      it('females should have higher estrogen than males', async () => {
        const maleResult = await runEngine({
          duration: 1440,
          subject: { sex: 'male' },
          includeSignals: ['estrogen'],
        });
        const femaleResult = await runEngine({
          duration: 1440,
          subject: { sex: 'female', cycleDay: 14 }, // Ovulation peak
          includeSignals: ['estrogen'],
        });

        const maleMean = mean(maleResult.signals.estrogen);
        const femaleMean = mean(femaleResult.signals.estrogen);

        // Males: converges to setpoint ~30 pg/mL, Females: 20-270 pg/mL
        // Signal starts at initialValue (40) and converges toward setpoint
        expect(femaleMean).toBeGreaterThan(maleMean);
        // Male setpoint is 30, signal converges toward it
        expect(maleMean).toBeLessThan(40);
        expect(maleMean).toBeGreaterThan(10);
      });

      it('male estrogen should be constant (no cycle variation)', async () => {
        const day1 = await runEngine({
          duration: 1440,
          subject: { sex: 'male', cycleDay: 1 },
          includeSignals: ['estrogen'],
        });
        const day14 = await runEngine({
          duration: 1440,
          subject: { sex: 'male', cycleDay: 14 },
          includeSignals: ['estrogen'],
        });

        const meanDay1 = mean(day1.signals.estrogen);
        const meanDay14 = mean(day14.signals.estrogen);

        expect(meanDay1).toBeCloseTo(meanDay14, 1);
      });
    });

    describe('Progesterone', () => {
      it('females should have higher progesterone than males (luteal phase)', async () => {
        const maleResult = await runEngine({
          duration: 1440,
          subject: { sex: 'male' },
          includeSignals: ['progesterone'],
        });
        const femaleResult = await runEngine({
          duration: 1440,
          subject: { sex: 'female', cycleDay: 21 }, // Luteal peak
          includeSignals: ['progesterone'],
        });

        const maleMean = mean(maleResult.signals.progesterone);
        const femaleMean = mean(femaleResult.signals.progesterone);

        // Males: ~0.2 ng/mL, Females luteal: up to 18 ng/mL
        expect(femaleMean).toBeGreaterThan(maleMean * 5);
        expect(maleMean).toBeCloseTo(0.2, 0.1);
      });
    });

    describe('LH and FSH', () => {
      it('female LH should vary with cycle while male is constant', async () => {
        const maleDay1 = await runEngine({
          duration: 1440,
          subject: { sex: 'male', cycleDay: 1 },
          includeSignals: ['lh'],
        });
        const maleDay14 = await runEngine({
          duration: 1440,
          subject: { sex: 'male', cycleDay: 14 },
          includeSignals: ['lh'],
        });
        const femaleDay1 = await runEngine({
          duration: 1440,
          subject: { sex: 'female', cycleDay: 1 },
          includeSignals: ['lh'],
        });
        const femaleDay14 = await runEngine({
          duration: 1440,
          subject: { sex: 'female', cycleDay: 14 }, // Ovulation LH surge
          includeSignals: ['lh'],
        });

        // Males should be constant (~5 IU/L)
        expect(mean(maleDay1.signals.lh)).toBeCloseTo(mean(maleDay14.signals.lh), 0.5);
        // Females should have higher LH at ovulation
        expect(mean(femaleDay14.signals.lh)).toBeGreaterThan(mean(femaleDay1.signals.lh));
      });
    });
  });

  // ============================================
  // MENSTRUAL CYCLE TESTS
  // ============================================
  describe('Menstrual Cycle Effects', () => {
    describe('Estrogen Cycle', () => {
      it('should peak around day 12-14 (follicular phase)', async () => {
        const day1 = await runEngine({ duration: 1440, subject: { sex: 'female', cycleDay: 1 }, includeSignals: ['estrogen'] });
        const day7 = await runEngine({ duration: 1440, subject: { sex: 'female', cycleDay: 7 }, includeSignals: ['estrogen'] });
        const day12 = await runEngine({ duration: 1440, subject: { sex: 'female', cycleDay: 12 }, includeSignals: ['estrogen'] });
        const day14 = await runEngine({ duration: 1440, subject: { sex: 'female', cycleDay: 14 }, includeSignals: ['estrogen'] });
        const day21 = await runEngine({ duration: 1440, subject: { sex: 'female', cycleDay: 21 }, includeSignals: ['estrogen'] });

        const mean1 = mean(day1.signals.estrogen);
        const mean7 = mean(day7.signals.estrogen);
        const mean12 = mean(day12.signals.estrogen);
        const mean14 = mean(day14.signals.estrogen);
        const mean21 = mean(day21.signals.estrogen);

        // Follicular rise
        expect(mean12).toBeGreaterThan(mean7);
        expect(mean7).toBeGreaterThan(mean1);
        // Peak around day 12-14
        expect(mean12).toBeGreaterThan(mean21);
        // Secondary luteal peak at day 21
        expect(mean21).toBeGreaterThan(mean1);
      });
    });

    describe('Progesterone Cycle', () => {
      it('should be low in follicular phase and high in luteal phase', async () => {
        const day5 = await runEngine({ duration: 1440, subject: { sex: 'female', cycleDay: 5 }, includeSignals: ['progesterone'] });
        const day14 = await runEngine({ duration: 1440, subject: { sex: 'female', cycleDay: 14 }, includeSignals: ['progesterone'] });
        const day21 = await runEngine({ duration: 1440, subject: { sex: 'female', cycleDay: 21 }, includeSignals: ['progesterone'] });
        const day28 = await runEngine({ duration: 1440, subject: { sex: 'female', cycleDay: 28 }, includeSignals: ['progesterone'] });

        const mean5 = mean(day5.signals.progesterone);
        const mean14 = mean(day14.signals.progesterone);
        const mean21 = mean(day21.signals.progesterone);
        const mean28 = mean(day28.signals.progesterone);

        // Luteal phase (day 21) should have highest progesterone
        expect(mean21).toBeGreaterThan(mean5);
        expect(mean21).toBeGreaterThan(mean14);
        // Pre-menstrual drop
        expect(mean28).toBeLessThan(mean21);
      });

      it('should peak around day 21-22', async () => {
        const day18 = await runEngine({ duration: 1440, subject: { sex: 'female', cycleDay: 18 }, includeSignals: ['progesterone'] });
        const day22 = await runEngine({ duration: 1440, subject: { sex: 'female', cycleDay: 22 }, includeSignals: ['progesterone'] });
        const day25 = await runEngine({ duration: 1440, subject: { sex: 'female', cycleDay: 25 }, includeSignals: ['progesterone'] });

        const mean18 = mean(day18.signals.progesterone);
        const mean22 = mean(day22.signals.progesterone);
        const mean25 = mean(day25.signals.progesterone);

        // Peak around day 22
        expect(mean22).toBeGreaterThan(mean18);
        expect(mean22).toBeGreaterThan(mean25);
      });
    });

    describe('LH Surge', () => {
      it('should spike sharply at day 13-14 (ovulation trigger)', async () => {
        const day10 = await runEngine({ duration: 1440, subject: { sex: 'female', cycleDay: 10 }, includeSignals: ['lh'] });
        const day13 = await runEngine({ duration: 1440, subject: { sex: 'female', cycleDay: 13 }, includeSignals: ['lh'] });
        const day14 = await runEngine({ duration: 1440, subject: { sex: 'female', cycleDay: 14 }, includeSignals: ['lh'] });
        const day16 = await runEngine({ duration: 1440, subject: { sex: 'female', cycleDay: 16 }, includeSignals: ['lh'] });

        const mean10 = mean(day10.signals.lh);
        const mean13 = mean(day13.signals.lh);
        const mean14 = mean(day14.signals.lh);
        const mean16 = mean(day16.signals.lh);

        // LH surge should be dramatic
        expect(mean13).toBeGreaterThan(mean10 * 2);
        expect(mean14).toBeGreaterThan(mean10 * 2);
        // Should drop after surge
        expect(mean16).toBeLessThan(mean14);
      });
    });

    describe('FSH Pattern', () => {
      it('should have bimodal pattern with follicular rise and ovulation surge', async () => {
        const day1 = await runEngine({ duration: 1440, subject: { sex: 'female', cycleDay: 1 }, includeSignals: ['fsh'] });
        const day3 = await runEngine({ duration: 1440, subject: { sex: 'female', cycleDay: 3 }, includeSignals: ['fsh'] });
        const day7 = await runEngine({ duration: 1440, subject: { sex: 'female', cycleDay: 7 }, includeSignals: ['fsh'] });
        const day14 = await runEngine({ duration: 1440, subject: { sex: 'female', cycleDay: 14 }, includeSignals: ['fsh'] });
        const day21 = await runEngine({ duration: 1440, subject: { sex: 'female', cycleDay: 21 }, includeSignals: ['fsh'] });

        const mean1 = mean(day1.signals.fsh);
        const mean3 = mean(day3.signals.fsh);
        const mean7 = mean(day7.signals.fsh);
        const mean14 = mean(day14.signals.fsh);
        const mean21 = mean(day21.signals.fsh);

        // Early follicular rise
        expect(mean3).toBeGreaterThan(mean7);
        // Ovulation surge
        expect(mean14).toBeGreaterThan(mean21);
      });
    });

    describe('Cycle Length Scaling', () => {
      it('shorter cycles should have earlier hormone peaks', async () => {
        const short25Day12 = await runEngine({
          duration: 1440,
          subject: { sex: 'female', cycleLength: 25, cycleDay: 11 },
          includeSignals: ['estrogen'],
        });
        const normal28Day12 = await runEngine({
          duration: 1440,
          subject: { sex: 'female', cycleLength: 28, cycleDay: 12 },
          includeSignals: ['estrogen'],
        });
        const long35Day12 = await runEngine({
          duration: 1440,
          subject: { sex: 'female', cycleLength: 35, cycleDay: 12 },
          includeSignals: ['estrogen'],
        });

        // Day 11 of 25-day cycle is at same phase as day 12 of 28-day cycle
        // (11/25 ≈ 0.44, 12/28 ≈ 0.43)
        const shortMean = mean(short25Day12.signals.estrogen);
        const normalMean = mean(normal28Day12.signals.estrogen);
        const longMean = mean(long35Day12.signals.estrogen);

        // At day 12, longer cycles should be earlier in follicular phase
        expect(shortMean).toBeGreaterThan(longMean);
      });
    });
  });

  // ============================================
  // AGE-BASED SIGNAL MODULATION TESTS
  // ============================================
  describe('Age-Based Signal Modulation', () => {
    describe('Testosterone Age Decline', () => {
      it('should decline 1% per year after age 30', async () => {
        const age30 = await runEngine({ duration: 1440, subject: { age: 30, sex: 'male' }, includeSignals: ['testosterone'] });
        const age40 = await runEngine({ duration: 1440, subject: { age: 40, sex: 'male' }, includeSignals: ['testosterone'] });
        const age50 = await runEngine({ duration: 1440, subject: { age: 50, sex: 'male' }, includeSignals: ['testosterone'] });

        const mean30 = mean(age30.signals.testosterone);
        const mean40 = mean(age40.signals.testosterone);
        const mean50 = mean(age50.signals.testosterone);

        // 10% decline per decade after 30
        expect(mean40 / mean30).toBeCloseTo(0.90, 0.05);
        expect(mean50 / mean30).toBeCloseTo(0.80, 0.05);
      });

      it('should not decline before age 30', async () => {
        const age20 = await runEngine({ duration: 1440, subject: { age: 20, sex: 'male' }, includeSignals: ['testosterone'] });
        const age25 = await runEngine({ duration: 1440, subject: { age: 25, sex: 'male' }, includeSignals: ['testosterone'] });
        const age30 = await runEngine({ duration: 1440, subject: { age: 30, sex: 'male' }, includeSignals: ['testosterone'] });

        const mean20 = mean(age20.signals.testosterone);
        const mean25 = mean(age25.signals.testosterone);
        const mean30 = mean(age30.signals.testosterone);

        // Should be approximately equal before age 30
        expect(mean20).toBeCloseTo(mean30, 20);
        expect(mean25).toBeCloseTo(mean30, 20);
      });
    });

    describe('eGFR Age Effect', () => {
      it('should have lower eGFR in older subjects (via physiology)', () => {
        // Strip bloodwork eGFR so Cockcroft-Gault is used
        const { eGFR_mL_min: _, ...metabolicNoGFR } = DEFAULT_SUBJECT.bloodwork?.metabolic ?? {};
        const bwNoGFR = { ...DEFAULT_SUBJECT.bloodwork, metabolic: metabolicNoGFR };
        const young = derivePhysiology({ ...DEFAULT_SUBJECT, age: 25, bloodwork: bwNoGFR });
        const middle = derivePhysiology({ ...DEFAULT_SUBJECT, age: 50, bloodwork: bwNoGFR });
        const old = derivePhysiology({ ...DEFAULT_SUBJECT, age: 75, bloodwork: bwNoGFR });

        expect(young.estimatedGFR).toBeGreaterThan(middle.estimatedGFR);
        expect(middle.estimatedGFR).toBeGreaterThan(old.estimatedGFR);
      });
    });
  });

  // ============================================
  // WEIGHT/HEIGHT EFFECTS ON SIGNALS
  // ============================================
  describe('Weight and Height Effects', () => {
    describe('Metabolic Capacity Effects', () => {
      it('higher BMR subjects should have higher metabolicCapacity', () => {
        // Higher BMR = higher metabolicCapacity
        const small: Subject = { ...DEFAULT_SUBJECT, weight: 55, height: 160 };
        const large: Subject = { ...DEFAULT_SUBJECT, weight: 90, height: 185 };

        const smallPhys = derivePhysiology(small);
        const largePhys = derivePhysiology(large);

        // Larger subject has higher metabolicCapacity
        expect(largePhys.metabolicCapacity).toBeGreaterThan(smallPhys.metabolicCapacity);
        expect(largePhys.bmr).toBeGreaterThan(smallPhys.bmr);
      });

      it('metabolicCapacity should scale based on BMR vs reference', () => {
        const lowBMR: Subject = { ...DEFAULT_SUBJECT, weight: 50, height: 155, age: 60 };
        const highBMR: Subject = { ...DEFAULT_SUBJECT, weight: 100, height: 190, age: 20 };

        const lowPhys = derivePhysiology(lowBMR);
        const highPhys = derivePhysiology(highBMR);

        // metabolicCapacity = BMR / 1660
        expect(lowPhys.metabolicCapacity).toBeLessThan(1.0);
        expect(highPhys.metabolicCapacity).toBeGreaterThan(1.0);

        // Verify the formula
        expect(lowPhys.metabolicCapacity).toBeCloseTo(lowPhys.bmr / 1660, 3);
        expect(highPhys.metabolicCapacity).toBeCloseTo(highPhys.bmr / 1660, 3);
      });
    });

    describe('Drug Volume of Distribution', () => {
      it('heavier subjects should have larger volume of distribution', () => {
        const light = derivePhysiology({ ...DEFAULT_SUBJECT, weight: 55 });
        const heavy = derivePhysiology({ ...DEFAULT_SUBJECT, weight: 100 });

        // TBW and LBM scale with weight
        expect(heavy.tbw).toBeGreaterThan(light.tbw);
        expect(heavy.leanBodyMass).toBeGreaterThan(light.leanBodyMass);
        // drugClearance = TBW / 42
        expect(heavy.drugClearance).toBeGreaterThan(light.drugClearance);
      });
    });
  });

  // ============================================
  // COMPREHENSIVE SUBJECT PARAMETER MATRIX
  // ============================================
  describe('Comprehensive Parameter Matrix', () => {
    it('should correctly derive all physiology for reference male', () => {
      const refMale: Subject = {
        age: 30,
        weight: 70,
        height: 175,
        sex: 'male',
        cycleLength: 28,
        lutealPhaseLength: 14,
        cycleDay: 0,
        genetics: {}, // Default empty GeneticProfile
      };
      const phys = derivePhysiology(refMale);

      expect(phys.bmr).toBeCloseTo(1648.75, 1);
      expect(phys.bmi).toBeCloseTo(22.86, 1);
      expect(phys.estimatedGFR).toBeCloseTo(106.9, 1);
      expect(phys.metabolicCapacity).toBeCloseTo(0.993, 2);
    });

    it('should correctly derive all physiology for reference female', () => {
      const refFemale: Subject = {
        age: 30,
        weight: 60,
        height: 165,
        sex: 'female',
        cycleLength: 28,
        lutealPhaseLength: 14,
        cycleDay: 14,
        genetics: {}, // Default empty GeneticProfile
      };
      const phys = derivePhysiology(refFemale);

      // Female BMR: 10*60 + 6.25*165 - 5*30 - 161 = 600 + 1031.25 - 150 - 161 = 1320.25
      expect(phys.bmr).toBeCloseTo(1320.25, 1);
      // BMI: 60 / (1.65^2) = 22.04
      expect(phys.bmi).toBeCloseTo(22.04, 1);
      // GFR: ((140-30)*60)/72 * 0.85 = 77.92
      expect(phys.estimatedGFR).toBeCloseTo(77.92, 0);
    });

    describe('Extreme Age Cases', () => {
      it('should handle young adult (age 18)', () => {
        // Strip bloodwork eGFR so Cockcroft-Gault is used
        const { eGFR_mL_min: _, ...metabolicNoGFR } = DEFAULT_SUBJECT.bloodwork?.metabolic ?? {};
        const bwNoGFR = { ...DEFAULT_SUBJECT.bloodwork, metabolic: metabolicNoGFR };
        const young: Subject = { ...DEFAULT_SUBJECT, age: 18, bloodwork: bwNoGFR };
        const phys = derivePhysiology(young);

        expect(phys.bmr).toBeGreaterThan(0);
        expect(phys.estimatedGFR).toBeGreaterThan(100);
      });

      it('should handle elderly (age 80)', () => {
        // Strip bloodwork eGFR so Cockcroft-Gault is used
        const { eGFR_mL_min: _, ...metabolicNoGFR } = DEFAULT_SUBJECT.bloodwork?.metabolic ?? {};
        const bwNoGFR = { ...DEFAULT_SUBJECT.bloodwork, metabolic: metabolicNoGFR };
        const elderly: Subject = { ...DEFAULT_SUBJECT, age: 80, bloodwork: bwNoGFR };
        const phys = derivePhysiology(elderly);

        expect(phys.bmr).toBeGreaterThan(0);
        expect(phys.estimatedGFR).toBeGreaterThan(0);
        expect(phys.estimatedGFR).toBeLessThan(100);
      });
    });

    describe('Extreme Weight Cases', () => {
      it('should handle underweight (BMI < 18.5)', () => {
        const underweight: Subject = { ...DEFAULT_SUBJECT, weight: 50, height: 175 };
        const phys = derivePhysiology(underweight);

        expect(phys.bmi).toBeLessThan(18.5);
        expect(phys.bmr).toBeGreaterThan(0);
        expect(phys.tbw).toBeGreaterThan(0);
      });

      it('should handle obese (BMI > 35)', () => {
        const obese: Subject = { ...DEFAULT_SUBJECT, weight: 120, height: 175 };
        const phys = derivePhysiology(obese);

        expect(phys.bmi).toBeGreaterThan(35);
        expect(phys.bmr).toBeGreaterThan(0);
        expect(phys.metabolicCapacity).toBeGreaterThan(1.0);
      });
    });
  });
});
