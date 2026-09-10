import React from 'react'
import ReactDOM from 'react-dom/client'
import { FSAIProvider } from './FSAIContext.jsx'
import App from './App.jsx'
import './theme.css'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FSAIProvider>
      <App />
    </FSAIProvider>
  </React.StrictMode>,
)
