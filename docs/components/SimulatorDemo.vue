<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { 
  createInitialState, 
  integrateStep, 
  DEFAULT_SUBJECT, 
  derivePhysiology,
  SIGNALS_ALL,
  CONDITION_LIBRARY,
  INTERVENTIONS,
  Agents,
  buildConditionAdjustments
} from '@kyneticbio/core'

// --- State ---
const subject = reactive({ ...DEFAULT_SUBJECT })
const enabledConditions = reactive(
  Object.fromEntries(CONDITION_LIBRARY.map(c => [
    c.key, 
    {
      enabled: false,
      label: c.label,
      params: Object.fromEntries(c.params.map(p => [p.key, p.default]))
    }
  ]))
)
const activeInterventions = reactive({
  caffeine: { enabled: false, mg: 100 },
  strengthTraining: { enabled: false, intensity: 0.8 },
  theanine: { enabled: false, mg: 200 }
})
const selectedSignal = ref('dopamine')
const chartData = ref([])
const chartBounds = reactive({ min: 0, max: 100 })

const sortedSignals = computed(() => {
  return [...SIGNALS_ALL].sort((a, b) => a.localeCompare(b))
})

// --- Constants ---
const HOURS = 8
const STEPS_PER_HOUR = 12 // 5-minute steps
const TOTAL_STEPS = HOURS * STEPS_PER_HOUR

// --- Simulation Logic ---
const runSimulation = () => {
  const physiology = derivePhysiology(subject)
  
  // Build condition adjustments
  const conditionState = {}
  Object.keys(enabledConditions).forEach(key => {
    if (enabledConditions[key].enabled) {
      conditionState[key] = {
        enabled: true,
        params: enabledConditions[key].params || {}
      }
    }
  })
  const adjustments = buildConditionAdjustments(conditionState)

  let state = createInitialState({ subject, physiology, isAsleep: false })
  const results = []
  
  // Initial point
  results.push({ x: 0, y: state.signals[selectedSignal.value] })

  // Active interventions for the engine
  const ivs = []
  if (activeInterventions.caffeine.enabled) {
    ivs.push({
      id: 'caffeine-1',
      key: 'caffeine',
      startTime: 0,
      duration: 15,
      intensity: 1.0,
      params: { mg: activeInterventions.caffeine.mg },
      pharmacology: Agents.Caffeine(activeInterventions.caffeine.mg)
    })
  }
  if (activeInterventions.theanine.enabled) {
    ivs.push({
      id: 'theanine-1',
      key: 'theanine',
      startTime: 0,
      duration: 15,
      intensity: 1.0,
      params: { mg: activeInterventions.theanine.mg },
      pharmacology: Agents.LTheanine(activeInterventions.theanine.mg)
    })
  }
  if (activeInterventions.strengthTraining.enabled) {
    ivs.push({
      id: 'exercise-1',
      key: 'strengthTraining',
      startTime: 30,
      duration: 60,
      intensity: activeInterventions.strengthTraining.intensity,
      params: { intensity: activeInterventions.strengthTraining.intensity },
      pharmacology: Agents.Exercise(activeInterventions.strengthTraining.intensity)
    })
  }

  // Simulation Loop
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const t = i * 5 // 5 minute steps
    const ctx = {
      minuteOfDay: (480 + t) % 1440, // Start at 8:00 AM
      circadianMinuteOfDay: (480 + t) % 1440,
      dayOfYear: 1,
      isAsleep: false,
      subject,
      physiology
    }
    
    state = integrateStep(
      state, 
      t - 5, 
      5.0, 
      ctx, 
      undefined, 
      undefined, 
      ivs, 
      { 
        debug: {}, 
        conditionAdjustments: adjustments 
      }
    )
    
    results.push({ x: t, y: state.signals[selectedSignal.value] })
  }
  
  chartData.value = results

  // Update bounds
  const values = results.map(d => d.y)
  chartBounds.max = Math.max(...values) * 1.1
  chartBounds.min = Math.min(...values) * 0.9
  if (chartBounds.max === chartBounds.min) {
    chartBounds.max += 1
    chartBounds.min -= 1
  }
}

// --- Lifecycle & Watchers ---
onMounted(() => {
  runSimulation()
})

watch([subject, enabledConditions, activeInterventions, selectedSignal], () => {
  runSimulation()
}, { deep: true })

// --- SVG Helpers ---
const getSvgPath = () => {
  if (!chartData.value.length) return ''
  const { min: minVal, max: maxVal } = chartBounds
  const range = maxVal - minVal || 1
  
  const width = 800
  const height = 300
  
  const points = chartData.value.map(d => {
    const px = (d.x / (HOURS * 60)) * width
    const py = height - ((d.y - minVal) / range) * height
    return `${px},${py}`
  })
  
  return `M ${points.join(' L ')}`
}
</script>

<template>
  <div class="simulator-demo">
    <div class="controls-grid">
      <!-- Subject Section -->
      <section class="control-section">
        <h3>Subject</h3>
        <div class="field">
          <label>Age: {{ subject.age }}</label>
          <input type="range" v-model.number="subject.age" min="18" max="100" />
        </div>
        <div class="field">
          <label>Weight (kg): {{ subject.weight }}</label>
          <input type="range" v-model.number="subject.weight" min="40" max="150" />
        </div>
        <div class="field">
          <label>Sex</label>
          <select v-model="subject.sex">
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </section>

      <!-- Conditions Section -->
      <section class="control-section">
        <h3>Conditions</h3>
        <div v-for="c in CONDITION_LIBRARY.slice(0, 4)" :key="c.key" class="condition-item">
          <label>
            <input type="checkbox" v-model="enabledConditions[c.key].enabled" />
            {{ c.label }}
          </label>
          <div v-if="enabledConditions[c.key]?.enabled" class="condition-params">
            <div v-for="p in c.params" :key="p.key">
              <label>{{ p.label }}: {{ enabledConditions[c.key].params[p.key] }}</label>
              <input type="range" v-model.number="enabledConditions[c.key].params[p.key]" :min="p.min" :max="p.max" :step="p.step" />
            </div>
          </div>
        </div>
      </section>

      <!-- Interventions Section -->
      <section class="control-section">
        <h3>Interventions (Active at Start)</h3>
        <div class="intervention-item">
          <label><input type="checkbox" v-model="activeInterventions.caffeine.enabled" /> Caffeine</label>
          <input v-if="activeInterventions.caffeine.enabled" type="number" v-model.number="activeInterventions.caffeine.mg" />
          <span v-if="activeInterventions.caffeine.enabled">mg</span>
        </div>
        <div class="intervention-item">
          <label><input type="checkbox" v-model="activeInterventions.theanine.enabled" /> L-Theanine</label>
          <input v-if="activeInterventions.theanine.enabled" type="number" v-model.number="activeInterventions.theanine.mg" />
          <span v-if="activeInterventions.theanine.enabled">mg</span>
        </div>
        <div class="intervention-item">
          <label><input type="checkbox" v-model="activeInterventions.strengthTraining.enabled" /> Strength Training (at 30m)</label>
          <input v-if="activeInterventions.strengthTraining.enabled" type="range" v-model.number="activeInterventions.strengthTraining.intensity" min="0" max="1" step="0.1" />
        </div>
      </section>
    </div>

    <!-- Chart Section -->
    <div class="chart-container">
      <div class="chart-header">
        <select v-model="selectedSignal" class="signal-select">
          <option v-for="s in sortedSignals" :key="s" :value="s">{{ s }}</option>
        </select>
        <span class="chart-title">8-Hour Physiological Response</span>
      </div>
      
      <svg viewBox="0 0 800 300" class="main-svg">
        <!-- Grid Lines -->
        <line v-for="i in 9" :key="i" :x1="(i-1) * 100" y1="0" :x2="(i-1) * 100" y2="300" stroke="#333" stroke-dasharray="4" />
        
        <!-- Y-Axis Labels -->
        <text x="-10" y="15" fill="#888" font-size="12" text-anchor="end">{{ chartBounds.max.toFixed(1) }}</text>
        <text x="-10" y="150" fill="#888" font-size="12" text-anchor="end">{{ ((chartBounds.max + chartBounds.min) / 2).toFixed(1) }}</text>
        <text x="-10" y="295" fill="#888" font-size="12" text-anchor="end">{{ chartBounds.min.toFixed(1) }}</text>

        <!-- Data Path -->
        <path :d="getSvgPath()" fill="none" stroke="var(--vp-c-brand)" stroke-width="3" />
        
        <!-- X-Axis Labels -->
        <text v-for="i in 9" :key="'t'+i" :x="(i-1) * 100" y="320" fill="#888" font-size="12" text-anchor="middle">
          {{ i-1 }}h
        </text>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.simulator-demo {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid var(--vp-c-divider);
  margin: 2rem 0;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.control-section h3 {
  margin-top: 0;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.field {
  margin-bottom: 1rem;
}

.field label {
  display: block;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.field input, .field select {
  width: 100%;
}

.condition-item {
  margin-bottom: 0.75rem;
}

.condition-params {
  padding-left: 1.5rem;
  margin-top: 0.5rem;
  font-size: 0.8rem;
}

.intervention-item {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.chart-container {
  background: #111;
  padding: 1.5rem;
  border-radius: 8px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.signal-select {
  background: #222;
  color: white;
  border: 1px solid #444;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
}

.chart-title {
  color: #888;
  font-size: 0.9rem;
}

.main-svg {
  width: 100%;
  height: auto;
  overflow: visible;
  margin-left: 40px;
}
</style>
