import { BIOLOGICAL_SYSTEMS } from '../../src/endogenous/systems/index'

export default {
  load() {
    return BIOLOGICAL_SYSTEMS.map(def => ({
      key: def.key || (def as any).id,
      label: def.label,
      icon: (def as any).icon,
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