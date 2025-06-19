import React from 'react'
import ReactDOM from 'react-dom/client'
import Tab from './Tab'
import '../styles/global.css'
import { ThemeProvider } from '../components/ThemeProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <Tab />
    </ThemeProvider>
  </React.StrictMode>,
) 