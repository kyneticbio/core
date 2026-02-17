import { ref } from 'vue'

export const CHART_W = 300
export const CHART_H = 120
const PAD_TOP = 4
const PAD_BOT = 4
const DRAW_H = CHART_H - PAD_TOP - PAD_BOT

export function useChartRenderer() {
  const hoveredX = ref<number | null>(null)

  function buildPath(data: Array<{ x: number; y: number }>, minVal: number, maxVal: number): string {
    if (!data.length) return ''
    const range = maxVal - minVal || 1
    const maxX = data[data.length - 1].x || 1
    const points = data.map(d => {
      const px = (d.x / maxX) * CHART_W
      const py = PAD_TOP + DRAW_H - ((d.y - minVal) / range) * DRAW_H
      return `${px.toFixed(1)},${py.toFixed(1)}`
    })
    return `M ${points.join(' L ')}`
  }

  function getSignalBounds(baseline: Array<{ x: number; y: number }>, intervention: Array<{ x: number; y: number }>) {
    const allVals = [...baseline.map(d => d.y), ...intervention.map(d => d.y)]
    const min = Math.min(...allVals)
    const max = Math.max(...allVals)
    const pad = (max - min) * 0.1 || 0.5
    return { min: min - pad, max: max + pad }
  }

  function formatHour(minuteOfDay: number): string {
    const h = Math.floor(minuteOfDay / 60) % 24
    if (h === 0) return '12a'
    if (h < 12) return `${h}a`
    if (h === 12) return '12p'
    return `${h - 12}p`
  }

  function getHourMarkers(startMinuteOfDay: number, hours: number) {
    const markers: Array<{ x: number; label: string }> = []
    const totalMin = hours * 60
    const step = hours > 24 ? 360 : 60 // 6h markers for multi-day, 1h for normal
    for (let m = 0; m <= totalMin; m += step) {
      markers.push({
        x: (m / totalMin) * CHART_W,
        label: formatHour(startMinuteOfDay + m),
      })
    }
    return markers
  }

  function getValueAtX(data: Array<{ x: number; y: number }>, xPos: number, totalMin: number): number | null {
    if (!data.length) return null
    const targetX = (xPos / CHART_W) * totalMin
    // Find closest data point
    let closest = data[0]
    let closestDist = Math.abs(data[0].x - targetX)
    for (let i = 1; i < data.length; i++) {
      const dist = Math.abs(data[i].x - targetX)
      if (dist < closestDist) {
        closest = data[i]
        closestDist = dist
      }
    }
    return closest.y
  }

  return {
    hoveredX,
    buildPath,
    getSignalBounds,
    formatHour,
    getHourMarkers,
    getValueAtX,
    CHART_W,
    CHART_H,
  }
}
