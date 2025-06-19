import React from 'react'
import ReactDOM from 'react-dom/client'
import Popup from './Popup'
import '../styles/global.css'
import { ThemeProvider } from '../components/ThemeProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <Popup />
    </ThemeProvider>
  </React.StrictMode>,
) 