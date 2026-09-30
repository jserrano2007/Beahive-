export function interpolate(str, vars) {
  if (!vars) return str
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, value),
    str,
  )
}
