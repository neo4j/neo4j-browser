import { ReactNode, createContext, useContext, useEffect, useState } from 'react'

interface ThemeContextType {
  theme: string
  setTheme: (theme: string) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => undefined
})

export const useTheme = () => useContext(ThemeContext)

interface Props {
  theme?: string
  children: ReactNode
}

export function ThemeProvider({ theme = 'dark', children }: Props) {
  const [currentTheme, setCurrentTheme] = useState(theme)

  useEffect(() => {
    document.documentElement.classList.add('dark')

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setCurrentTheme(e.matches ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, setTheme: setCurrentTheme }}>
      <div className="min-h-screen bg-surface-secondary dark:bg-surface-dark text-gray-900 dark:text-gray-100">
        {children}
      </div>
    </ThemeContext.Provider>
  )
} 