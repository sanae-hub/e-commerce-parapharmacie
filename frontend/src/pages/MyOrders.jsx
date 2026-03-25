// frontend/src/pages/MyOrders.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
// Supprimez cette ligne
// import Navbar from '../components/Navbar'
import { useWebSocket } from '../context/WebSocketContext'

const MyOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const navigate = useNavigate()
  const { notifications } = useWebSocket()

  const statusSteps = [
    { key: 'RECEIVED', label: 'Commande reçue', icon: Package },
    { key: 'PREPARING', label: 'En préparation', icon: Clock },
    { key: 'READY', label: 'Prête', icon: CheckCircle },
    { key: 'COMPLETED', label: 'Récupérée', icon: CheckCircle }
  ]

  useEffect(() => {
    fetchOrders()
  }, [])

  // Real-time order status updates
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.type === 'ORDER_STATUS_CHANGED') {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === notification.order.id 
              ? { ...order, status: notification.order.status }
              : order
          )
        );
      } else if (notification.type === 'ORDER_CONFIRMED') {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === notification.order.id 
              ? { ...order, status: 'RECEIVED' }
              : order
          )
        );
      } else if (notification.type === 'ORDER_CANCELLED') {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === notification.order.id 
              ? { ...order, status: 'CANCELLED' }
              : order
          )
        );
      }
    });
  }, [notifications]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      const response = await fetch('http://localhost:5000/api/orders/my-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const cancelOrder = async (orderId) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        fetchOrders()
      }
    } catch (error) {
      console.error('Error canceling order:', error)
    }
  }

  const getStatusIndex = (status) => {
    const index = statusSteps.findIndex(s => s.key === status)
    return index === -1 ? 0 : index
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Supprimez le Navbar ici aussi */}
        {/* <Navbar /> */}
        <div className="flex justify-center items-center h-96">
          <div className="text-sky-700">Chargement...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Supprimez cette ligne */}
      {/* <Navbar /> */}
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Mes Commandes</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucune commande pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const currentStepIndex = getStatusIndex(order.status)
              const isExpanded = expandedOrder === order.id
              const canCancel = order.status === 'RECEIVED'

              return (
                <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">{order.orderNumber}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {order.timeSlotDate && (
                          <p className="text-sm text-sky-700 font-medium mt-1">
                            Retrait: {new Date(order.timeSlotDate).toLocaleDateString('fr-FR')} à {order.timeSlotStart}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-800">{order.total.toFixed(2)} DH</p>
                        {order.status === 'CANCELLED' && (
                          <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                            Annulée
                          </span>
                        )}
                      </div>
                    </div>

                    {order.status !== 'CANCELLED' && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between">
                          {statusSteps.map((step, index) => {
                            const StepIcon = step.icon
                            const isActive = index <= currentStepIndex
                            const isCurrent = index === currentStepIndex

                            return (
                              <div key={step.key} className="flex items-center flex-1">
                                <div className="flex flex-col items-center">
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    isActive ? 'bg-sky-700 text-white' : 'bg-gray-200 text-gray-400'
                                  } ${isCurrent ? 'ring-4 ring-sky-200' : ''}`}>
                                    <StepIcon className="w-6 h-6" />
                                  </div>
                                  <p className={`text-xs mt-2 text-center ${
                                    isActive ? 'text-sky-700 font-semibold' : 'text-gray-400'
                                  }`}>
                                    {step.label}
                                  </p>
                                </div>
                                {index < statusSteps.length - 1 && (
                                  <div className={`flex-1 h-1 mx-2 ${
                                    index < currentStepIndex ? 'bg-sky-700' : 'bg-gray-200'
                                  }`} />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {isExpanded ? 'Masquer' : 'Voir détails'}
                      </button>
                      {canCancel && (
                        <button
                          onClick={() => cancelOrder(order.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                        >
                          <XCircle className="w-4 h-4" />
                          Annuler
                        </button>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t bg-gray-50 p-6">
                      <h4 className="font-semibold text-gray-800 mb-4">Articles commandés</h4>
                      <div className="space-y-3">
                        {order.items.map(item => (
                          <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded">
                            <div>
                              <p className="font-medium text-gray-800">{item.product?.name || 'Produit'}</p>
                              <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                            </div>
                            <p className="font-semibold text-gray-800">{(item.price * item.quantity).toFixed(2)} DH</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyOrders