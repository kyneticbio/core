import { describe, expect, it } from 'vitest';
import { comt } from './comt';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';
import { signalStats } from '../../../utils/test/utils';

describe('Condition: COMT', () => {
  describe('Definition', () => {
    it('is correctly defined', () => {
      expect(comt.key).toBe('comt');
      expect(comt.category).toBe('genetic');
      expect(comt.enzymeModifiers?.length).toBeGreaterThan(0);
    });

    it('has valid genotype options', () => {
      const param = comt.params.find(p => p.key === 'genotype');
      expect(param).toBeDefined();
      expect(param?.type).toBe('select');
      expect(param?.options?.length).toBe(3);

      const values = param?.options?.map(o => o.value) ?? [];
      expect(values).toContain(0.4); // Val/Val (Fast) - +40% activity
      expect(values).toContain(0.0); // Val/Met (Intermediate) - baseline
      expect(values).toContain(-0.4); // Met/Met (Slow) - -40% activity
    });
  });

  describe('Signal Effects', () => {
    it('Met/Met (slow COMT) should result in higher dopamine', async () => {
      // Met/Met = -0.4 activity = slower dopamine clearance = higher levels
      await ScenarioBuilder.with()
        .condition('comt', { genotype: -0.4 })
        .duration(120)
        .expect('dopamine').toStayAbove(0.9)
        .run();
    });

    it('Val/Val (fast COMT) should result in lower dopamine than Met/Met', async () => {
      // Compare Val/Val vs Met/Met
      const metMet = await ScenarioBuilder.with()
        .condition('comt', { genotype: -0.4 })
        .duration(120)
        .run();

      const valVal = await ScenarioBuilder.with()
        .condition('comt', { genotype: 0.4 })
        .duration(120)
        .run();

      const metMetStats = signalStats(metMet.signals['dopamine'], metMet.gridMins);
      const valValStats = signalStats(valVal.signals['dopamine'], valVal.gridMins);

      expect(valValStats.mean).toBeLessThan(metMetStats.mean);
    });

    it('Val/Met (intermediate) should have dopamine between Val/Val and Met/Met', async () => {
      const metMet = await ScenarioBuilder.with()
        .condition('comt', { genotype: -0.4 })
        .duration(120)
        .run();

      const valMet = await ScenarioBuilder.with()
        .condition('comt', { genotype: 0.0 })
        .duration(120)
        .run();

      const valVal = await ScenarioBuilder.with()
        .condition('comt', { genotype: 0.4 })
        .duration(120)
        .run();

      const metMetStats = signalStats(metMet.signals['dopamine'], metMet.gridMins);
      const valMetStats = signalStats(valMet.signals['dopamine'], valMet.gridMins);
      const valValStats = signalStats(valVal.signals['dopamine'], valVal.gridMins);

      expect(valMetStats.mean).toBeLessThan(metMetStats.mean);
      expect(valMetStats.mean).toBeGreaterThan(valValStats.mean);
    });
  });
});
