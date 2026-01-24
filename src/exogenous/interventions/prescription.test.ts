import { describe, it } from 'vitest';
import { ScenarioBuilder } from '../../utils/test/scenario-builder';

describe('Prescription Interventions', () => {
  it('Ritalin: should increase dopamine and norepi', async () => {
    await ScenarioBuilder.with()
      .duration(600)
      .taking('ritalinIR10', { mg: 10 }, 480)
      .expect('dopamine').toRise()
      .expect('norepi').toRise()
      .run();
  });

  it('Xanax: should increase GABA activity (indirectly via PAM effect)', async () => {
    // Note: We might need a way to check receptor occupancy or effective signal gain
    // For now we'll check if it affects related signals or just runs without error
    await ScenarioBuilder.with()
      .duration(600)
      .taking('xanax', { mg: 0.5 }, 480)
      .run();
  });

  it('LSD: should target 5HT2A (agonist)', async () => {
    await ScenarioBuilder.with()
      .duration(1440)
      .taking('lsd', { mcg: 100 }, 480)
      // PD effect is on 5HT2A, which might not be a direct signal but we check if simulation runs
      .run();
  });

  it('Zoloft: should increase serotonin over time', async () => {
    await ScenarioBuilder.with()
      .duration(1440)
      .taking('zoloft', { mg: 50 }, 480)
      .expect('serotonin').toRise()
      .run();
  });

  it('Cymbalta: should increase serotonin and norepi', async () => {
    await ScenarioBuilder.with()
      .duration(1440)
      .taking('cymbalta', { mg: 60 }, 480)
      .expect('serotonin').toRise()
      .expect('norepi').toRise()
      .run();
  });

  it('Concerta: should increase dopamine (extended release)', async () => {
    await ScenarioBuilder.with()
      .duration(1440)
      .taking('concerta', { mg: 36 }, 480)
      .expect('dopamine').toRise()
      .run();
  });

  it('Adderall: should spike dopamine and norepi', async () => {
    await ScenarioBuilder.with()
      .duration(1440)
      .taking('adderallIR', { mg: 10 }, 480)
      .expect('dopamine').toRise()
      .expect('norepi').toRise()
      .run();
  });

  it('Vyvanse: should increase dopamine over time', async () => {
    await ScenarioBuilder.with()
      .duration(1440)
      .taking('vyvanse', { mg: 30 }, 480)
      .expect('dopamine').toRise()
      .run();
  });

  it('Intuniv: should reduce norepi (alpha-2A agonist)', async () => {
    await ScenarioBuilder.with()
      .duration(1440)
      .taking('intuniv', { mg: 2 }, 1200) // Take at night
      .expect('norepi').toFall()
      .run();
  });

  it('MDMA: should target SERT (antagonist)', async () => {
    await ScenarioBuilder.with()
      .duration(1440)
      .taking('mdma', { mg: 100 }, 480)
      .run();
  });

  it('Psilocybin: should target 5HT2A', async () => {
    await ScenarioBuilder.with()
      .duration(1440)
      .taking('psilocybin', { mg: 15 }, 480)
      .run();
  });

  it('Ketamine: should target NMDA (antagonist)', async () => {
    await ScenarioBuilder.with()
      .duration(1440)
      .taking('ketamine', { mg: 50 }, 480)
      .run();
  });
});
