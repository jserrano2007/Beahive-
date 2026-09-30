import { useMemo } from 'react'
import { LOCALES } from './locales'
import { interpolate } from './interpolate'
import { I18nContext } from './context'

export function I18nProvider({ lang, children }) {
  const value = useMemo(() => {
    const dict = LOCALES[lang] ?? LOCALES.en

    function t(key, vars) {
      const raw = dict[key] ?? LOCALES.en[key] ?? key
      return interpolate(raw, vars)
    }

    function tCount(baseKey, count, vars) {
      const key = count === 1 ? `${baseKey}_one` : `${baseKey}_other`
      return t(key, { count, ...vars })
    }

    return { lang, t, tCount, dict }
  }, [lang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export default I18nProvider
