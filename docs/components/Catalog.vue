<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  type: {
    type: String,
    default: 'Signal'
  }
})

const search = ref('')
const selectedItem = ref(null)

const filteredItems = computed(() => {
  if (!search.value) return props.items
  const s = search.value.toLowerCase()
  return props.items.filter(item => 
    item.label.toLowerCase().includes(s) || 
    item.key.toLowerCase().includes(s) ||
    (item.description && item.description.toLowerCase().includes(s))
  )
})
</script>

<template>
  <div class="catalog-container">
    <div class="search-bar">
      <input v-model="search" :placeholder="`Search ${type}s...`" class="search-input" />
    </div>

    <div class="catalog-grid">
      <div v-for="item in filteredItems" :key="item.key" class="catalog-card">
        <div class="card-header">
          <span class="card-label">
            <span v-if="item.icon" class="card-icon">{{ item.icon }}</span>
            {{ item.label }}
          </span>
          <code class="card-key">{{ item.key }}</code>
        </div>
        <p class="card-description">{{ item.description }}</p>
        
        <div v-if="item.categories?.length || item.goals?.length" class="card-tags">
          <div v-if="item.categories?.length" class="tag-group">
            <span v-for="cat in item.categories" :key="cat" class="tag category">{{ cat }}</span>
          </div>
          <div v-if="item.goals?.length" class="tag-group">
            <span v-for="goal in item.goals" :key="goal" class="tag goal">{{ goal }}</span>
          </div>
        </div>

        <div class="card-footer">
          <span v-if="item.unit" class="card-unit">Unit: {{ item.unit }}</span>
          <span v-if="item.initialValue !== undefined" class="card-initial">Initial: {{ item.initialValue }}</span>
          <span v-if="item.isPremium" class="card-badge premium">Premium</span>
          <button @click="selectedItem = item" class="view-code-btn">View Definition</button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="selectedItem" class="modal-overlay" @click="selectedItem = null">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedItem.label }} Definition</h3>
          <button class="close-btn" @click="selectedItem = null">&times;</button>
        </div>
        <div class="modal-body">
          <pre class="code-block"><code>{{ selectedItem.raw }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.catalog-container {
  margin-top: 2rem;
}
.search-bar {
  margin-bottom: 1.5rem;
}
.search-input {
  width: 100%;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
}
.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}
.catalog-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.25rem;
  background: var(--vp-c-bg-soft);
  transition: transform 0.2s, border-color 0.2s;
}
.catalog-card:hover {
  border-color: var(--vp-c-brand);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}
.card-label {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--vp-c-text-1);
  display: flex;
  align-items: center;
}
.card-icon {
  margin-right: 0.5rem;
}
.card-key {
  font-size: 0.8rem;
  opacity: 0.7;
}
.card-description {
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-footer {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}
.card-unit, .card-initial {
  background: var(--vp-c-default-soft);
  padding: 2px 6px;
  border-radius: 4px;
}
.card-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
}
.card-badge.premium {
  background: var(--vp-c-warning-soft);
  color: var(--vp-c-warning-1);
}

.card-tags {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.tag {
  font-size: 0.7rem;
  padding: 1px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.tag.category {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.tag.goal {
  background: var(--vp-c-important-soft);
  color: var(--vp-c-important-1);
}

.view-code-btn {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--vp-c-brand);
  cursor: pointer;
  border: 1px solid var(--vp-c-brand-soft);
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--vp-c-brand-soft);
  transition: all 0.2s;
}

.view-code-btn:hover {
  background: var(--vp-c-brand);
  color: white;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-content {
  background: var(--vp-c-bg);
  width: 100%;
  max-width: 800px;
  max-height: 80vh;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  border: 1px solid var(--vp-c-divider);
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.7;
}

.close-btn:hover {
  opacity: 1;
}

.modal-body {
  padding: 1.5rem;
  overflow: auto;
}

.code-block {
  margin: 0;
  background: var(--vp-c-bg-alt);
  padding: 1rem;
  border-radius: 8px;
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
