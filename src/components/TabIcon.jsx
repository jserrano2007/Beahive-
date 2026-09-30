const ICON_PROPS = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: 'false',
}

const PATHS = {
  find: (
    <svg {...ICON_PROPS}>
      <path d="M4 9h16l-1.4 10.2a2 2 0 0 1-2 1.8H7.4a2 2 0 0 1-2-1.8L4 9Z" />
      <path d="M8 9V7a4 4 0 0 1 8 0v2" />
    </svg>
  ),
  sell: (
    <svg {...ICON_PROPS}>
      <path d="M12.4 3H6a1 1 0 0 0-1 1v6.4a1 1 0 0 0 .3.7l9 9a1 1 0 0 0 1.4 0l6.3-6.3a1 1 0 0 0 0-1.4l-9-9a1 1 0 0 0-.6-.4Z" />
      <circle cx="8.8" cy="7.8" r="1.1" />
    </svg>
  ),
  grow: (
    <svg {...ICON_PROPS}>
      <path d="M12 21v-10" />
      <path d="M12 11c0-4-3-6.5-7-6.5 0 4.5 2.3 7.7 7 6.5Z" />
      <path d="M12 14.5c0-3.3 2.4-5.3 6.5-5.3 0 3.8-2 6-6.5 5.3Z" />
    </svg>
  ),
  garden: (
    <svg {...ICON_PROPS}>
      <path d="M12 12.5v8" />
      <path d="M8.2 8c0 2.8 1.8 3.8 3.8 3.8s3.8-1 3.8-3.8c-1.9 0-3.8.4-3.8 1.9 0-1.5-1.9-1.9-3.8-1.9Z" />
      <path d="M6 15h12l-1.1 4.8a1 1 0 0 1-1 .7H8.1a1 1 0 0 1-1-.7L6 15Z" />
    </svg>
  ),
  messages: (
    <svg {...ICON_PROPS}>
      <path d="M21 11.5a8 8 0 0 1-8.4 8.5 9 9 0 0 1-3.5-.6L4 21l1.1-3.7a8 8 0 1 1 15.9-5.8Z" />
    </svg>
  ),
  insights: (
    <svg {...ICON_PROPS}>
      <path d="M4 20V10" />
      <path d="M12 20V4" />
      <path d="M20 20v-7" />
    </svg>
  ),
  map: (
    <svg {...ICON_PROPS}>
      <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
      <path d="M9 4v14" />
      <path d="M15 6v14" />
    </svg>
  ),
}

function TabIcon({ name }) {
  return PATHS[name] ?? null
}

export default TabIcon
