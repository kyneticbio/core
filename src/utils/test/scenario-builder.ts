import { expect } from 'vitest';
import type { Signal, ConditionKey, Subject } from '../../index';
import { runEngine, type TestIntervention, signalStats, valueAt } from './utils';

/**
 * Fluent Builder for Physiological Tests
 * Based on the strategy in @plans/testing.md
 */
export class ScenarioBuilder {
  private _duration: number = 1440;
  private _gridStep: number = 5;
  private _subject: Partial<Subject> = {};
  private _conditions: Partial<Record<ConditionKey, { enabled: boolean; params: Record<string, number> }>> = {};
  private _interventions: TestIntervention[] = [];
  private _assertions: ((result: any) => void)[] = [];

  static with(subject: Partial<Subject> = {}) {
    const builder = new ScenarioBuilder();
    builder._subject = subject;
    return builder;
  }

  public duration(mins: number): this {
    this._duration = mins;
    return this;
  }

  public condition(key: ConditionKey, params: Record<string, number> = {}): this {
    this._conditions[key] = { enabled: true, params };
    return this;
  }

  public taking(key: string, params: Record<string, number | string> = {}, startMin: number = 480): this {
    this._interventions.push({ key, params, startMin });
    return this;
  }

  public performing(key: string, durationMin: number, intensity: number = 1.0, startMin: number = 480): this {
    this._interventions.push({ key, durationMin, intensity, startMin });
    return this;
  }

  /**
   * Flexible method to add an intervention with all options
   */
  public add(key: string, options: { params?: Record<string, any>, duration?: number, intensity?: number, start?: number } = {}): this {
    this._interventions.push({
      key,
      params: options.params,
      durationMin: options.duration,
      intensity: options.intensity,
      startMin: options.start ?? 480
    });
    return this;
  }

  public expect(signal: Signal): AssertionBuilder {
    const firstIntervention = this._interventions[0];
    const startTime = firstIntervention ? firstIntervention.startMin : 0;
    return new AssertionBuilder(this, signal, startTime, 'signals');
  }

  public expectAuxiliary(key: string): AssertionBuilder {
    const firstIntervention = this._interventions[0];
    const startTime = firstIntervention ? firstIntervention.startMin : 0;
    return new AssertionBuilder(this, key as Signal, startTime, 'auxiliary');
  }

  public addAssertion(assertion: (result: any) => void) {
    this._assertions.push(assertion);
  }

  public async run() {
    const result = await runEngine({
      duration: this._duration,
      gridStep: this._gridStep,
      subject: this._subject,
      conditions: this._conditions,
      interventions: this._interventions,
    });

    for (const assertion of this._assertions) {
      assertion(result);
    }

    return result;
  }
}

class AssertionBuilder {
  constructor(
    private parent: ScenarioBuilder,
    private key: string,
    private startTime: number,
    private type: 'signals' | 'auxiliary' = 'signals'
  ) {}

  private getSignalData(result: any): Float32Array {
    const series = this.type === 'signals' ? result.signals : result.auxiliarySeries;
    if (!series) throw new Error(`Result contains no ${this.type} series`);
    const data = series[this.key];
    if (!data) throw new Error(`${this.type === 'signals' ? 'Signal' : 'Auxiliary'} ${this.key} not found in results`);
    return data;
  }

  public toRise(epsilon: number = 0): ScenarioBuilder {
    this.parent.addAssertion((result) => {
      const data = this.getSignalData(result);
      const stats = signalStats(data, result.gridMins);
      const valAtStart = valueAt(data, result.gridMins, this.startTime);
      expect(stats.max).toBeGreaterThan(valAtStart + epsilon);
    });
    return this.parent;
  }

  public toFall(epsilon: number = 0): ScenarioBuilder {
    this.parent.addAssertion((result) => {
      const data = this.getSignalData(result);
      const stats = signalStats(data, result.gridMins);
      const valAtStart = valueAt(data, result.gridMins, this.startTime);
      expect(stats.min).toBeLessThan(valAtStart - epsilon);
    });
    return this.parent;
  }

  public toStayBelow(value: number): ScenarioBuilder {
    this.parent.addAssertion((result) => {
      const data = this.getSignalData(result);
      const stats = signalStats(data, result.gridMins);
      expect(stats.max).toBeLessThan(value);
    });
    return this.parent;
  }

  public toStayAbove(value: number): ScenarioBuilder {
    this.parent.addAssertion((result) => {
      const data = this.getSignalData(result);
      const stats = signalStats(data, result.gridMins);
      expect(stats.min).toBeGreaterThan(value);
    });
    return this.parent;
  }

  public toReach(value: number, tolerance: number = 0.1): ScenarioBuilder {
    this.parent.addAssertion((result) => {
      const data = this.getSignalData(result);
      const stats = signalStats(data, result.gridMins);
      const diff = Math.abs(stats.max - value);
      const t = Math.abs(value * tolerance);
      expect(diff).toBeLessThanOrEqual(t);
    });
    return this.parent;
  }

  public toPeakAbove(value: number): ScenarioBuilder {
    this.parent.addAssertion((result) => {
      const data = this.getSignalData(result);
      const stats = signalStats(data, result.gridMins);
      expect(stats.max).toBeGreaterThan(value);
    });
    return this.parent;
  }

  public toTroughBelow(value: number): ScenarioBuilder {
    this.parent.addAssertion((result) => {
      const data = this.getSignalData(result);
      const stats = signalStats(data, result.gridMins);
      expect(stats.min).toBeLessThan(value);
    });
    return this.parent;
  }
}
