import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'

import './main.css'

const AppManager = lazy(() => import('./AppManager'))

const App = () => (
  <StrictMode>
    <Suspense fallback={<div className="center-middle">Cargando archivos...</div>}>
      <AppManager />
    </Suspense>
  </StrictMode>
)

createRoot(document.getElementById('root')!).render(<App />)
