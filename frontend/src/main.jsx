// frontend/src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { FavoritesProvider } from './context/FavoritesContext'  // ← Ajouter
import App from './App'
import './index.css'

// Lazy loading des contextes WebSocket
const WebSocketProvider = React.lazy(() => import('./context/WebSocketContext').then(module => ({ default: module.WebSocketProvider })))
const AdminWebSocketProvider = React.lazy(() => import('./context/AdminWebSocketContext').then(module => ({ default: module.AdminWebSocketProvider })))

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>  {/* ← Ajouter FavoritesProvider */}
            <React.Suspense fallback={null}>
              <AdminWebSocketProvider>
                <WebSocketProvider>
                  <App />
                </WebSocketProvider>
              </AdminWebSocketProvider>
            </React.Suspense>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)