import { describe, expect, it } from 'vitest';
import { mthfr } from './mthfr';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';
import { signalStats } from '../../../utils/test/utils';

describe('Condition: MTHFR', () => {
  describe('Definition', () => {
    it('is correctly defined', () => {
      expect(mthfr.key).toBe('mthfr');
      expect(mthfr.category).toBe('genetic');
      expect(mthfr.enzymeModifiers?.length).toBeGreaterThan(0);
    });

    it('has valid genotype options', () => {
      const param = mthfr.params.find(p => p.key === 'genotype');
      expect(param).toBeDefined();
      expect(param?.type).toBe('select');
      expect(param?.options?.length).toBe(3);

      const values = param?.options?.map(o => o.value) ?? [];
      expect(values).toContain(0.0);   // CC (Normal) - no effect
      expect(values).toContain(0.50);  // CT (Heterozygous) - partial effect
      expect(values).toContain(1.0);   // TT (Homozygous) - full effect
    });

    it('has signal modifiers for serotonin and dopamine', () => {
      expect(mthfr.signalModifiers?.length).toBeGreaterThan(0);

      const signals = mthfr.signalModifiers?.map(m => m.key) ?? [];
      expect(signals).toContain('serotonin');
      expect(signals).toContain('dopamine');
    });
  });

  describe('Signal Effects - Serotonin', () => {
    it('TT (homozygous) should result in lower serotonin than CC', async () => {
      // TT = 1.0 (full effect) = impaired BH4 regeneration = lower serotonin synthesis
      const tt = await ScenarioBuilder.with()
        .condition('mthfr', { genotype: 1.0 })
        .duration(120)
        .run();

      const cc = await ScenarioBuilder.with()
        .condition('mthfr', { genotype: 0.0 })
        .duration(120)
        .run();

      const ttStats = signalStats(tt.signals['serotonin'], tt.gridMins);
      const ccStats = signalStats(cc.signals['serotonin'], cc.gridMins);

      expect(ttStats.mean).toBeLessThan(ccStats.mean);
    });

    it('CT (heterozygous) should have serotonin between CC and TT', async () => {
      const tt = await ScenarioBuilder.with()
        .condition('mthfr', { genotype: 1.0 })
        .duration(120)
        .run();

      const ct = await ScenarioBuilder.with()
        .condition('mthfr', { genotype: 0.50 })
        .duration(120)
        .run();

      const cc = await ScenarioBuilder.with()
        .condition('mthfr', { genotype: 0.0 })
        .duration(120)
        .run();

      const ttStats = signalStats(tt.signals['serotonin'], tt.gridMins);
      const ctStats = signalStats(ct.signals['serotonin'], ct.gridMins);
      const ccStats = signalStats(cc.signals['serotonin'], cc.gridMins);

      expect(ctStats.mean).toBeGreaterThan(ttStats.mean);
      expect(ctStats.mean).toBeLessThan(ccStats.mean);
    });
  });

  describe('Signal Effects - Dopamine', () => {
    it('TT (homozygous) should result in lower dopamine than CC', async () => {
      // TT = 1.0 (full effect) = impaired BH4 regeneration = lower dopamine synthesis
      const tt = await ScenarioBuilder.with()
        .condition('mthfr', { genotype: 1.0 })
        .duration(120)
        .run();

      const cc = await ScenarioBuilder.with()
        .condition('mthfr', { genotype: 0.0 })
        .duration(120)
        .run();

      const ttStats = signalStats(tt.signals['dopamine'], tt.gridMins);
      const ccStats = signalStats(cc.signals['dopamine'], cc.gridMins);

      expect(ttStats.mean).toBeLessThan(ccStats.mean);
    });

    it('CT (heterozygous) should have dopamine between CC and TT', async () => {
      const tt = await ScenarioBuilder.with()
        .condition('mthfr', { genotype: 1.0 })
        .duration(120)
        .run();

      const ct = await ScenarioBuilder.with()
        .condition('mthfr', { genotype: 0.50 })
        .duration(120)
        .run();

      const cc = await ScenarioBuilder.with()
        .condition('mthfr', { genotype: 0.0 })
        .duration(120)
        .run();

      const ttStats = signalStats(tt.signals['dopamine'], tt.gridMins);
      const ctStats = signalStats(ct.signals['dopamine'], ct.gridMins);
      const ccStats = signalStats(cc.signals['dopamine'], cc.gridMins);

      expect(ctStats.mean).toBeGreaterThan(ttStats.mean);
      expect(ctStats.mean).toBeLessThan(ccStats.mean);
    });
  });
});
