import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../assets/global.css'
import OptionsApp from './OptionsApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OptionsApp />
  </StrictMode>,
)
