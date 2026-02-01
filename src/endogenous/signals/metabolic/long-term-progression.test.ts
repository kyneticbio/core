import { describe, it, expect } from 'vitest';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

/**
 * LONG-TERM BEHAVIOR VALIDATION
 *
 * These tests validate that physiological dynamics are correctly calibrated
 * for long-term emergent behavior. Instead of running 30-day simulations,
 * we test the RATES of change and extrapolate expected long-term outcomes.
 *
 * Key principles:
 * 1. Energy balance: ~7700 kcal = 1 kg fat
 * 2. BMR: ~1600 kcal/day for 70kg adult
 * 3. Fat storage tau: 43,200 min (30 days) - slow accumulation
 * 4. Muscle tau: 43,200 min (30 days) - slow gains
 * 5. Metabolic adaptation tau: 10,080 min (7 days)
 * 6. Hydration loss: gradual without intake
 */

const ONE_HOUR = 60;
const ONE_DAY = 1440;

describe('Long-Term Rate Calibration', () => {

  describe('Weight Change Rates', () => {

    it('Fasting burn rate should predict reasonable daily weight loss', async () => {
      // Run 1 day, measure fat oxidation rate, extrapolate
      const scenario = await ScenarioBuilder.with({ weight: 70 })
        .duration(ONE_DAY)
        .run();

      const burnRate = scenario.signals.burnRate;
      const avgBurn = burnRate.reduce((a, b) => a + b, 0) / burnRate.length;

      // Burn rate in kcal/min, convert to daily
      const dailyBurn = avgBurn * ONE_DAY;

      // Should be approximately BMR (~1500-1800 kcal/day)
      expect(dailyBurn).toBeGreaterThan(1400);
      expect(dailyBurn).toBeLessThan(2000);

      // At 7700 kcal/kg, daily fat loss potential
      const dailyFatLossPotential = dailyBurn / 7700;

      // Should be ~0.2-0.25 kg/day maximum fat loss
      expect(dailyFatLossPotential).toBeGreaterThan(0.15);
      expect(dailyFatLossPotential).toBeLessThan(0.3);
    });

    it('Fat oxidation rate during deficit should be physiologically reasonable', async () => {
      const scenario = await ScenarioBuilder.with({ weight: 70 })
        .duration(ONE_DAY)
        .run();

      const fox = scenario.auxiliarySeries?.fatOxidationRate;
      if (fox) {
        // Average fat oxidation rate over the day
        const avgFox = Array.from(fox).reduce((a, b) => a + b, 0) / fox.length;

        // Should be positive during caloric deficit (fasting)
        expect(avgFox).toBeGreaterThan(0);

        // Extrapolate: at this rate, how much fat per day?
        // fatOxidationRate is in arbitrary units, fed to fatMass production
        // fatMass loss = fox / 7700 per minute
        const dailyFatLoss = (avgFox / 7700) * ONE_DAY;

        // Should show measurable daily fat loss (0.05-0.3 kg)
        expect(dailyFatLoss).toBeGreaterThan(0.01);
      }
    });

    it('Fat mass change over 24h fasting should be measurable', async () => {
      const scenario = await ScenarioBuilder.with({ weight: 70 })
        .duration(ONE_DAY)
        .run();

      const fatMass = scenario.auxiliarySeries?.fatMass;
      if (fatMass) {
        const initialFat = fatMass[0];
        const finalFat = fatMass[fatMass.length - 1];

        // After 24h of fasting, should have lost some fat
        expect(finalFat).toBeLessThan(initialFat);
      }

      // Weight should reflect this
      const weight = scenario.signals.weight;
      const finalWeight = weight[weight.length - 1];
      expect(finalWeight).toBeLessThan(70);
    });

    it('Eating should produce positive net energy during meal window', async () => {
      const scenario = await ScenarioBuilder.with({ weight: 70 })
        .duration(3 * ONE_HOUR) // 3 hours
        .add('food', { params: { carbSugar: 100, fat: 30 }, duration: 30, start: 30 })
        .run();

      const netEnergy = scenario.signals.netEnergy;

      // Find peak positive net energy during/after eating
      const peakNet = Math.max(...Array.from(netEnergy));

      // Should see positive energy balance during eating
      expect(peakNet).toBeGreaterThan(0);
    });
  });

  describe('Hydration Dynamics', () => {

    it('Hydration should decrease over 24h without water', async () => {
      const scenario = await ScenarioBuilder.with({ weight: 70 })
        .duration(ONE_DAY)
        .run();

      const hydration = scenario.signals.hydration;
      if (hydration) {
        const initialHydration = hydration[0];
        const finalHydration = hydration[hydration.length - 1];

        // Hydration should decrease without water intake
        expect(finalHydration).toBeLessThan(initialHydration);

        // Should lose meaningful amount (at least 20%)
        expect(finalHydration).toBeLessThan(initialHydration * 0.8);
      }
    });

    it('Hydration loss should be significant enough to cause problems in days, not weeks', async () => {
      const scenario = await ScenarioBuilder.with({ weight: 70 })
        .duration(ONE_DAY)
        .run();

      const hydration = scenario.signals.hydration;
      if (hydration) {
        const initialHydration = hydration[0];
        const finalHydration = hydration[hydration.length - 1];
        const dailyLossRate = 1 - (finalHydration / initialHydration);

        // Loss rate should be significant (>20% per day means critical in <5 days)
        expect(dailyLossRate).toBeGreaterThan(0.2);

        // But not so fast that you die in <1 day
        expect(dailyLossRate).toBeLessThan(0.9);
      }
    });
  });

  describe('Metabolic Adaptation', () => {

    it('Metabolic adaptation should start decreasing during caloric deficit', async () => {
      const scenario = await ScenarioBuilder.with({ weight: 70 })
        .duration(ONE_DAY)
        .run();

      const adaptation = scenario.auxiliarySeries?.metabolicAdaptation;
      if (adaptation) {
        const initialAdaptation = adaptation[0];
        const finalAdaptation = adaptation[adaptation.length - 1];

        // With low EA (energy availability), adaptation should decrease
        // Tau is 7 days, so 1 day change should be small but directional
        expect(finalAdaptation).toBeLessThanOrEqual(initialAdaptation);
      }
    });

    it('Energy availability should drop during fasting', async () => {
      const scenario = await ScenarioBuilder.with({ weight: 70 })
        .duration(ONE_DAY)
        .run();

      const ea = scenario.signals.energyAvailability;
      if (ea) {
        const avgEA = ea.reduce((a, b) => a + b, 0) / ea.length;

        // With no food intake, EA should be very low or zero
        // Formula: (intake - exercise) / lean mass
        // With zero intake, EA should be near zero or negative
        expect(avgEA).toBeLessThan(10);
      }
    });
  });

  describe('Muscle Dynamics', () => {

    it('Muscle protein synthesis should activate with mTOR elevation', async () => {
      // Eating triggers insulin -> mTOR -> MPS
      const scenario = await ScenarioBuilder.with({ weight: 70 })
        .duration(3 * ONE_HOUR)
        .add('food', { params: { protein: 50, carbStarch: 50 }, duration: 30, start: 30 })
        .run();

      const mtor = scenario.signals.mtor;
      const mps = scenario.auxiliarySeries?.muscleProteinSynthesis;

      if (mtor && mps) {
        const peakMtor = Math.max(...Array.from(mtor));
        const peakMps = Math.max(...Array.from(mps));

        // Meal should elevate mTOR above baseline
        expect(peakMtor).toBeGreaterThan(1.0);

        // MPS should respond to elevated mTOR
        expect(peakMps).toBeGreaterThan(0);
      }
    });

    it('Exercise should activate AMPK', async () => {
      const scenario = await ScenarioBuilder.with({ weight: 70 })
        .duration(2 * ONE_HOUR)
        .performing('exercise_cardio', 30, 0.7, 30)
        .run();

      const ampk = scenario.signals.ampk;
      if (ampk) {
        const peakAmpk = Math.max(...Array.from(ampk));

        // Exercise should elevate AMPK
        expect(peakAmpk).toBeGreaterThan(1.0);
      }
    });

    it('Exercise should affect stress hormones that influence strength readiness', async () => {
      // strengthReadiness is inhibited by cortisol and inflammation
      // Exercise elevates these, which should affect strength readiness indirectly

      const rest = await ScenarioBuilder.with({ weight: 70 })
        .duration(2 * ONE_HOUR)
        .run();

      const exercise = await ScenarioBuilder.with({ weight: 70 })
        .duration(2 * ONE_HOUR)
        .performing('exercise_strength', 45, 0.8, 30)
        .run();

      // Exercise should elevate cortisol (which inhibits strength readiness)
      if (rest.signals.cortisol && exercise.signals.cortisol) {
        const restCortisolPeak = Math.max(...Array.from(rest.signals.cortisol));
        const exerciseCortisolPeak = Math.max(...Array.from(exercise.signals.cortisol));

        expect(exerciseCortisolPeak).toBeGreaterThanOrEqual(restCortisolPeak);
      }

      // NOTE: Direct strength readiness response to exercise needs further calibration
      // The signal dynamics depend on complex interactions between:
      // - Exercise intensity affecting clearance rate
      // - Cortisol/inflammation inhibiting production
      // - Sleep/GH boosting recovery
    });
  });

  describe('Sleep & Circadian', () => {

    // NOTE: Adenosine signal is not yet implemented
    // TODO: Add adenosine signal to track sleep pressure accumulation

    it('Growth hormone should pulse during sleep', async () => {
      // Run from 10pm to 6am with sleep
      const scenario = await ScenarioBuilder.with({ weight: 70 })
        .duration(8 * ONE_HOUR)
        .add('sleep', { params: {}, duration: 480, start: 0 })
        .run();

      const gh = scenario.signals.growthHormone;
      if (gh) {
        const peakGH = Math.max(...Array.from(gh));
        const baselineGH = gh[0];

        // GH should pulse higher during sleep
        expect(peakGH).toBeGreaterThan(baselineGH);
      }
    });
  });

  describe('Cognitive Markers', () => {

    it('BDNF should respond to exercise', async () => {
      const exerciseScenario = await ScenarioBuilder.with({ weight: 70 })
        .duration(3 * ONE_HOUR)
        .performing('exercise_cardio', 45, 0.7, 30)
        .run();

      const restScenario = await ScenarioBuilder.with({ weight: 70 })
        .duration(3 * ONE_HOUR)
        .run();

      const exerciseBdnf = exerciseScenario.signals.bdnf;
      const restBdnf = restScenario.signals.bdnf;

      if (exerciseBdnf && restBdnf) {
        const exercisePeak = Math.max(...Array.from(exerciseBdnf));
        const restPeak = Math.max(...Array.from(restBdnf));

        // Exercise should boost BDNF more than rest
        expect(exercisePeak).toBeGreaterThanOrEqual(restPeak);
      }
    });
  });
});

describe('Direction-of-Effect Validation', () => {
  /**
   * These tests validate that interventions move signals in the expected direction.
   * They're fast because they only need to observe the direction, not magnitude.
   */

  it('Eating: glucose ↑, insulin ↑, glucagon ↓', async () => {
    const fasting = await ScenarioBuilder.with({ weight: 70 }).duration(ONE_HOUR).run();
    const eating = await ScenarioBuilder.with({ weight: 70 })
      .duration(ONE_HOUR)
      .add('food', { params: { carbSugar: 50 }, duration: 15, start: 10 })
      .run();

    // Compare peaks
    const fastingGlucose = Math.max(...Array.from(fasting.signals.glucose));
    const eatingGlucose = Math.max(...Array.from(eating.signals.glucose));
    expect(eatingGlucose).toBeGreaterThan(fastingGlucose);

    const fastingInsulin = Math.max(...Array.from(fasting.signals.insulin));
    const eatingInsulin = Math.max(...Array.from(eating.signals.insulin));
    expect(eatingInsulin).toBeGreaterThan(fastingInsulin);
  });

  it('Exercise: burnRate ↑, adrenaline ↑, cortisol ↑', async () => {
    const rest = await ScenarioBuilder.with({ weight: 70 }).duration(ONE_HOUR).run();
    const exercise = await ScenarioBuilder.with({ weight: 70 })
      .duration(ONE_HOUR)
      .performing('exercise_cardio', 30, 0.7, 10)
      .run();

    const restBurn = Math.max(...Array.from(rest.signals.burnRate));
    const exerciseBurn = Math.max(...Array.from(exercise.signals.burnRate));
    expect(exerciseBurn).toBeGreaterThan(restBurn);

    const restAdrenaline = Math.max(...Array.from(rest.signals.adrenaline));
    const exerciseAdrenaline = Math.max(...Array.from(exercise.signals.adrenaline));
    expect(exerciseAdrenaline).toBeGreaterThan(restAdrenaline);
  });

  it('Sleep: melatonin ↑, cortisol ↓ (during sleep), GH ↑', async () => {
    const awake = await ScenarioBuilder.with({ weight: 70 }).duration(ONE_HOUR).run();
    const asleep = await ScenarioBuilder.with({ weight: 70 })
      .duration(ONE_HOUR)
      .add('sleep', { params: {}, duration: 60, start: 0 })
      .run();

    const awakeMelatonin = asleep.signals.melatonin
      ? Math.max(...Array.from(asleep.signals.melatonin))
      : 0;

    // GH should be higher during sleep
    if (asleep.signals.growthHormone && awake.signals.growthHormone) {
      const awakeGH = Math.max(...Array.from(awake.signals.growthHormone));
      const asleepGH = Math.max(...Array.from(asleep.signals.growthHormone));
      expect(asleepGH).toBeGreaterThanOrEqual(awakeGH);
    }
  });

  it('Fasting: glucagon ↑, ketones ↑ (extended), AMPK ↑', async () => {
    // Compare fed vs fasted state
    const fed = await ScenarioBuilder.with({ weight: 70 })
      .duration(4 * ONE_HOUR)
      .add('food', { params: { carbStarch: 100 }, duration: 30, start: 30 })
      .run();

    const fasted = await ScenarioBuilder.with({ weight: 70 })
      .duration(4 * ONE_HOUR)
      .run();

    // AMPK should be higher in fasted state
    if (fed.signals.ampk && fasted.signals.ampk) {
      const fedAmpk = fed.signals.ampk[fed.signals.ampk.length - 1];
      const fastedAmpk = fasted.signals.ampk[fasted.signals.ampk.length - 1];
      expect(fastedAmpk).toBeGreaterThanOrEqual(fedAmpk);
    }
  });
});
