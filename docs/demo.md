<script setup>
import SimulatorDemo from './components/SimulatorDemo.vue'
</script>

# Try It Yourself

Curious what happens when you take 200mg of caffeine on an empty stomach? Want to see how ADHD changes the dopamine response? This demo runs the real KyneticBio engine directly in your browser - no account needed.

**Things to try:**

- Add caffeine and watch dopamine spike while adenosine gets blocked
- Enable ADHD and compare the dopamine baseline to a neurotypical profile
- Stack caffeine + L-theanine and see how the signals differ from caffeine alone
- Change the subject's weight and watch how drug concentrations shift

<SimulatorDemo />

## How It Works

This isn't a toy - it's the same engine that powers Kynetic Studio:

1. **Real pharmacokinetics** - drug absorption, distribution, and clearance modeled with the same equations used in clinical pharmacology.
2. **Your physiology matters** - age, weight, sex, and optional bloodwork labs scale metabolic rates, volumes of distribution, and drug clearance. A subject with impaired kidney function (low eGFR) will clear renally-eliminated drugs slower than someone with normal function.
3. **Conditions change the game** - enabling ADHD doesn't just lower a number. It modifies receptor densities and transporter activity, which changes how every intervention hits.
4. **Signals interact** - cortisol affects dopamine. Insulin affects glucose. Nothing happens in isolation.

---

### Want the full experience?

This demo shows a slice of what's possible. **[Kynetic Studio](https://physim.jeffjassky.com)** gives you:

- **Multi-chart views** for comparing dozens of signals simultaneously
- **AI Chat** for asking questions about your simulation results
- **Drag-and-drop timeline** for building complex daily protocols
- **Scenario comparison** to test different stacks side-by-side
