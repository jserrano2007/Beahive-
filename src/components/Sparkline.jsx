function Sparkline({ values = [], stroke = 'var(--leaf)', width = 64, height = 24 }) {
  const clean = values.filter((value) => typeof value === 'number' && !Number.isNaN(value))

  if (clean.length < 2) {
    return <svg className="sparkline" width={width} height={height} aria-hidden="true" />
  }

  const min = Math.min(...clean)
  const max = Math.max(...clean)
  const range = max - min || 1
  const stepX = width / (clean.length - 1)

  const points = clean
    .map((value, index) => {
      const x = index * stepX
      const y = height - ((value - min) / range) * height
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg
      className="sparkline"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default Sparkline
