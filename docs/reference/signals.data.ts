import { SIGNAL_DEFINITIONS_MAP } from '../../src/endogenous/signals/index'

export default {
  load() {
    return Object.values(SIGNAL_DEFINITIONS_MAP).map(def => ({
      key: def.key,
      label: def.label,
      unit: def.unit,
      description: def.description,
      initialValue: def.initialValue,
      isPremium: def.isPremium,
      raw: JSON.stringify(def, (key, value) => {
        if (typeof value === 'function') {
          return value.toString();
        }
        return value;
      }, 2)
    }))
  }
}
