import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router/dom'
import { AuthProvider } from './funcionalidades/auth/AuthContext'
import { queryClient } from './lib/queryClient'
import { router } from './router'
import './index.css'

const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error('No se encontró el elemento #root')
}

createRoot(rootEl).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
