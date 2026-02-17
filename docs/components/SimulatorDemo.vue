<script setup>
import { ref, computed, nextTick } from 'vue'
import { PERSONAS } from './data/personas'
import { useSimulation } from './composables/useSimulation'
import { useChartRenderer, CHART_W, CHART_H } from './composables/useChartRenderer'
import {
  INTERVENTION_MAP,
  INTERVENTIONS,
  SIGNAL_DEFINITIONS_MAP,
  CONDITION_LIBRARY,
} from '@kyneticbio/core'

// --- Chart helpers ---
const { hoveredX, buildPath, getSignalBounds, getHourMarkers, getValueAtX } = useChartRenderer()

// --- State ---
const activePersonaId = ref(null)
const activePersona = computed(() =>
  activePersonaId.value ? PERSONAS.find(p => p.id === activePersonaId.value) || null : null
)

const personaRef = computed(() => activePersona.value)
const { state: simState, initFromPersona } = useSimulation(personaRef)

// --- Persona selection ---
function selectPersona(id) {
  const p = PERSONAS.find(p => p.id === id)
  if (!p) return
  initFromPersona(p)
  activePersonaId.value = id
}

function goBack() {
  activePersonaId.value = null
  hoveredX.value = null
}

// --- Condition toggles ---
function toggleCondition(key) {
  if (simState.conditions[key]) {
    simState.conditions[key].enabled = !simState.conditions[key].enabled
  }
}

function updateConditionParam(condKey, paramKey, value) {
  if (simState.conditions[condKey]) {
    simState.conditions[condKey].params[paramKey] = value
  }
}

// --- Intervention toggles ---
function toggleIntervention(key) {
  if (simState.activeInterventions[key]) {
    simState.activeInterventions[key].enabled = !simState.activeInterventions[key].enabled
  }
}

function updateInterventionParam(ivKey, paramKey, value) {
  if (simState.activeInterventions[ivKey]) {
    simState.activeInterventions[ivKey].params[paramKey] = value
  }
}

const expandedIntervention = ref(null)
function toggleInterventionExpand(key) {
  expandedIntervention.value = expandedIntervention.value === key ? null : key
}

// --- Intervention picker ---
const showInterventionPicker = ref(false)
const interventionSearch = ref('')

const groupedAvailableInterventions = computed(() => {
  const active = new Set(Object.keys(simState.activeInterventions))
  const search = interventionSearch.value.toLowerCase()
  const groups = {}
  for (const iv of INTERVENTIONS) {
    if (active.has(iv.key)) continue
    if (search && !iv.label.toLowerCase().includes(search) && !iv.key.toLowerCase().includes(search)) continue
    const group = iv.group || 'Other'
    if (!groups[group]) groups[group] = []
    groups[group].push(iv)
  }
  return groups
})

function addIntervention(key) {
  const def = INTERVENTION_MAP.get(key)
  if (!def) return
  const params = {}
  for (const p of def.params) {
    params[p.key] = p.default
  }
  simState.activeInterventions[key] = { enabled: true, params }
  showInterventionPicker.value = false
  interventionSearch.value = ''
}

function removeIntervention(key) {
  delete simState.activeInterventions[key]
}

// --- Signal management ---
const showSignalPicker = ref(false)
const signalSearch = ref('')

const groupedAvailableSignals = computed(() => {
  const active = new Set(simState.visibleSignals.map(s => s.key))
  const search = signalSearch.value.toLowerCase()
  const groups = {}
  for (const [key, def] of Object.entries(SIGNAL_DEFINITIONS_MAP)) {
    if (typeof def !== 'object' || !def || !('key' in def)) continue
    if (active.has(key)) continue
    if (search && !(def.label || '').toLowerCase().includes(search) && !key.toLowerCase().includes(search)) continue
    // Group by category based on the module path isn't available, so group by first letter or unit
    const group = def.unit || 'Other'
    if (!groups[group]) groups[group] = []
    groups[group].push({ key, label: def.label || key, description: def.description || '' })
  }
  return groups
})

function addSignal(key) {
  const def = SIGNAL_DEFINITIONS_MAP[key]
  const label = (def && typeof def === 'object' && 'label' in def) ? def.label : key
  simState.visibleSignals.push({ key, label })
  showSignalPicker.value = false
  signalSearch.value = ''
}

function removeSignal(key) {
  simState.visibleSignals = simState.visibleSignals.filter(s => s.key !== key)
}

// --- Subject sliders ---
function updateSubject(key, value) {
  simState.subject[key] = value
}

// --- Cycle phase label ---
function getCyclePhase(day) {
  if (day <= 5) return `Menstrual (Day 1\u20135)`
  if (day <= 13) return `Follicular (Day 6\u201313)`
  if (day === 14) return `Ovulatory (Day 14)`
  return `Luteal (Day 15\u201328)`
}

// --- Condition label lookup ---
function getConditionLabel(key) {
  const def = CONDITION_LIBRARY?.find(c => c.key === key)
  return def?.label || key
}

function getConditionParams(key) {
  const def = CONDITION_LIBRARY?.find(c => c.key === key)
  return def?.params || []
}

// --- Intervention label/icon lookup ---
function getInterventionDef(key) {
  return INTERVENTION_MAP.get(key)
}

// --- Chart hover ---
function onChartMouseMove(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * CHART_W
  hoveredX.value = Math.max(0, Math.min(CHART_W, x))
}

function onChartMouseLeave() {
  hoveredX.value = null
}
</script>

<template>
  <div class="simulator-demo">
    <!-- STATE 1: Persona Grid -->
    <Transition name="fade" mode="out-in">
      <div v-if="!activePersonaId" key="grid" class="persona-grid">
        <div class="grid-header">
          <h2 class="grid-title">Select a demo.</h2>
        </div>
        <div class="grid-cards">
          <button
            v-for="p in PERSONAS"
            :key="p.id"
            class="persona-card"
            :style="{ '--accent': p.accent }"
            @click="selectPersona(p.id)"
          >
            <span class="persona-icon">{{ p.icon }}</span>
            <div class="persona-info">
              <h3 class="persona-headline">{{ p.headline }}</h3>
              <p class="persona-subhead">{{ p.subhead }}</p>
              <div class="persona-signals-preview" v-if="false">
                <span
                  v-for="s in p.signals.slice(0, 3)"
                  :key="s.key"
                  class="signal-pill-preview"
                >
                  {{ s.label }}
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- STATE 2: Active Persona View -->
      <div
        v-else
        key="detail"
        class="persona-view"
        :style="{ '--accent': activePersona?.accent }"
      >
        <!-- Header -->
        <div class="detail-header">
          <button class="back-btn" @click="goBack">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            Back
          </button>
          <div class="detail-headline">
            <span class="detail-icon">{{ activePersona?.icon }}</span>
            <div>
              <h2 class="detail-title">{{ activePersona?.headline }}</h2>
              <p class="detail-sub">{{ activePersona?.subhead }}</p>
            </div>
          </div>
        </div>

        <!-- Condition Bar -->
        <div
          v-if="Object.keys(simState.conditions).length || activePersona?.subjectSliders?.length"
          class="condition-bar"
        >
          <div class="bar-label">About You</div>
          <div class="condition-pills">
            <!-- Conditions -->
            <div
              v-for="(cond, key) in simState.conditions"
              :key="key"
              class="condition-group"
            >
              <button
                :class="['condition-pill', { active: cond.enabled }]"
                @click="toggleCondition(key)"
              >
                {{ getConditionLabel(key) }}
                <span
                  class="pill-toggle"
                  >{{ cond.enabled ? 'ON' : 'OFF' }}</span
                >
              </button>
              <!-- Inline param sliders -->
              <div v-if="cond.enabled" class="condition-params">
                <div
                  v-for="p in getConditionParams(key)"
                  :key="p.key"
                  class="param-inline"
                >
                  <template v-if="p.type === 'slider'">
                    <span class="param-label">{{ p.label }}</span>
                    <input
                      type="range"
                      :min="p.min"
                      :max="p.max"
                      :step="p.step"
                      :value="cond.params[p.key] ?? p.default"
                      class="param-slider"
                      @input="updateConditionParam(key, p.key, Number($event.target.value))"
                    />
                    <span
                      class="param-value"
                      >{{ (cond.params[p.key] ?? p.default).toFixed?.(1) ?? cond.params[p.key] }}</span
                    >
                  </template>
                  <template v-else-if="p.type === 'select'">
                    <span class="param-label">{{ p.label }}</span>
                    <select
                      :value="cond.params[p.key] ?? p.default"
                      class="param-select"
                      @change="updateConditionParam(key, p.key, Number($event.target.value))"
                    >
                      <option
                        v-for="opt in p.options"
                        :key="opt.value"
                        :value="opt.value"
                      >
                        {{ opt.label }}
                      </option>
                    </select>
                  </template>
                </div>
              </div>
            </div>

            <!-- Subject sliders -->
            <div
              v-for="s in activePersona?.subjectSliders"
              :key="s.key"
              class="condition-group"
            >
              <div class="subject-slider-group">
                <span class="param-label">{{ s.label }}</span>
                <input
                  type="range"
                  :min="s.min"
                  :max="s.max"
                  :step="s.step"
                  :value="simState.subject[s.key] ?? s.default"
                  class="param-slider subject-slider"
                  @input="updateSubject(s.key, Number($event.target.value))"
                />
                <span class="param-value"
                  >{{ simState.subject[s.key] ?? s.default }} {{ s.unit }}</span
                >
              </div>
              <!-- Cycle phase indicator -->
              <div v-if="s.key === 'cycleDay'" class="cycle-phase">
                {{ getCyclePhase(simState.subject.cycleDay ?? s.default) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Intervention Bar -->
        <div class="intervention-bar">
          <div class="bar-label">Interventions</div>
          <div class="intervention-chips">
            <div
              v-for="(iv, key) in simState.activeInterventions"
              :key="key"
              class="intervention-chip-group"
            >
              <button
                :class="['intervention-chip', { active: iv.enabled, inactive: !iv.enabled }]"
                @click="toggleIntervention(key)"
              >
                <span
                  class="chip-icon"
                  >{{ getInterventionDef(key)?.icon || '\u{1F48A}' }}</span
                >
                <span :class="['chip-name', { strikethrough: !iv.enabled }]">
                  {{ getInterventionDef(key)?.label || key }}
                </span>
                <button
                  class="chip-expand"
                  @click.stop="toggleInterventionExpand(key)"
                  title="Adjust dose"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10">
                    <path
                      :d="expandedIntervention === key ? 'M2 6L5 3L8 6' : 'M2 4L5 7L8 4'"
                      fill="currentColor"
                    />
                  </svg>
                </button>
                <button
                  class="chip-remove"
                  @click.stop="removeIntervention(key)"
                  title="Remove"
                >
                  &times;
                </button>
              </button>
              <!-- Expanded dose slider -->
              <div v-if="expandedIntervention === key" class="chip-dose-panel">
                <div
                  v-for="p in (getInterventionDef(key)?.params || [])"
                  :key="p.key"
                  class="dose-param"
                >
                  <template v-if="p.type === 'slider'">
                    <span class="param-label">{{ p.label }}</span>
                    <input
                      type="range"
                      :min="p.min"
                      :max="p.max"
                      :step="p.step"
                      :value="iv.params[p.key] ?? p.default"
                      class="param-slider"
                      @input="updateInterventionParam(key, p.key, Number($event.target.value))"
                    />
                    <span class="param-value"
                      >{{ iv.params[p.key] ?? p.default }} {{ p.unit }}</span
                    >
                  </template>
                  <template v-else-if="p.type === 'select'">
                    <span class="param-label">{{ p.label }}</span>
                    <select
                      :value="iv.params[p.key] ?? p.default"
                      class="param-select"
                      @change="updateInterventionParam(key, p.key, $event.target.value)"
                    >
                      <option
                        v-for="opt in (p.options || [])"
                        :key="opt.value ?? opt"
                        :value="opt.value ?? opt"
                      >
                        {{ opt.label ?? opt }}
                      </option>
                    </select>
                  </template>
                </div>
              </div>
            </div>

            <!-- Add intervention button -->
            <button
              class="add-chip"
              @click="showInterventionPicker = !showInterventionPicker"
            >
              + Add
            </button>
          </div>

          <!-- Intervention picker popover -->
          <div v-if="showInterventionPicker" class="picker-popover">
            <input
              v-model="interventionSearch"
              placeholder="Search interventions..."
              class="picker-search"
            />
            <div class="picker-list">
              <div
                v-for="(items, group) in groupedAvailableInterventions"
                :key="group"
                class="picker-group"
              >
                <div class="picker-group-label">{{ group }}</div>
                <button
                  v-for="iv in items"
                  :key="iv.key"
                  class="picker-item"
                  @click="addIntervention(iv.key)"
                >
                  <span
                    class="picker-item-icon"
                    >{{ iv.icon || '\u{1F48A}' }}</span
                  >
                  {{ iv.label }}
                </button>
              </div>
              <div
                v-if="!Object.keys(groupedAvailableInterventions).length"
                class="picker-empty"
              >
                No matching interventions
              </div>
            </div>
          </div>
        </div>

        <!-- Legend -->
        <div class="legend">
          <span class="legend-item">
            <svg width="24" height="8">
              <line
                x1="0"
                y1="4"
                x2="24"
                y2="4"
                stroke="var(--vp-c-text-3)"
                stroke-width="2"
                stroke-dasharray="4 3"
              />
            </svg>
            Baseline
          </span>
          <span class="legend-item">
            <svg width="24" height="8">
              <line
                x1="0"
                y1="4"
                x2="24"
                y2="4"
                :stroke="activePersona?.accent || 'var(--vp-c-brand-1)'"
                stroke-width="2.5"
              />
            </svg>
            With Interventions
          </span>
        </div>

        <!-- Chart Grid -->
        <div class="chart-grid">
          <div
            v-for="sig in simState.results"
            :key="sig.key"
            class="chart-card"
          >
            <div class="chart-header">
              <div class="chart-label">{{ sig.label }}</div>
              <button
                class="chart-remove"
                @click="removeSignal(sig.key)"
                title="Remove signal"
              >
                &times;
              </button>
            </div>
            <svg
              :viewBox="`0 0 ${CHART_W} ${CHART_H}`"
              class="mini-chart"
              preserveAspectRatio="none"
              @mousemove="onChartMouseMove"
              @mouseleave="onChartMouseLeave"
            >
              <!-- Hour grid lines -->
              <line
                v-for="m in getHourMarkers(activePersona.sim.startMinuteOfDay, activePersona.sim.hours).slice(1, -1)"
                :key="m.label"
                :x1="m.x"
                y1="0"
                :x2="m.x"
                :y2="CHART_H"
                stroke="var(--vp-c-divider)"
                stroke-width="0.5"
              />
              <!-- Baseline (dashed) -->
              <path
                :d="buildPath(sig.baseline, getSignalBounds(sig.baseline, sig.intervention).min, getSignalBounds(sig.baseline, sig.intervention).max)"
                fill="none"
                stroke="var(--vp-c-text-3)"
                stroke-width="1.5"
                stroke-dasharray="4 3"
              />
              <!-- Intervention (solid accent) -->
              <path
                :d="buildPath(sig.intervention, getSignalBounds(sig.baseline, sig.intervention).min, getSignalBounds(sig.baseline, sig.intervention).max)"
                fill="none"
                :stroke="activePersona?.accent || 'var(--vp-c-brand-1)'"
                stroke-width="2.5"
              />
              <!-- Hover crosshair -->
              <line
                v-if="hoveredX !== null"
                :x1="hoveredX"
                y1="0"
                :x2="hoveredX"
                :y2="CHART_H"
                stroke="var(--vp-c-text-2)"
                stroke-width="0.5"
                stroke-dasharray="2 2"
              />
            </svg>
            <!-- X-axis time labels -->
            <div class="chart-x-axis">
              <span
                v-for="m in getHourMarkers(activePersona.sim.startMinuteOfDay, activePersona.sim.hours)"
                :key="m.label"
                class="x-label"
                :style="{ left: (m.x / CHART_W * 100) + '%' }"
                >{{ m.label }}</span
              >
            </div>
          </div>

          <!-- Add signal card -->
          <div
            class="chart-card add-signal-card"
            @click="showSignalPicker = !showSignalPicker"
          >
            <div class="add-signal-content">
              <span class="add-signal-icon">+</span>
              <span>Add Signal</span>
            </div>
          </div>
        </div>

        <!-- Signal picker popover -->
        <div v-if="showSignalPicker" class="picker-popover signal-picker">
          <input
            v-model="signalSearch"
            placeholder="Search signals..."
            class="picker-search"
          />
          <div class="picker-list">
            <div
              v-for="(items, group) in groupedAvailableSignals"
              :key="group"
              class="picker-group"
            >
              <div class="picker-group-label">{{ group }}</div>
              <button
                v-for="s in items"
                :key="s.key"
                class="picker-item"
                @click="addSignal(s.key)"
              >
                <span class="picker-item-name">{{ s.label }}</span>
                <span class="picker-item-desc"
                  >{{ s.description?.slice(0, 60)







                  }}{{ s.description?.length > 60 ? '...' : '' }}</span
                >
              </button>
            </div>
            <div
              v-if="!Object.keys(groupedAvailableSignals).length"
              class="picker-empty"
            >
              No matching signals
            </div>
          </div>
        </div>
      </div>
    </Transition>
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

/* --- Transitions --- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from { opacity: 0; transform: translateY(8px); }
.fade-leave-to { opacity: 0; transform: translateY(-4px); }

/* --- Persona Grid --- */
.grid-header {
  text-align: center;
  margin-bottom: 1.5rem;
}
.grid-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.35rem;
  color: var(--vp-c-text-1);
}
.grid-sub {
  margin: 0;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 0.75rem;
}
@media (max-width: 640px) {
  .grid-cards { grid-template-columns: 1fr; }
}

.persona-card {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  width: 100%;
}
.persona-card:hover {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent), 0 2px 8px rgba(0,0,0,0.06);
  transform: translateY(-1px);
}

.persona-icon {
  font-size: 1.75rem;
  flex-shrink: 0;
  line-height: 1;
}

.persona-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.persona-headline {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0;
}

.persona-subhead {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  margin: 0;
  line-height: 1.35;
}

.persona-signals-preview {
  display: flex;
  gap: 0.3rem;
  margin-top: 0.35rem;
  flex-wrap: wrap;
}
.signal-pill-preview {
  font-size: 0.65rem;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-3);
  border: 1px solid var(--vp-c-divider);
}

/* --- Detail View --- */
.persona-view {
  position: relative;
}

.detail-header {
  margin-bottom: 1rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-bottom: 0.5rem;
}
.back-btn:hover { color: var(--vp-c-text-1); }

.detail-headline {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.detail-icon { font-size: 1.75rem; }

.detail-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.detail-sub {
  margin: 0;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}

/* --- Condition Bar --- */
.condition-bar, .intervention-bar {
  margin-bottom: 0.75rem;
  position: relative;
}

.bar-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--vp-c-text-3);
  margin-bottom: 0.35rem;
}

.condition-pills {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: flex-start;
}

.condition-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.condition-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.15s;
}
.condition-pill.active {
  border-color: var(--accent, var(--vp-c-brand-1));
  background: color-mix(in srgb, var(--accent, var(--vp-c-brand-1)) 10%, var(--vp-c-bg));
  color: var(--vp-c-text-1);
}
.pill-toggle {
  font-size: 0.6rem;
  font-weight: 700;
  opacity: 0.5;
}

.condition-params, .chip-dose-panel {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding: 0.25rem 0;
}

.param-inline, .dose-param {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
}

.param-label {
  color: var(--vp-c-text-3);
  white-space: nowrap;
}

.param-slider {
  width: 80px;
  height: 4px;
  accent-color: var(--accent, var(--vp-c-brand-1));
}
.subject-slider {
  width: 120px;
}

.param-value {
  color: var(--vp-c-text-2);
  font-weight: 600;
  font-size: 0.72rem;
  min-width: 2rem;
}

.param-select {
  font-size: 0.72rem;
  padding: 0.15rem 0.3rem;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.subject-slider-group {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
}

.cycle-phase {
  font-size: 0.7rem;
  color: var(--accent, var(--vp-c-brand-1));
  font-weight: 600;
  padding-left: 0.25rem;
}

/* --- Intervention Chips --- */
.intervention-chips {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  align-items: flex-start;
}

.intervention-chip-group {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.intervention-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  font-size: 0.76rem;
  cursor: pointer;
  transition: all 0.15s;
  color: var(--vp-c-text-2);
}
.intervention-chip.active {
  background: color-mix(in srgb, var(--accent, var(--vp-c-brand-1)) 12%, var(--vp-c-bg));
  border-color: var(--accent, var(--vp-c-brand-1));
  color: var(--vp-c-text-1);
}
.intervention-chip.inactive {
  opacity: 0.55;
}

.chip-icon { font-size: 0.85rem; }
.chip-name.strikethrough { text-decoration: line-through; }

.chip-expand, .chip-remove {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--vp-c-text-3);
  padding: 0 0.1rem;
  font-size: 0.8rem;
  line-height: 1;
  display: inline-flex;
  align-items: center;
}
.chip-expand:hover, .chip-remove:hover { color: var(--vp-c-text-1); }

.add-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  border: 1px dashed var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-3);
  font-size: 0.76rem;
  cursor: pointer;
  transition: all 0.15s;
}
.add-chip:hover {
  border-color: var(--accent, var(--vp-c-brand-1));
  color: var(--vp-c-text-1);
}

/* --- Picker Popover --- */
.picker-popover {
  position: absolute;
  z-index: 10;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 300px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.picker-search {
  padding: 0.5rem 0.75rem;
  border: none;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-size: 0.82rem;
  outline: none;
  color: var(--vp-c-text-1);
}

.picker-list {
  overflow-y: auto;
  max-height: 250px;
  padding: 0.25rem;
}

.picker-group-label {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--vp-c-text-3);
  padding: 0.4rem 0.5rem 0.2rem;
}

.picker-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  width: 100%;
  padding: 0.35rem 0.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.78rem;
  color: var(--vp-c-text-1);
  border-radius: 4px;
  text-align: left;
}
.picker-item:hover {
  background: var(--vp-c-bg-soft);
}

.picker-item-icon { font-size: 0.9rem; }

.picker-item-desc {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  margin-left: auto;
  max-width: 50%;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.picker-empty {
  padding: 1rem;
  text-align: center;
  color: var(--vp-c-text-3);
  font-size: 0.82rem;
}

.signal-picker {
  margin-top: 0.5rem;
  position: relative;
  top: 0;
}

/* --- Legend --- */
.legend {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}

/* --- Chart Grid --- */
.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}
@media (max-width: 640px) {
  .chart-grid { grid-template-columns: 1fr; }
}

.chart-card {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.6rem 0.6rem 0.4rem;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.chart-label {
  font-size: 0.73rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.chart-remove {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--vp-c-text-3);
  font-size: 0.9rem;
  padding: 0;
  line-height: 1;
  opacity: 0;
  transition: opacity 0.15s;
}
.chart-card:hover .chart-remove { opacity: 1; }
.chart-remove:hover { color: var(--vp-c-text-1); }

.mini-chart {
  width: 100%;
  height: auto;
  display: block;
  cursor: crosshair;
}

.chart-x-axis {
  position: relative;
  height: 0.9rem;
  margin-top: 0.1rem;
}
.x-label {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.6rem;
  color: var(--vp-c-text-3);
}

/* --- Add Signal Card --- */
.add-signal-card {
  display: flex;
  align-items: center;
  justify-content: center;
  border-style: dashed;
  cursor: pointer;
  min-height: 120px;
  transition: all 0.15s;
}
.add-signal-card:hover {
  border-color: var(--accent, var(--vp-c-brand-1));
  color: var(--vp-c-text-1);
}
.add-signal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  color: var(--vp-c-text-3);
  font-size: 0.8rem;
}
.add-signal-icon {
  font-size: 1.5rem;
  line-height: 1;
}
</style>
