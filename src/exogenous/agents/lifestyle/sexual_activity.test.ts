import { describe, expect, it } from 'vitest';
import { SexualActivity } from './sexual_activity';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: Sexual Activity', () => {
  describe('PD Target Coverage', () => {
    it('should define all expected PD targets', () => {
      const def = SexualActivity('partnered', true);
      const targets = def.pd.map(p => p.target);

      expect(targets).toContain('dopamine');
      expect(targets).toContain('oxytocin');
      expect(targets).toContain('prolactin');
      expect(targets).toContain('testosterone');
      expect(targets).toContain('cortisol');
      expect(targets).toContain('endorphin');
      expect(targets).toHaveLength(6);
    });

    it('dopamine should be an agonist', () => {
      const def = SexualActivity('partnered', true);
      const effect = def.pd.find(p => p.target === 'dopamine');
      expect(effect?.mechanism).toBe('agonist');
    });

    it('oxytocin should be an agonist', () => {
      const def = SexualActivity('partnered', true);
      const effect = def.pd.find(p => p.target === 'oxytocin');
      expect(effect?.mechanism).toBe('agonist');
    });

    it('prolactin should be an agonist', () => {
      const def = SexualActivity('partnered', true);
      const effect = def.pd.find(p => p.target === 'prolactin');
      expect(effect?.mechanism).toBe('agonist');
    });

    it('testosterone should be an agonist', () => {
      const def = SexualActivity('partnered', true);
      const effect = def.pd.find(p => p.target === 'testosterone');
      expect(effect?.mechanism).toBe('agonist');
    });

    it('cortisol should be an antagonist', () => {
      const def = SexualActivity('partnered', true);
      const effect = def.pd.find(p => p.target === 'cortisol');
      expect(effect?.mechanism).toBe('antagonist');
    });

    it('endorphin should be an agonist', () => {
      const def = SexualActivity('partnered', true);
      const effect = def.pd.find(p => p.target === 'endorphin');
      expect(effect?.mechanism).toBe('agonist');
    });
  });

  describe('Partnered vs Solo scaling', () => {
    it('partnered should have higher dopamine than solo', () => {
      const partnered = SexualActivity('partnered', true);
      const solo = SexualActivity('solo', true);

      const partneredDopamine = partnered.pd.find(p => p.target === 'dopamine')?.intrinsicEfficacy ?? 0;
      const soloDopamine = solo.pd.find(p => p.target === 'dopamine')?.intrinsicEfficacy ?? 0;

      expect(partneredDopamine).toBeGreaterThan(soloDopamine);
    });

    it('partnered should have much higher oxytocin than solo', () => {
      const partnered = SexualActivity('partnered', true);
      const solo = SexualActivity('solo', true);

      const partneredOxytocin = partnered.pd.find(p => p.target === 'oxytocin')?.intrinsicEfficacy ?? 0;
      const soloOxytocin = solo.pd.find(p => p.target === 'oxytocin')?.intrinsicEfficacy ?? 0;

      expect(partneredOxytocin).toBeGreaterThan(soloOxytocin);
    });

    it('partnered should have higher testosterone than solo', () => {
      const partnered = SexualActivity('partnered', true);
      const solo = SexualActivity('solo', true);

      const partneredTest = partnered.pd.find(p => p.target === 'testosterone')?.intrinsicEfficacy ?? 0;
      const soloTest = solo.pd.find(p => p.target === 'testosterone')?.intrinsicEfficacy ?? 0;

      expect(partneredTest).toBeGreaterThan(soloTest);
    });
  });

  describe('Orgasm vs no orgasm scaling', () => {
    it('orgasm should have higher prolactin than no orgasm', () => {
      const withOrgasm = SexualActivity('partnered', true);
      const withoutOrgasm = SexualActivity('partnered', false);

      const withProlactin = withOrgasm.pd.find(p => p.target === 'prolactin')?.intrinsicEfficacy ?? 0;
      const withoutProlactin = withoutOrgasm.pd.find(p => p.target === 'prolactin')?.intrinsicEfficacy ?? 0;

      expect(withProlactin).toBeGreaterThan(withoutProlactin);
    });

    it('orgasm should have higher endorphin than no orgasm', () => {
      const withOrgasm = SexualActivity('partnered', true);
      const withoutOrgasm = SexualActivity('partnered', false);

      const withEndorphin = withOrgasm.pd.find(p => p.target === 'endorphin')?.intrinsicEfficacy ?? 0;
      const withoutEndorphin = withoutOrgasm.pd.find(p => p.target === 'endorphin')?.intrinsicEfficacy ?? 0;

      expect(withEndorphin).toBeGreaterThan(withoutEndorphin);
    });

    it('orgasm should have stronger cortisol suppression', () => {
      const withOrgasm = SexualActivity('partnered', true);
      const withoutOrgasm = SexualActivity('partnered', false);

      const withCortisol = withOrgasm.pd.find(p => p.target === 'cortisol')?.intrinsicEfficacy ?? 0;
      const withoutCortisol = withoutOrgasm.pd.find(p => p.target === 'cortisol')?.intrinsicEfficacy ?? 0;

      expect(withCortisol).toBeGreaterThan(withoutCortisol);
    });
  });

  describe('Integration tests', () => {
    it('partnered with orgasm: should boost all reward signals', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('sexual_activity', { type: 'partnered', orgasm: 'yes' }, 480)
        .expect('dopamine').toRise()
        .expect('oxytocin').toRise()
        .expect('prolactin').toRise()
        .expect('endorphin').toRise()
        .run();
    });

    it('partnered with orgasm: should reduce cortisol', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('sexual_activity', { type: 'partnered', orgasm: 'yes' }, 480)
        .expect('cortisol').toFall()
        .run();
    });

    it('solo activity: should boost dopamine', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('sexual_activity', { type: 'solo', orgasm: 'yes' }, 480)
        .expect('dopamine').toRise()
        .run();
    });

    it('partnered with orgasm: should boost testosterone', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('sexual_activity', { type: 'partnered', orgasm: 'yes' }, 480)
        .expect('testosterone').toRise()
        .run();
    });
  });
});
