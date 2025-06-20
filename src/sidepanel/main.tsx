import React from 'react'
import ReactDOM from 'react-dom/client'
import Sidepanel from './Sidepanel'
import ThemeProvider from '../components/ThemeProvider'
import '../styles/global.css'
import { overrideGlobalConsole } from '../utils/logger'

// Initialize the logger as the very first step
overrideGlobalConsole();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <Sidepanel />
    </ThemeProvider>
  </React.StrictMode>,
) 