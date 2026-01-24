import { describe, it } from 'vitest';
import { ScenarioBuilder } from '../../utils/test/scenario-builder';

describe('Lifestyle Interventions', () => {
  it('Sleep: should increase melatonin and reduce cortisol', async () => {
    await ScenarioBuilder.with({ age: 30, sex: 'male' })
      .duration(1440)
      .taking('sleep', {}, 0) // Start at midnight
      .expect('melatonin').toRise()
      .expect('cortisol').toFall()
      .run();
  });

  it('Cardio: should spike adrenaline and norepi', async () => {
    await ScenarioBuilder.with({ age: 30, weight: 70 })
      .duration(600)
      .performing('exercise_cardio', 45, 1.0, 480)
      .expect('adrenaline').toPeakAbove(100)
      .expect('norepi').toRise()
      .run();
  });

  it('Alcohol: should increase ethanol and dopamine', async () => {
    await ScenarioBuilder.with({ age: 30, sex: 'male' })
      .duration(600)
      .taking('alcohol', { units: 2 }, 480)
      .expect('ethanol').toRise()
      .expect('dopamine').toRise()
      .run();
  });

  it('Meditation: should increase vagal tone and reduce cortisol', async () => {
    await ScenarioBuilder.with()
      .duration(600)
      .performing('meditation', 20, 1.0, 480)
      .expect('vagal').toRise()
      .expect('cortisol').toFall()
      .run();
  });

  it('Cold Exposure: should spike norepi and adrenaline', async () => {
    await ScenarioBuilder.with()
      .duration(600)
      .taking('coldExposure', { temperature: 5, intensity: 1.0 }, 480)
      .expect('norepi').toPeakAbove(200)
      .expect('adrenaline').toRise()
      .run();
  });

  it('Nap: should reduce adenosine pressure and norepi', async () => {
    await ScenarioBuilder.with()
      .duration(600)
      .taking('nap', { quality: 1 }, 60) // Start early in simulation
      .expectAuxiliary('adenosinePressure').toFall()
      .expect('norepi').toFall()
      .run();
  });

  it('Sauna: should spike growth hormone and prolactin', async () => {
    await ScenarioBuilder.with()
      .duration(600)
      .taking('heatSauna', { temperature: 85, type: 'dry' }, 1080) // 6 PM
      .expect('growthHormone').toRise()
      .expect('prolactin').toRise()
      .run();
  });

  it('Sunlight: should suppress melatonin and boost cortisol', async () => {
    await ScenarioBuilder.with()
      .duration(1440)
      .taking('sunlight_viewing', { lux: 50000, time: 'sunrise' }, 420) // 7 AM
      .expect('melatonin').toFall()
      .expect('cortisol').toRise()
      .run();
  });

  it('Breathwork: should increase vagal tone (calm style)', async () => {
    await ScenarioBuilder.with()
      .duration(600)
      .taking('breathwork', { type: 'calm', intensity: 1.0 }, 600)
      .expect('vagal').toRise()
      .run();
  });

  it('Social Media: should spike dopamine and cortisol (doomscrolling)', async () => {
    await ScenarioBuilder.with()
      .duration(600)
      .taking('social_media', { type: 'doomscrolling' }, 60)
      .expect('dopamine').toRise(0.0001)
      .expect('cortisol').toRise(0.0001)
      .run();
  });

  it('Sexual Activity: should boost oxytocin and dopamine', async () => {
    await ScenarioBuilder.with()
      .duration(600)
      .taking('sexual_activity', { type: 'partnered', orgasm: 'yes' }, 60)
      .expect('oxytocin').toRise(0.0001)
      .expect('dopamine').toRise(0.0001)
      .run();
  });

  it('Tobacco: should spike acetylcholine and dopamine', async () => {
    await ScenarioBuilder.with()
      .duration(600)
      .taking('tobacco', { delivery: 'smoked', mg: 2 }, 60)
      .expect('acetylcholine').toRise(0.0001)
      .expect('dopamine').toRise(0.0001)
      .run();
  });
});
