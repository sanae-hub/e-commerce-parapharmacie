// frontend/src/main.jsx
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { FavoritesProvider } from './context/FavoritesContext'
import AppRoutes from './routes/index'
import './index.css'

// CORRECTION: Importer directement les providers (pas de lazy loading)
import { WebSocketProvider } from './context/WebSocketContext'
import { AdminWebSocketProvider } from './context/AdminWebSocketContext'

// Component to force redirect to home page on first load
const ForceHomeRedirect = ({ children }) => {
  const location = useLocation()
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const [isFirstRender, setIsFirstRender] = useState(true)
  
  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false)
      // Always redirect to home page on initial app load
      if (location.pathname !== '/') {
        setShouldRedirect(true)
      }
    }
  }, [isFirstRender, location.pathname])
  
  if (shouldRedirect) {
    return <Navigate to="/" replace />
  }
  
  return children
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <AdminWebSocketProvider>
              <WebSocketProvider>
                <ForceHomeRedirect>
                  <AppRoutes />
                </ForceHomeRedirect>
              </WebSocketProvider>
            </AdminWebSocketProvider>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
