import { CONDITION_LIBRARY } from '../../src/endogenous/conditions/index'

export default {
  load() {
    return CONDITION_LIBRARY.map(def => ({
      key: def.key,
      label: def.label,
      category: def.category,
      description: def.description.physiology,
      application: def.description.application,
      paramsCount: def.params.length,
      raw: JSON.stringify(def, (key, value) => {
        if (typeof value === 'function') {
          return value.toString();
        }
        return value;
      }, 2)
    }))
  }
}
