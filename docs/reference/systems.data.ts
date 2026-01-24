import { BIOLOGICAL_SYSTEMS } from '../../src/endogenous/systems/index'

export default {
  load() {
    return BIOLOGICAL_SYSTEMS.map(def => ({
      key: def.key,
      label: def.label,
      description: def.description,
      signalsCount: def.signals.length,
      raw: JSON.stringify(def, (key, value) => {
        if (typeof value === 'function') {
          return value.toString();
        }
        return value;
      }, 2)
    }))
  }
}
