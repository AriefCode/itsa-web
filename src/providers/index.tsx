import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'

// ThemeProvider bawaan template sudah dicabut: situs ITSA punya satu tampilan
// hijau-dominan, dan varian `dark:` sudah dimatikan di globals.css. Yang
// tersisa hanya HeaderTheme, yang dipakai hero untuk menyetel tampilan header
// per halaman.
export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return <HeaderThemeProvider>{children}</HeaderThemeProvider>
}
