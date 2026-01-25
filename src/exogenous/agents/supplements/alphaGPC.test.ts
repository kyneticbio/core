import { describe, expect, it } from 'vitest';
import { AlphaGPC } from './alphaGPC';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: Alpha-GPC', () => {
  it('should be correctly defined', () => {
    const def = AlphaGPC(300);
    expect(def.molecule.name).toBe('Alpha-GPC');
    expect(def.pk.massMg).toBe(300);
  });

  it('should have high bioavailability', () => {
    const def = AlphaGPC(300);
    expect(def.pk.bioavailability).toBe(0.88);
  });

  it('should boost acetylcholine', () => {
    const def = AlphaGPC(300);
    const achEffect = def.pd.find(p => p.target === 'acetylcholine');
    expect(achEffect).toBeDefined();
    expect(achEffect?.mechanism).toBe('agonist');
  });

  it('should potentiate growth hormone', () => {
    const def = AlphaGPC(300);
    const ghEffect = def.pd.find(p => p.target === 'growthHormone');
    expect(ghEffect).toBeDefined();
    expect(ghEffect?.mechanism).toBe('agonist');
  });

  it('should support vagal tone', () => {
    const def = AlphaGPC(300);
    const vagalEffect = def.pd.find(p => p.target === 'vagal');
    expect(vagalEffect).toBeDefined();
    expect(vagalEffect?.mechanism).toBe('agonist');
  });

  it('should modestly boost orexin (alertness)', () => {
    const def = AlphaGPC(300);
    const orexinEffect = def.pd.find(p => p.target === 'orexin');
    expect(orexinEffect).toBeDefined();
    expect(orexinEffect?.mechanism).toBe('agonist');
  });

  it('should scale effects with dose', () => {
    const low = AlphaGPC(150);
    const high = AlphaGPC(600);

    const lowAch = low.pd.find(p => p.target === 'acetylcholine')?.intrinsicEfficacy ?? 0;
    const highAch = high.pd.find(p => p.target === 'acetylcholine')?.intrinsicEfficacy ?? 0;

    expect(highAch).toBeGreaterThan(lowAch);
  });

  it('should have capped effects at high doses', () => {
    const standard = AlphaGPC(600);
    const mega = AlphaGPC(2000);

    const standardAch = standard.pd.find(p => p.target === 'acetylcholine')?.intrinsicEfficacy ?? 0;
    const megaAch = mega.pd.find(p => p.target === 'acetylcholine')?.intrinsicEfficacy ?? 0;

    // Both should cap at 25
    expect(standardAch).toBe(24); // 600 * 0.04 = 24
    expect(megaAch).toBe(25); // capped at 25
  });

  describe('Integration tests', () => {
    it('should boost acetylcholine', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('alphaGPC', { mg: 300 }, 480)
        .expect('acetylcholine').toRise()
        .run();
    });

    it('should boost growth hormone', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('alphaGPC', { mg: 600 }, 480)
        .expect('growthHormone').toRise()
        .run();
    });

    it('should support vagal tone', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('alphaGPC', { mg: 600 }, 480)
        .expect('vagal').toRise()
        .run();
    });

    it('should boost orexin (alertness)', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('alphaGPC', { mg: 600 }, 480)
        .expect('orexin').toRise()
        .run();
    });
  });
});
