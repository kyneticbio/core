import { describe, it, expect } from "vitest";
import {
  integrateStep,
  computeDerivatives,
  createInitialState,
  initializeZeroState,
} from "../index";
import { 
  DEFAULT_SUBJECT, 
  derivePhysiology,
} from "../index";
import type {
  DynamicsContext,
  SimulationState,
  ActiveIntervention,
} from "./types";
import { dopamine as dopamineDef } from "../endogenous/signals/neurotransmitters/dopamine";

describe("Unified ODE Architecture", () => {
  const subject = DEFAULT_SUBJECT;
  const physiology = derivePhysiology(subject);
  const ctx: DynamicsContext = {
    minuteOfDay: 0,
    circadianMinuteOfDay: 0,
    dayOfYear: 1,
    isAsleep: false,
    subject,
    physiology,
  };

  function simulate(
    initialState: SimulationState,
    durationMin: number,
    dt: number = 1.0,
    currentCtx: DynamicsContext = ctx,
  ) {
    let state = initialState;
    const steps = Math.ceil(durationMin / dt);
    for (let i = 0; i < steps; i++) {
      const t = i * dt;
      state = integrateStep(
        state,
        t,
        dt,
        {
          ...currentCtx,
          minuteOfDay: (currentCtx.minuteOfDay + t) % 1440,
          circadianMinuteOfDay: (currentCtx.circadianMinuteOfDay + t) % 1440,
        }
      );
    }
    return state;
  }

  it("should initialize state correctly", () => {
    const state = createInitialState({
      subject,
      physiology,
      isAsleep: false,
    });

    expect(state.signals.glucose).toBe(90);
    expect(state.signals.insulin).toBe(8);
    expect(state.auxiliary.adenosinePressure).toBe(0.2);
  });

  it("should respond to high glucose by increasing insulin", () => {
    let state = createInitialState({
      subject,
      physiology,
      isAsleep: false,
    });

    // Spike glucose
    state.signals.glucose = 200;

    const nextState = simulate(state, 10, 0.5);

    // Insulin should have increased due to high glucose
    expect(nextState.signals.insulin).toBeGreaterThan(state.signals.insulin);
    // Glucose should have decreased slightly due to basal clearance
    expect(nextState.signals.glucose).toBeLessThan(200);
  });

  it("should decrease glucose when insulin is high (via insulinAction)", () => {
    let state = createInitialState({
      subject,
      physiology,
      isAsleep: false,
    });

    state.signals.glucose = 150;
    state.signals.insulin = 50;
    state.auxiliary.insulinAction = 0.1;

    const nextState = simulate(state, 10, 0.5);

    // Glucose should decrease
    expect(nextState.signals.glucose).toBeLessThan(150);
  });

  it("should accumulate adenosine pressure while awake", () => {
    let state = createInitialState({
      subject,
      physiology,
      isAsleep: false,
    });

    const nextState = simulate(state, 60, 1.0);

    expect(nextState.auxiliary.adenosinePressure).toBeGreaterThan(
      state.auxiliary.adenosinePressure,
    );
  });

  it("should decrease adenosine pressure while asleep", () => {
    let state = createInitialState({
      subject,
      physiology,
      isAsleep: false,
    });

    state.auxiliary.adenosinePressure = 0.8;
    const nextState = simulate(state, 60, 1.0, { ...ctx, isAsleep: true });

    // Adenosine should have decreased
    expect(nextState.auxiliary.adenosinePressure).toBeLessThan(0.8);
  });
});

describe('Solver Debug Flags', () => {
  const subject = DEFAULT_SUBJECT;
  const physiology = derivePhysiology(subject);
  const ctx: DynamicsContext = {
    minuteOfDay: 480, // 8 AM
    circadianMinuteOfDay: 480, // 8 AM
    dayOfYear: 1,
    isAsleep: false,
    subject,
    physiology
  };

  it('should have non-zero setpoint when baselines enabled', () => {
    const state = initializeZeroState();
    const derivs = computeDerivatives(
      state, 
      480, 
      ctx, 
      { dopamine: dopamineDef }, 
      {}, 
      [], 
      { debug: { enableBaselines: true } }
    );
    // Dopamine setpoint is non-zero at 8AM
    expect(derivs.signals.dopamine).toBeGreaterThan(0.1);
  });

  it('should have zero setpoint contribution when baselines disabled', () => {
    const state = initializeZeroState();
    const derivs = computeDerivatives(
      state, 
      480, 
      ctx, 
      { dopamine: dopamineDef }, 
      {}, 
      [], 
      { debug: { enableBaselines: false } }
    );
    
    expect(derivs.signals.dopamine).toBe(0);
  });
});

describe('Intervention Toggle', () => {
  const subject = DEFAULT_SUBJECT;
  const physiology = derivePhysiology(subject);
  const ctx: DynamicsContext = {
    minuteOfDay: 480, // 8 AM
    circadianMinuteOfDay: 480, // 8 AM
    dayOfYear: 1,
    isAsleep: false,
    subject,
    physiology
  };

  const intervention: ActiveIntervention = {
    id: 'test',
    key: 'test',
    startTime: 400,
    duration: 100,
    intensity: 1,
    params: {},
    // Mock Rate intervention
    type: 'rate',
    target: 'dopamine',
    magnitude: 100
  } as any;

  it('should apply intervention when enabled', () => {
    const state = initializeZeroState();
    const derivs = computeDerivatives(
      state, 
      450, // inside window
      ctx,
      { dopamine: dopamineDef },
      {},
      [intervention],
      { debug: { enableInterventions: true } }
    );
    
    expect(derivs.signals.dopamine).toBeGreaterThan(50);
  });

  it('should ignore intervention when disabled', () => {
    const state = initializeZeroState();
    const derivs = computeDerivatives(
      state, 
      450,
      ctx,
      { dopamine: dopamineDef },
      {},
      [intervention],
      { debug: { enableInterventions: false } }
    );
    
    // Should only have base dynamics
    expect(derivs.signals.dopamine).toBeLessThan(50);
    expect(derivs.signals.dopamine).toBeGreaterThan(0);
  });
});

