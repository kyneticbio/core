import { describe, it } from 'vitest';
import { ScenarioBuilder } from '../../utils/test/scenario-builder';

describe('Physiological Monitors', () => {
  describe('Metabolic Monitors', () => {
    it('should trigger glucose_rapid_rise on high-GI meal', async () => {
      await ScenarioBuilder.with()
        .taking('food', { 
          carbSugar: 100, 
          glycemicIndex: 95,
          waterMl: 400 
        }, 480)
        .duration(720)
        .expect('glucose')
          .toTriggerMonitor('glucose_rapid_rise')
        .run();
    });

    it('should trigger glucose_stability on a steady day', async () => {
      // No interventions, should remain stable
      await ScenarioBuilder.with()
        .duration(1440)
        .expect('glucose')
          .toTriggerMonitor('glucose_stability')
        .run();
    });

    it('should NOT trigger glucose_rapid_rise on a low-GI meal', async () => {
      await ScenarioBuilder.with()
        .taking('food', { 
          carbSugar: 10, 
          carbStarch: 20,
          fiber: 15,
          fat: 20,
          glycemicIndex: 30 
        }, 480)
        .duration(720)
        .expect('glucose')
          .toNotTriggerMonitor('glucose_rapid_rise')
        .run();
    });
  });

  describe('Alcohol Monitors', () => {
    it('should trigger ethanol_intoxication and acetaldehyde_toxicity', async () => {
      await ScenarioBuilder.with()
        .taking('alcohol', { units: 5 }, 480)
        .duration(1440)
        .expect('ethanol')
          .toTriggerMonitor('ethanol_intoxication')
        .expect('acetaldehyde')
          .toTriggerMonitor('acetaldehyde_toxicity')
        .run();
    });

    it('should trigger ethanol_danger on very high intake', async () => {
      await ScenarioBuilder.with()
        .taking('alcohol', { units: 15 }, 480)
        .duration(1440)
        .expect('ethanol')
          .toTriggerMonitor('ethanol_danger')
        .run();
    });

    it('should NOT trigger intoxication on a single unit', async () => {
      await ScenarioBuilder.with()
        .taking('alcohol', { units: 1 }, 480)
        .duration(720)
        .expect('ethanol')
          .toNotTriggerMonitor('ethanol_intoxication')
        .run();
    });
  });

  describe('Hormonal Monitors', () => {
    it('should trigger lh_surge around ovulation', async () => {
      await ScenarioBuilder.with({
        sex: 'female',
        cycleDay: 12,
        cycleLength: 28
      })
        .duration(2880) // 2 days
        .expect('lh')
          .toTriggerMonitor('lh_surge')
        .run();
    });

    it('should NOT trigger lh_surge during follicular phase', async () => {
      await ScenarioBuilder.with({
        sex: 'female',
        cycleDay: 5,
        cycleLength: 28
      })
        .duration(1440)
        .expect('lh')
          .toNotTriggerMonitor('lh_surge')
        .run();
    });
  });

  describe('Vital Signs & Stress', () => {
    it('should trigger adrenaline_fight_or_flight during intense activity', async () => {
      await ScenarioBuilder.with()
        .performing('exercise_hiit', 60, 2.0, 480)
        .duration(720)
        .expect('adrenaline')
          .toTriggerMonitor('adrenaline_fight_or_flight')
        .run();
    });

    it('should trigger sensory_overload during intense activity', async () => {
      await ScenarioBuilder.with()
        .performing('exercise_hiit', 60, 2.0, 480)
        .duration(720)
        .expect('sensoryLoad')
          .toTriggerMonitor('sensory_overload')
        .run();
    });

    it('should NOT trigger sensory_overload during meditation', async () => {
      await ScenarioBuilder.with()
        .taking('meditation', {}, 480)
        .duration(720)
        .expect('sensoryLoad')
          .toNotTriggerMonitor('sensory_overload')
        .run();
    });
  });

  describe('Circadian Monitors', () => {
    it('should trigger melatonin_dim_light_onset in the evening', async () => {
      await ScenarioBuilder.with()
        .duration(1440)
        .expect('melatonin')
          .toTriggerMonitor('melatonin_dim_light_onset')
        .run();
    });
  });
});
