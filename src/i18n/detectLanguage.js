export function detectDefaultLanguage() {
  if (typeof navigator === 'undefined') return 'en'
  const browserLang = navigator.language || navigator.userLanguage || ''
  return browserLang.toLowerCase().startsWith('es') ? 'es' : 'en'
}
