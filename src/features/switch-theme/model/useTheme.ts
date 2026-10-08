import { useContext } from 'react'
import { ThemeContext } from './themeContext'

export function useTheme() {
  const theme = useContext(ThemeContext)

  if (theme === null) {
    throw new Error('useTheme має викликатися всередині <ThemeProvider>')
  }

  return theme
}
