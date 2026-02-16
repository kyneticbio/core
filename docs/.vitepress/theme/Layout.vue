<script setup>
import DefaultTheme from 'vitepress/theme'
import SimulatorDemo from '../../components/SimulatorDemo.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #home-hero-image>
      <div class="hero-demo-container">
        <SimulatorDemo />
      </div>
    </template>
  </Layout>
</template>

<style scoped>
.hero-demo-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  transform: scale(0.9);
  transform-origin: center right;
}

@media (max-width: 960px) {
  .hero-demo-container {
    transform: scale(1);
    margin-top: 2rem;
  }
}

:deep(.simulator-demo) {
  padding: 1rem;
  margin: 0;
  background: var(--vp-c-bg-alt);
}

:deep(.scenario-tabs) {
  gap: 0.35rem;
}

:deep(.scenario-tab) {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
}

:deep(.chart-grid) {
  gap: 0.75rem;
}

:deep(.chart-card) {
  padding: 0.5rem 0.5rem 0.35rem;
}
</style>
