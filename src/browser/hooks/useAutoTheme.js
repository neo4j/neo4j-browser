import { useState, useEffect } from 'react'
import useDetectColorScheme from './useDetectColorScheme'

export default function useAutoTheme (defaultTheme = 'light') {
  const detectedScheme = useDetectColorScheme()
  const [autoTheme, setAutoTheme] = useState(detectedScheme || defaultTheme)
  const [overriddenTheme, overrideAutoTheme] = useState(null)

  useEffect(
    () => {
      if (overriddenTheme) {
        setAutoTheme(overriddenTheme)
        return
      }
      if (!detectedScheme && !overriddenTheme) {
        setAutoTheme(defaultTheme)
        return
      }
      setAutoTheme(detectedScheme)
    },
    [detectedScheme, overriddenTheme]
  )
  return [autoTheme, overrideAutoTheme]
}
