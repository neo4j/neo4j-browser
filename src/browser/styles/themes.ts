/** @jsxRuntime classic */
/** @jsx React.createElement */
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeColors {
  primary: string
  secondary: string
  background: {
    primary: string
    secondary: string
  }
  text: {
    primary: string
    secondary: string
  }
  border: string
  link: string
  error: string
  warning: string
  success: string
}

export interface ThemeTokens {
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
  }
  fontSize: {
    sm: string
    base: string
    lg: string
    xl: string
  }
  transition: {
    fast: string
    base: string
    slow: string
  }
}

// Theme definitions
export const themeTokens: ThemeTokens = {
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem'
  },
  fontSize: {
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem'
  },
  transition: {
    fast: '150ms ease-in-out',
    base: '250ms ease-in-out',
    slow: '350ms ease-in-out'
  }
}

// Legacy color kept for backward compatibility
export const primaryLightColor = '#018bff'

export const themeColors: Record<'light' | 'dark', ThemeColors> = {
  light: {
    primary: primaryLightColor,
    secondary: '#37474f',
    background: {
      primary: '#ffffff',
      secondary: '#f5f5f5'
    },
    text: {
      primary: '#333333',
      secondary: '#666666'
    },
    border: '#e0e0e0',
    link: primaryLightColor,
    error: '#dc3545',
    warning: '#ffc107',
    success: '#28a745'
  },
  dark: {
    primary: primaryLightColor,
    secondary: '#37474f',
    background: {
      primary: '#1a1a1a',
      secondary: '#2d2d2d'
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3'
    },
    border: '#404040',
    link: primaryLightColor,
    error: '#ff4444',
    warning: '#ffbb33',
    success: '#00C851'
  }
}

// Theme context
interface ThemeContextValue {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  colors: ThemeColors
  tokens: ThemeTokens
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

// Theme hook
function useTheme(): ThemeContextValue {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'system'
    return (localStorage.getItem('theme-mode') as ThemeMode) || 'system'
  })

  const [colors, setColors] = useState<ThemeColors>(themeColors.light)

  useEffect(() => {
    const root = window.document.documentElement
    
    const applyTheme = (themeMode: 'light' | 'dark') => {
      root.setAttribute('data-theme', themeMode)
      setColors(themeColors[themeMode])
      
      // Apply CSS variables with proper type safety
      Object.entries(themeColors[themeMode]).forEach(([key, value]) => {
        if (value && typeof value === 'object') {
          Object.entries(value as Record<string, string>).forEach(([subKey, subValue]) => {
            root.style.setProperty(`--${key}-${subKey}`, subValue)
          })
        } else if (typeof value === 'string') {
          root.style.setProperty(`--${key}`, value)
        }
      })
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

  return { mode, setMode, colors, tokens: themeTokens }
}

// Theme provider with proper JSX types
export function ThemeProvider({ children }: { children: ReactNode }): JSX.Element {
  const theme = useTheme()
  
  return React.createElement(
    ThemeContext.Provider,
    { value: theme },
    children
  )
}

// Theme hook for components
export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider')
  }
  return context
}

// Modern theme toggle with proper event types
export function ThemeToggle(): JSX.Element {
  const { mode, setMode } = useThemeContext()
  
  return React.createElement(
    'select',
    {
      value: mode,
      onChange: (e: React.ChangeEvent<HTMLSelectElement>) => 
        setMode(e.target.value as ThemeMode),
      className: 'neo4j-select'
    },
    React.createElement('option', { value: 'light' }, 'Light'),
    React.createElement('option', { value: 'dark' }, 'Dark'),
    React.createElement('option', { value: 'system' }, 'System')
  )
}

// Legacy exports for backward compatibility
export const dark = {
  primaryBackground: themeColors.dark.background.primary,
  secondaryBackground: themeColors.dark.background.secondary,
  primaryText: themeColors.dark.text.primary,
  secondaryText: themeColors.dark.text.secondary,
  primary: themeColors.dark.primary,
  link: themeColors.dark.link,
  frameSidebarBackground: themeColors.dark.background.secondary,
  topicText: themeColors.dark.text.primary,
  preText: themeColors.dark.text.primary,
  asideBackground: themeColors.dark.background.secondary
}
