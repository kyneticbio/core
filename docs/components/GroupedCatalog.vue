<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  }
})

const viewMode = ref('category') // 'category' or 'goal'
const search = ref('')
const selectedItem = ref(null)

const allCategories = computed(() => {
  const cats = new Set()
  props.items.forEach(item => {
    if (item.categories?.length) {
      item.categories.forEach(c => cats.add(c))
    } else {
      cats.add('Uncategorized')
    }
  })
  return Array.from(cats).sort()
})

const allGoals = computed(() => {
  const goals = new Set()
  props.items.forEach(item => {
    if (item.goals?.length) {
      item.goals.forEach(g => goals.add(g))
    } else {
      goals.add('General')
    }
  })
  return Array.from(goals).sort()
})

const filteredItems = computed(() => {
  if (!search.value) return props.items
  const s = search.value.toLowerCase()
  return props.items.filter(item => 
    item.label.toLowerCase().includes(s) || 
    item.key.toLowerCase().includes(s) ||
    item.description.toLowerCase().includes(s)
  )
})

const groupedItems = computed(() => {
  const groups = {}
  const list = viewMode.value === 'category' ? allCategories.value : allGoals.value
  const keyField = viewMode.value === 'category' ? 'categories' : 'goals'
  const fallback = viewMode.value === 'category' ? 'Uncategorized' : 'General'

  list.forEach(groupName => {
    groups[groupName] = filteredItems.value.filter(item => {
      if (groupName === fallback && (!item[keyField] || item[keyField].length === 0)) {
        return true
      }
      return item[keyField]?.includes(groupName)
    })
  })

  // Remove empty groups
  return Object.fromEntries(Object.entries(groups).filter(([_, items]) => items.length > 0))
})
</script>

<template>
  <div class="grouped-catalog">
    <div class="controls">
      <div class="view-switcher">
        <button 
          :class="{ active: viewMode === 'category' }" 
          @click="viewMode = 'category'"
        >By Category</button>
        <button 
          :class="{ active: viewMode === 'goal' }" 
          @click="viewMode = 'goal'"
        >By Goal</button>
      </div>
      <input v-model="search" :placeholder="`Search interventions...`" class="search-input" />
    </div>

    <div v-for="(items, groupName) in groupedItems" :key="groupName" class="group-section">
      <h2 class="group-title">{{ groupName }}</h2>
      <div class="catalog-grid">
        <div v-for="item in items" :key="item.key" class="catalog-card">
          <div class="card-header">
            <span class="card-label">
              <span v-if="item.icon" class="card-icon">{{ item.icon }}</span>
              {{ item.label }}
            </span>
            <div class="card-header-right">
              <code class="card-key">{{ item.key }}</code>
              <button @click="selectedItem = item" class="view-code-btn">Source</button>
            </div>
          </div>
          <p class="card-description">{{ item.description }}</p>
          <div class="card-tags">
            <span v-for="cat in item.categories" :key="cat" class="tag category">{{ cat }}</span>
            <span v-for="goal in item.goals" :key="goal" class="tag goal">{{ goal }}</span>
          </div>
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
.grouped-catalog {
  margin-top: 2rem;
}
.controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  position: sticky;
  top: var(--vp-nav-height);
  background: var(--vp-c-bg);
  padding: 1rem 0;
  z-index: 10;
}
.view-switcher {
  display: flex;
  gap: 0.5rem;
}
.view-switcher button {
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  transition: all 0.2s;
}
.view-switcher button.active {
  background: var(--vp-c-brand);
  color: white;
  border-color: var(--vp-c-brand);
}
.search-input {
  width: 100%;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
}
.group-section {
  margin-bottom: 3rem;
}
.group-title {
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: var(--vp-c-brand);
}
.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}
.catalog-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.25rem;
  background: var(--vp-c-bg-soft);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}
.card-label {
  font-weight: 600;
  color: var(--vp-c-text-1);
  display: flex;
  align-items: center;
}
.card-icon {
  margin-right: 0.5rem;
}
.card-key {
  font-size: 0.7rem;
  opacity: 0.6;
}
.card-description {
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  margin-bottom: 1rem;
}
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.tag {
  font-size: 0.65rem;
  padding: 1px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}
.tag.category {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}
.tag.goal {
  background: var(--vp-c-important-soft);
  color: var(--vp-c-important-1);
}

.card-header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.view-code-btn {
  font-size: 0.65rem;
  color: var(--vp-c-brand);
  cursor: pointer;
  border: 1px solid var(--vp-c-brand-soft);
  padding: 1px 6px;
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
