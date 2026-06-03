import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'

import './main.css'

const AppManager = lazy(() => import('./AppManager'))

const App = () => {
  return (
    <StrictMode>
      <Suspense fallback={<div className="center-middle">Cargando apps...</div>}>
        <AppManager />
      </Suspense>
    </StrictMode>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
