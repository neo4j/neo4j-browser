/** @jsxRuntime classic */
/** @jsx React.createElement */
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function useTheme(): ThemeContextValue {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'system'
    return (localStorage.getItem('theme-mode') as ThemeMode) || 'system'
  })

  useEffect(() => {
    const root = window.document.documentElement
    
    const applyTheme = (themeMode: 'light' | 'dark') => {
      root.classList.remove('light', 'dark')
      root.classList.add(themeMode)
    }

    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light')
      }
      
      applyTheme(mediaQuery.matches ? 'dark' : 'light')
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      applyTheme(mode)
    }
    
    localStorage.setItem('theme-mode', mode)
  }, [mode])

  return { mode, setMode }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useTheme()
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

export function useThemeContext() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider')
  }
  return context
}

export function ThemeToggle() {
  const { mode, setMode } = useThemeContext()
  
  return (
    <select
      value={mode}
      onChange={e => setMode(e.target.value as ThemeMode)}
      className="bg-background text-foreground px-2 py-1 rounded border border-border"
    >
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
    </select>
  )
}
