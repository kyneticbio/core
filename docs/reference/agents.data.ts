import { Agents } from '../../src/exogenous/agents/index'

export default {
  load() {
    return Object.entries(Agents).map(([key, def]) => ({
      key: key,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      cid: (def as any).metadata?.cid,
      cas: (def as any).metadata?.cas,
      raw: JSON.stringify(def, (key, value) => {
        if (typeof value === 'function') {
          return value.toString();
        }
        return value;
      }, 2)
    }))
  }
}
