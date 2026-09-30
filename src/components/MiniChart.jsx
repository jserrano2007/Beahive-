// Small single-series chart for report cards: a line (optionally over a
// shaded target band) or baseline-anchored bars. Each point carries a
// <title> so hovering / long-pressing shows its value.

const WIDTH = 240
const HEIGHT = 56
const PAD = 4

function MiniChart({ points, type = 'line', band = null, label, formatValue = String, color = 'var(--leaf)' }) {
  const clean = points.filter((point) => typeof point.value === 'number' && !Number.isNaN(point.value))
  if (clean.length === 0) return null

  const values = clean.map((point) => point.value)
  const lows = [...values, ...(band ?? [])]
  const min = type === 'bars' ? 0 : Math.min(...lows)
  const max = Math.max(...values, ...(band ?? []))
  const span = max - min || 1
  const y = (value) => PAD + (HEIGHT - PAD * 2) * (1 - (value - min) / span)
  const innerWidth = WIDTH - PAD * 2

  return (
    <figure className="mini-chart">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={label} preserveAspectRatio="none">
        {band && (
          <rect
            x={PAD}
            width={innerWidth}
            y={y(band[1])}
            height={Math.max(1, y(band[0]) - y(band[1]))}
            className="mini-chart-band"
          />
        )}
        <line x1={PAD} x2={WIDTH - PAD} y1={HEIGHT - PAD} y2={HEIGHT - PAD} className="mini-chart-axis" />

        {type === 'bars'
          ? clean.map((point, index) => {
              const slot = innerWidth / clean.length
              const barWidth = Math.max(2, Math.min(16, slot - 2))
              const top = y(point.value)
              return (
                <rect
                  key={`${point.label}-${index}`}
                  x={PAD + slot * index + (slot - barWidth) / 2}
                  y={top}
                  width={barWidth}
                  height={Math.max(point.value > 0 ? 2 : 0, HEIGHT - PAD - top)}
                  rx={Math.min(4, barWidth / 2)}
                  fill={color}
                >
                  <title>{`${point.label}: ${formatValue(point.value)}`}</title>
                </rect>
              )
            })
          : (() => {
              const step = clean.length > 1 ? innerWidth / (clean.length - 1) : 0
              const coords = clean.map((point, index) => [PAD + step * index, y(point.value)])
              return (
                <>
                  {clean.length > 1 && (
                    <polyline
                      points={coords.map(([cx, cy]) => `${cx.toFixed(1)},${cy.toFixed(1)}`).join(' ')}
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  )}
                  {coords.map(([cx], index) => (
                    <rect
                      key={clean[index].label}
                      x={cx - Math.max(step, 8) / 2}
                      y={0}
                      width={Math.max(step, 8)}
                      height={HEIGHT}
                      fill="transparent"
                    >
                      <title>{`${clean[index].label}: ${formatValue(clean[index].value)}`}</title>
                    </rect>
                  ))}
                  {clean.length === 1 && <circle cx={coords[0][0]} cy={coords[0][1]} r="4" fill={color} />}
                </>
              )
            })()}
      </svg>
    </figure>
  )
}

export default MiniChart
