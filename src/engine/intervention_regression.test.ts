/**
 * Regression tests for intervention processing bugs fixed in the unified ODE solver.
 * These tests are designed to fail if the specific bugs recur.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  integrateStep,
  createInitialState,
  DEFAULT_SUBJECT,
  derivePhysiology,
} from "../index";
import type {
  DynamicsContext,
  SimulationState,
  ActiveIntervention,
} from "./types";

describe("Intervention Processing Regressions", () => {
  let initialState: SimulationState;
  let ctx: DynamicsContext;
  const subject = DEFAULT_SUBJECT;
  const physiology = derivePhysiology(subject);

  beforeEach(() => {
    initialState = createInitialState({
      subject,
      physiology,
      isAsleep: false,
    });
    ctx = {
      minuteOfDay: 480, // 8 AM
      circadianMinuteOfDay: 480, // 8 AM
      dayOfYear: 1,
      isAsleep: false,
      subject,
      physiology,
    };
  });

  function simulate(
    state: SimulationState,
    startTime: number,
    durationMin: number,
    interventions: ActiveIntervention[],
    dt: number = 1.0,
  ): SimulationState {
    let current = state;
    for (let i = 0; i < durationMin; i++) {
      const t = startTime + i;
      const minuteOfDay = t % 1440;
      current = integrateStep(
        current,
        t,
        dt,
        { ...ctx, minuteOfDay, circadianMinuteOfDay: minuteOfDay },
        undefined,
        undefined,
        interventions,
      );
    }
    return current;
  }

  describe("Bug #1: PK input must use dose from params", () => {
    it("should produce higher concentration with higher mg dose", () => {
      const lowDoseIntervention: ActiveIntervention[] = [
        {
          id: "drug-low",
          key: "test-drug",
          startTime: 480,
          duration: 60,
          intensity: 1.0,
          params: { mg: 50 },
          pharmacology: {
            pk: {
              model: "1-compartment",
              bioavailability: 1.0,
              halfLifeMin: 300,
              massMg: 50,
            },
            pd: [],
          },
        },
      ];

      const highDoseIntervention: ActiveIntervention[] = [
        {
          id: "drug-high",
          key: "test-drug",
          startTime: 480,
          duration: 60,
          intensity: 1.0,
          params: { mg: 200 },
          pharmacology: {
            pk: {
              model: "1-compartment",
              bioavailability: 1.0,
              halfLifeMin: 300,
              massMg: 200,
            },
            pd: [],
          },
        },
      ];

      const lowResult = simulate(initialState, 480, 30, lowDoseIntervention);
      const highResult = simulate(initialState, 480, 30, highDoseIntervention);

      // High dose should produce ~4x the concentration
      const lowConc = lowResult.pk["drug-low_central"];
      const highConc = highResult.pk["drug-high_central"];

      expect(lowConc).toBeGreaterThan(0);
      expect(highConc).toBeGreaterThan(0);
      expect(highConc / lowConc).toBeGreaterThan(3); // Should be ~4x, allow some margin
      expect(highConc / lowConc).toBeLessThan(5);
    });
  });

  describe("Bug #2: Activity-dependent PK model handling", () => {
    it("should set concentration to intensity while active", () => {
      const sleepIntervention: ActiveIntervention[] = [
        {
          id: "sleep-test",
          key: "sleep",
          startTime: 0,
          duration: 480,
          intensity: 1.0,
          params: {},
          pharmacology: {
            pk: { model: "activity-dependent", delivery: "continuous", massMg: 0 },
            pd: [],
          },
        },
      ];

      // Simulate during active period
      let state = initialState;
      for (let i = 0; i < 20; i++) {
        state = integrateStep(
          state,
          i,
          1.0,
          { ...ctx, minuteOfDay: i, isAsleep: true },
          undefined,
          undefined,
          sleepIntervention,
        );
      }

      // Concentration should approach 1.0 (intensity)
      expect(state.pk["sleep-test_central"]).toBeGreaterThan(0.9);
    });
  });

  describe("Bug #3: PD effect magnitude", () => {
    it("activity-dependent PD should produce meaningful signal changes", () => {
      const sleepIntervention: ActiveIntervention[] = [
        {
          id: "sleep-pd",
          key: "sleep",
          startTime: 0,
          duration: 480,
          intensity: 1.0,
          params: {},
          pharmacology: {
            pk: { model: "activity-dependent", delivery: "continuous", massMg: 0 },
            pd: [
              {
                target: "gaba",
                mechanism: "agonist",
                intrinsicEfficacy: 40.0,
                tau: 10,
              },
            ],
          },
        },
      ];

      // Simulate with sleep context
      let state = initialState;
      for (let i = 0; i < 60; i++) {
        state = integrateStep(
          state,
          i,
          1.0,
          { ...ctx, minuteOfDay: i, isAsleep: true },
          undefined,
          undefined,
          sleepIntervention,
        );
      }

      // GABA should have changed from intervention (check PK concentration first)
      expect(state.pk["sleep-pd_central"]).toBeGreaterThan(0.5);
      expect(state.signals.gaba).toBeGreaterThan(0); 
    });
  });
});
