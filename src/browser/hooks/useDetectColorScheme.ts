import { useEffect, useState } from 'react'

// Define available themes
export const colorSchemes: Record<string, string> = {
  DARK: '(prefers-color-scheme: dark)',
  LIGHT: '(prefers-color-scheme: light)'
}

export default function useDetectColorScheme() {
  const [scheme, setScheme] = useState<string | null>(null)

  useEffect(() => {
    if (!window.matchMedia) {
      return
    }

    // The listener
    const listener = (e: any) => {
      if (!e || !e.matches) {
        return
      }
      const schemeNames = Object.keys(colorSchemes)
      for (let i = 0; i < schemeNames.length; i++) {
        const schemeName = schemeNames[i]
        if (e.media === colorSchemes[schemeName]) {
          setScheme(schemeName.toLowerCase())
          break
        }
      }
    }

    // Add listener for all themes
    let activeMatches: any = []
    Object.keys(colorSchemes).forEach(schemeName => {
      const mq = window.matchMedia(colorSchemes[schemeName])
      mq.addListener(listener)
      activeMatches.push(mq)
      listener(mq)
    })

    // Remove listeners, no memory leaks
    return () => {
      activeMatches.forEach((mq: any) => mq.removeListener(listener))
      activeMatches = []
    }
  }, [])

  return scheme
}
