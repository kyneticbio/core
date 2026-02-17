export interface PersonaCondition {
  key: string
  enabledByDefault: boolean
  defaultParams: Record<string, any>
}

export interface PersonaIntervention {
  key: string
  enabledByDefault: boolean
  defaultParams: Record<string, any>
}

export interface PersonaSignal {
  key: string
  label: string
}

export interface PersonaSubjectOverrides {
  sex?: 'male' | 'female'
  cycleDay?: number
  weight?: number
}

export interface PersonaDef {
  id: string
  icon: string
  headline: string
  subhead: string
  accent: string
  conditions: PersonaCondition[]
  interventions: PersonaIntervention[]
  signals: PersonaSignal[]
  subjectOverrides?: PersonaSubjectOverrides
  subjectSliders?: Array<{
    key: string
    label: string
    min: number
    max: number
    step: number
    default: number
    unit: string
  }>
  sim: {
    hours: number
    startMinuteOfDay: number
    stepMin?: number // default 5
  }
}

export const PERSONAS: PersonaDef[] = [
  // 1. Focus Seeker
  {
    id: 'focus',
    icon: '\u{1F9E0}',
    headline: "My brain won't cooperate",
    subhead: 'See how ADHD changes your neurochemistry \u2014 and what actually helps.',
    accent: '#ff6b6b',
    conditions: [
      { key: 'adhd', enabledByDefault: true, defaultParams: { severity: 0.6 } },
      { key: 'comt', enabledByDefault: false, defaultParams: { genotype: 0 } },
    ],
    interventions: [
      { key: 'caffeine', enabledByDefault: true, defaultParams: { mg: 200 } },
      { key: 'adderallIR', enabledByDefault: true, defaultParams: { mg: 10 } },
      { key: 'lTyrosine', enabledByDefault: false, defaultParams: { mg: 500 } },
    ],
    signals: [
      { key: 'dopamine', label: 'Focus Drive' },
      { key: 'norepi', label: 'Alertness' },
      { key: 'cortisol', label: 'Stress' },
    ],
    sim: { hours: 8, startMinuteOfDay: 480 },
  },

  // 2. Calm Seeker
  {
    id: 'calm',
    icon: '\u{1F9D8}',
    headline: "My mind won't quiet down",
    subhead: 'Watch your stress chemistry respond to different calming strategies.',
    accent: '#7c3aed',
    conditions: [
      { key: 'anxiety', enabledByDefault: true, defaultParams: { reactivity: 0.5 } },
      { key: 'depression', enabledByDefault: false, defaultParams: { severity: 0.5 } },
    ],
    interventions: [
      { key: 'ashwagandha', enabledByDefault: true, defaultParams: { mg: 600 } },
      { key: 'ltheanine', enabledByDefault: true, defaultParams: { mg: 200 } },
      { key: 'breathwork', enabledByDefault: true, defaultParams: { type: 'calm', intensity: 1.0 } },
      { key: 'lexapro', enabledByDefault: false, defaultParams: { mg: 10 } },
    ],
    signals: [
      { key: 'cortisol', label: 'Stress Level' },
      { key: 'gaba', label: 'Calm Signal' },
      { key: 'serotonin', label: 'Mood' },
    ],
    sim: { hours: 8, startMinuteOfDay: 480 },
  },

  // 3. Sleep Optimizer
  {
    id: 'sleep',
    icon: '\u{1F319}',
    headline: "I can't shut off at night",
    subhead: 'Model your evening chemistry and find what tips the balance toward sleep.',
    accent: '#1e40af',
    conditions: [
      { key: 'insomnia', enabledByDefault: true, defaultParams: { severity: 0.4 } },
    ],
    interventions: [
      { key: 'melatonin', enabledByDefault: true, defaultParams: { mg: 3 } },
      { key: 'magnesium', enabledByDefault: true, defaultParams: { mg: 400 } },
      { key: 'ashwagandha', enabledByDefault: false, defaultParams: { mg: 600 } },
    ],
    signals: [
      { key: 'melatonin', label: 'Sleep Signal' },
      { key: 'cortisol', label: 'Stress' },
      { key: 'orexin', label: 'Wake Drive' },
    ],
    sim: { hours: 6, startMinuteOfDay: 1260 },
  },

  // 4. Body Builder
  {
    id: 'strength',
    icon: '\u{1F4AA}',
    headline: 'I want to maximize every rep',
    subhead: 'See how training, nutrition, and recovery stack at the molecular level.',
    accent: '#f59e0b',
    conditions: [],
    interventions: [
      { key: 'exercise_resistance', enabledByDefault: true, defaultParams: { intensity: 1.0 } },
      { key: 'creatine', enabledByDefault: true, defaultParams: { grams: 5 } },
      { key: 'coldExposure', enabledByDefault: false, defaultParams: { temperature: 10, intensity: 1.0 } },
    ],
    signals: [
      { key: 'testosterone', label: 'Testosterone' },
      { key: 'growthHormone', label: 'Growth Hormone' },
      { key: 'mtor', label: 'Muscle Growth' },
      { key: 'cortisol', label: 'Catabolic Stress' },
    ],
    subjectSliders: [
      { key: 'weight', label: 'Body Weight', min: 60, max: 120, step: 5, default: 80, unit: 'kg' },
    ],
    sim: { hours: 8, startMinuteOfDay: 360 },
  },

  // 5. Weight Manager
  {
    id: 'weight',
    icon: '\u2696\uFE0F',
    headline: 'I want to understand my hunger',
    subhead: 'See how GLP-1 drugs, meals, and metabolism interact over days.',
    accent: '#10b981',
    conditions: [
      { key: 'pcos', enabledByDefault: false, defaultParams: { severity: 0.5 } },
    ],
    interventions: [
      { key: 'semaglutide', enabledByDefault: true, defaultParams: { mg: 0.5 } },
      { key: 'tirzepatide', enabledByDefault: false, defaultParams: { mg: 5 } },
      { key: 'chromium', enabledByDefault: false, defaultParams: { mcg: 500 } },
    ],
    signals: [
      { key: 'appetite', label: 'Hunger' },
      { key: 'glp1', label: 'Fullness Signal' },
      { key: 'glucose', label: 'Blood Sugar' },
      { key: 'insulin', label: 'Insulin' },
    ],
    sim: { hours: 48, startMinuteOfDay: 480, stepMin: 15 },
  },

  // 6. Cycle Tracker
  {
    id: 'cycle',
    icon: '\u{1F338}',
    headline: 'My body changes every week',
    subhead: 'Watch estrogen, progesterone, and mood shift across your cycle.',
    accent: '#ec4899',
    conditions: [
      { key: 'pcos', enabledByDefault: false, defaultParams: { severity: 0.5 } },
    ],
    interventions: [
      { key: 'magnesium', enabledByDefault: true, defaultParams: { mg: 400 } },
      { key: 'inositol', enabledByDefault: false, defaultParams: { mg: 2000 } },
      { key: 'omega3', enabledByDefault: false, defaultParams: { mg: 2000 } },
      { key: 'bComplex', enabledByDefault: false, defaultParams: { b12_mcg: 500, folate_mcg: 400 } },
    ],
    signals: [
      { key: 'estrogen', label: 'Estrogen' },
      { key: 'progesterone', label: 'Progesterone' },
      { key: 'serotonin', label: 'Mood' },
      { key: 'cortisol', label: 'Stress' },
    ],
    subjectOverrides: { sex: 'female', cycleDay: 14 },
    subjectSliders: [
      { key: 'cycleDay', label: 'Cycle Day', min: 1, max: 28, step: 1, default: 14, unit: 'day' },
    ],
    sim: { hours: 8, startMinuteOfDay: 480 },
  },

  // 7. Biohacker
  {
    id: 'biohacker',
    icon: '\u26A1',
    headline: 'I want to see everything',
    subhead: 'The sandbox. Build your stack, toggle your genetics, watch every signal.',
    accent: '#00d4ff',
    conditions: [
      { key: 'adhd', enabledByDefault: false, defaultParams: { severity: 0.5 } },
      { key: 'anxiety', enabledByDefault: false, defaultParams: { reactivity: 0.5 } },
      { key: 'comt', enabledByDefault: false, defaultParams: { genotype: 0 } },
      { key: 'mthfr', enabledByDefault: false, defaultParams: { genotype: 0 } },
      { key: 'insomnia', enabledByDefault: false, defaultParams: { severity: 0.4 } },
      { key: 'autism', enabledByDefault: false, defaultParams: { eibalance: 0.5 } },
    ],
    interventions: [
      { key: 'caffeine', enabledByDefault: true, defaultParams: { mg: 100 } },
      { key: 'ltheanine', enabledByDefault: true, defaultParams: { mg: 200 } },
      { key: 'alphaGPC', enabledByDefault: false, defaultParams: { mg: 300 } },
      { key: 'sunlight_viewing', enabledByDefault: true, defaultParams: { lux: 10000, time: 'sunrise' } },
      { key: 'coldExposure', enabledByDefault: false, defaultParams: { temperature: 10, intensity: 1.0 } },
    ],
    signals: [
      { key: 'dopamine', label: 'Dopamine' },
      { key: 'cortisol', label: 'Cortisol' },
      { key: 'energy', label: 'Energy' },
      { key: 'hrv', label: 'HRV' },
    ],
    sim: { hours: 12, startMinuteOfDay: 420 },
  },
]
