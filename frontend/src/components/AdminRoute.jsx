// frontend/src/components/AdminRoute.jsx
import { Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

const AdminRoute = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken')
    const adminUser = localStorage.getItem('adminUser')
    
    if (adminToken && adminUser) {
      try {
        const user = JSON.parse(adminUser)
        if (user.role === 'ADMIN' || user.role === 'CAISSIER' || user.role === 'PREPARATEUR') {
          setIsAdmin(true)
        }
      } catch (error) {
        console.error('Erreur parsing adminUser:', error)
        setIsAdmin(false)
      }
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-700"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

export default AdminRoute