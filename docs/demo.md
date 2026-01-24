<script setup>
import SimulatorDemo from './components/SimulatorDemo.vue'
</script>

# Interactive Demo

This demo runs the **KyneticBio Core** engine directly in your browser. You can adjust the subject's biometrics, enable neurophysiological conditions, and apply interventions to see how they affect various physiological signals over an 8-hour period.

<SimulatorDemo />

## How it works
1. **Engine**: The simulation uses the actual `integrateStep` function from the core library.
2. **Subject**: Biometrics like age and weight scale the volumes of distribution and metabolic rates.
3. **Conditions**: Enabling a condition like ADHD modifies receptor densities and baseline signal levels.
4. **Interventions**: The engine calculates the pharmacokinetics (absorption/clearance) and pharmacodynamics (receptor interaction) for each active agent.

---

### Want more features?
Try **[Kynetic Studio](https://physim.jeffjassky.com)**, the full-featured commercial interface which includes:
- **Multi-chart views** for comparing dozens of signals.
- **AI Chat Integration** for analyzing your physiological state.
- **Drag-and-drop timeline** for complex scenario building.
- **Data persistence** and multi-scenario comparison.

