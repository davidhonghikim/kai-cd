import React from 'react'
import ReactDOM from 'react-dom/client'
import Sidepanel from './Sidepanel'
import '../styles/global.css'
import { ServiceProvider } from '../hooks/useServices'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ServiceProvider>
      <Sidepanel />
    </ServiceProvider>
  </React.StrictMode>,
) 