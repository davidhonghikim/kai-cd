import React from 'react'
import ReactDOM from 'react-dom/client'
import Sidepanel from './Sidepanel'
import '../styles/global.css'
import { ThemeProvider } from '../components/ThemeProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <Sidepanel />
    </ThemeProvider>
  </React.StrictMode>,
) 