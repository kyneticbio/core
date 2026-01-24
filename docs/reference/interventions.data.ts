import { INTERVENTIONS } from '../../src/exogenous/interventions/index'

export default {
  load() {
    return INTERVENTIONS.map(def => ({
      key: def.key,
      label: def.label,
      description: def.notes || 'No description available.',
      categories: def.categories || [],
      goals: def.goals || [],
      paramsCount: def.params ? def.params.length : 0,
      raw: JSON.stringify(def, (key, value) => {
        if (typeof value === 'function') {
          return value.toString();
        }
        return value;
      }, 2)
    }))
  }
}
