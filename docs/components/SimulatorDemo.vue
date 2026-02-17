<script setup>
import { ref, onMounted, watch } from 'vue'
import {
  createInitialState,
  integrateStep,
  DEFAULT_SUBJECT,
  derivePhysiology,
  Agents,
  buildConditionAdjustments
} from '@kyneticbio/core'

// --- Scenario Definitions ---
const SCENARIOS = [
  {
    id: 'caffeine-theanine',
    label: 'Caffeine + L-Theanine',
    description: 'Caffeine drives norepinephrine and dopamine while theanine keeps GABA elevated.',
    signals: ['norepi', 'dopamine', 'gaba'],
    hours: 6,
    startMinuteOfDay: 480, // 8:00 AM
    conditions: {},
    baseline(_dur) {
      return []
    },
    intervention(dur) {
      return [
        ...makeInterventions('caff', 'caffeine', 0, dur, Agents.Caffeine(200)),
        ...makeInterventions('thea', 'theanine', 0, dur, Agents.LTheanine(200)),
      ]
    },
  },
  {
    id: 'adhd-medication',
    label: 'ADHD + Medication',
    description: 'Low baseline dopamine and norepinephrine rescued by methylphenidate.',
    signals: ['dopamine', 'norepi', 'cortisol'],
    hours: 8,
    startMinuteOfDay: 480,
    conditions: { adhd: { enabled: true, params: { severity: 0.6 } } },
    baseline(_dur) {
      return []
    },
    intervention(dur) {
      return makeInterventions('mph', 'methylphenidate', 0, dur, Agents.Methylphenidate(20))
    },
  },
  {
    id: 'sleep-stack',
    label: 'Sleep Stack',
    description: 'Melatonin rises, cortisol drops, GABA calms the system before bed.',
    signals: ['melatonin', 'cortisol', 'gaba'],
    hours: 6,
    startMinuteOfDay: 1260, // 9:00 PM
    conditions: {},
    baseline(_dur) {
      return []
    },
    intervention(dur) {
      return [
        ...makeInterventions('mel', 'melatonin', 0, dur, Agents.Melatonin(3)),
        ...makeInterventions('mag', 'magnesium', 0, dur, Agents.Magnesium(400)),
      ]
    },
  },
  {
    id: 'morning-protocol',
    label: 'Morning Protocol',
    description: 'Sunlight, cardio, then caffeine — a clean stacked activation curve.',
    signals: ['cortisol', 'dopamine', 'bdnf'],
    hours: 6,
    startMinuteOfDay: 390, // 6:30 AM
    conditions: {},
    baseline(_dur) {
      return []
    },
    intervention(dur) {
      return [
        ...makeInterventions('sun', 'sunlight', 0, 20, Agents.SunlightExposure(10000, 'sunrise')),
        ...makeInterventions('run', 'cardio', 30, 30, Agents.Cardio(2, 30)),
        ...makeInterventions('caff', 'caffeine', 60, dur, Agents.Caffeine(100)),
      ]
    },
  },
  {
    id: 'stress-recovery',
    label: 'Stress Recovery',
    description: 'Breathwork + theanine lowers cortisol and boosts parasympathetic tone.',
    signals: ['cortisol', 'gaba', 'serotonin'],
    hours: 4,
    startMinuteOfDay: 480,
    conditions: {},
    baseline(_dur) {
      return []
    },
    intervention(dur) {
      return [
        ...makeInterventions('bw', 'breathwork', 0, 15, Agents.Breathwork('calm', 1.0)),
        ...makeInterventions('thea', 'theanine', 0, dur, Agents.LTheanine(200)),
      ]
    },
  },
]

// --- Helpers ---
function makeInterventions(id, key, startTime, duration, pharmacology, params = {}) {
  const defs = Array.isArray(pharmacology) ? pharmacology : [pharmacology]
  return defs.map((pharm, idx) => ({
    id: defs.length > 1 ? `${id}_${idx}` : id,
    key,
    startTime,
    duration,
    intensity: 1.0,
    params,
    pharmacology: pharm,
  }))
}

function formatHour(minuteOfDay) {
  const h = Math.floor(minuteOfDay / 60) % 24
  if (h === 0) return '12a'
  if (h < 12) return `${h}a`
  if (h === 12) return '12p'
  return `${h - 12}p`
}

// --- State ---
const activeScenario = ref(0)
const results = ref(null) // { signals: [{ key, baseline: [{x,y}], intervention: [{x,y}] }] }

// --- Simulation ---
function runOnce(scenario, interventions) {
  const subject = { ...DEFAULT_SUBJECT }
  const physiology = derivePhysiology(subject)

  // Build condition adjustments
  const conditionState = {}
  for (const [key, val] of Object.entries(scenario.conditions)) {
    conditionState[key] = { enabled: val.enabled, params: val.params || {} }
  }
  const adjustments = buildConditionAdjustments(conditionState)

  let state = createInitialState({ subject, physiology, isAsleep: scenario.startMinuteOfDay >= 1200 })
  const totalSteps = scenario.hours * 12 // 5-min steps
  const signalKeys = scenario.signals

  // Collect initial values
  const traces = {}
  for (const sig of signalKeys) {
    traces[sig] = [{ x: 0, y: state.signals[sig] ?? 0 }]
  }

  for (let i = 1; i <= totalSteps; i++) {
    const t = i * 5
    const minuteOfDay = (scenario.startMinuteOfDay + t) % 1440
    const ctx = {
      minuteOfDay,
      circadianMinuteOfDay: minuteOfDay,
      dayOfYear: 1,
      isAsleep: minuteOfDay >= 1320 || minuteOfDay < 360, // 10pm - 6am
      subject,
      physiology,
    }
    state = integrateStep(
      state, t - 5, 5.0, ctx,
      undefined, undefined,
      interventions,
      { debug: {}, conditionAdjustments: adjustments }
    )
    for (const sig of signalKeys) {
      traces[sig].push({ x: t, y: state.signals[sig] ?? 0 })
    }
  }
  return traces
}

function runScenario(idx) {
  const scenario = SCENARIOS[idx]
  const simDurationMin = scenario.hours * 60

  const baselineIvs = scenario.baseline(simDurationMin)
  const interventionIvs = scenario.intervention(simDurationMin)

  const baseTraces = runOnce(scenario, baselineIvs)
  const ivTraces = runOnce(scenario, interventionIvs)

  const signals = scenario.signals.map(key => ({
    key,
    baseline: baseTraces[key],
    intervention: ivTraces[key],
  }))

  results.value = { signals, scenario }
}

// --- SVG Path Builder ---
const CHART_W = 300
const CHART_H = 120
const PAD_TOP = 4
const PAD_BOT = 4
const DRAW_H = CHART_H - PAD_TOP - PAD_BOT

function buildPath(data, minVal, maxVal) {
  if (!data.length) return ''
  const range = maxVal - minVal || 1
  const maxX = data[data.length - 1].x || 1
  const points = data.map(d => {
    const px = (d.x / maxX) * CHART_W
    const py = PAD_TOP + DRAW_H - ((d.y - minVal) / range) * DRAW_H
    return `${px.toFixed(1)},${py.toFixed(1)}`
  })
  return `M ${points.join(' L ')}`
}

function getSignalBounds(sig) {
  const allVals = [...sig.baseline.map(d => d.y), ...sig.intervention.map(d => d.y)]
  const min = Math.min(...allVals)
  const max = Math.max(...allVals)
  const pad = (max - min) * 0.1 || 0.5
  return { min: min - pad, max: max + pad }
}

function getHourMarkers(scenario) {
  const markers = []
  const totalMin = scenario.hours * 60
  for (let m = 0; m <= totalMin; m += 60) {
    markers.push({
      x: (m / totalMin) * CHART_W,
      label: formatHour(scenario.startMinuteOfDay + m),
    })
  }
  return markers
}

// --- Lifecycle ---
onMounted(() => runScenario(0))

watch(activeScenario, (idx) => runScenario(idx))
</script>

<template>
  <div class="simulator-demo">
    <!-- Scenario Tabs -->
    <div class="scenario-tabs">
      <button
        v-for="(s, i) in SCENARIOS"
        :key="s.id"
        :class="['scenario-tab', { active: activeScenario === i }]"
        @click="activeScenario = i"
      >
        {{ s.label }}
      </button>
    </div>

    <!-- Description + Legend -->
    <div v-if="results" class="scenario-meta">
      <p class="scenario-description">{{ results.scenario.description }}</p>
      <div class="legend">
        <span class="legend-item">
          <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="var(--vp-c-text-3)" stroke-width="2" stroke-dasharray="4 3" /></svg>
          Baseline
        </span>
        <span class="legend-item">
          <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="var(--vp-c-brand-1)" stroke-width="2.5" /></svg>
          Intervention
        </span>
      </div>
    </div>

    <!-- Charts Grid -->
    <div v-if="results" class="chart-grid">
      <div v-for="sig in results.signals" :key="sig.key" class="chart-card">
        <div class="chart-label">{{ sig.key }}</div>
        <svg :viewBox="`0 0 ${CHART_W} ${CHART_H}`" class="mini-chart" preserveAspectRatio="none">
          <!-- Vertical hour grid lines -->
          <line
            v-for="m in getHourMarkers(results.scenario).slice(1, -1)"
            :key="m.label"
            :x1="m.x" y1="0" :x2="m.x" :y2="CHART_H"
            stroke="var(--vp-c-divider)" stroke-width="0.5"
          />
          <!-- Baseline (dashed) -->
          <path
            :d="buildPath(sig.baseline, getSignalBounds(sig).min, getSignalBounds(sig).max)"
            fill="none"
            stroke="var(--vp-c-text-3)"
            stroke-width="1.5"
            stroke-dasharray="4 3"
          />
          <!-- Intervention (solid) -->
          <path
            :d="buildPath(sig.intervention, getSignalBounds(sig).min, getSignalBounds(sig).max)"
            fill="none"
            stroke="var(--vp-c-brand-1)"
            stroke-width="2.5"
          />
        </svg>
        <!-- X-axis time labels -->
        <div class="chart-x-axis">
          <span
            v-for="m in getHourMarkers(results.scenario)"
            :key="m.label"
            class="x-label"
            :style="{ left: (m.x / CHART_W * 100) + '%' }"
          >{{ m.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.simulator-demo {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid var(--vp-c-divider);
  margin: 2rem 0;
}

/* --- Scenario Tabs --- */
.scenario-tabs {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.scenario-tabs::-webkit-scrollbar { display: none; }

.scenario-tab {
  flex-shrink: 0;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.scenario-tab:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-text-1);
}
.scenario-tab.active {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

/* --- Scenario Meta --- */
.scenario-meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  margin: 0.75rem 0 1rem;
  flex-wrap: wrap;
}
.scenario-description {
  margin: 0;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  line-height: 1.4;
}
.legend {
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}

/* --- Chart Grid --- */
.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}
@media (max-width: 640px) {
  .chart-grid {
    grid-template-columns: 1fr;
  }
}

.chart-card {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.75rem 0.75rem 0.5rem;
}

.chart-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  text-transform: capitalize;
  margin-bottom: 0.35rem;
}

.mini-chart {
  width: 100%;
  height: auto;
  display: block;
}

.chart-x-axis {
  position: relative;
  height: 1rem;
  margin-top: 0.15rem;
}
.x-label {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
}
</style>
