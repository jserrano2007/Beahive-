// Beahive brand mark: a rounded honeycomb hex cradling a leaf sprout.
// One inline SVG so it inherits `color` from its container (theme-friendly).

function BeahiveLogo({ size = 32, showWordmark = false, className = '', title = 'Beahive' }) {
  return (
    <span
      className={`beahive-logo${className ? ` ${className}` : ''}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        role="img"
        aria-label={title}
      >
        <title>{title}</title>
        <path
          d="M24 3.6 42 13.2v21.6L24 44.4 6 34.8V13.2z"
          fill="var(--accent, #e4a93c)"
          stroke="var(--primary-strong, #163523)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Leaf sprout */}
        <path
          d="M24 34c0-6 3-10.5 8-13-1 6-3.5 10-8 13Z"
          fill="var(--primary, #26593a)"
        />
        <path
          d="M24 34c0-6-3-10.5-8-13 1 6 3.5 10 8 13Z"
          fill="var(--primary-strong, #163523)"
        />
        <path
          d="M24 34V22"
          stroke="var(--primary-strong, #163523)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      {showWordmark && (
        <span
          aria-hidden="true"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: Math.round(size * 0.72),
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: 'var(--primary-strong, #163523)',
            lineHeight: 1,
          }}
        >
          Beahive
        </span>
      )}
    </span>
  )
}

export default BeahiveLogo
