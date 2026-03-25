import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { ArrowLeft, Store, CreditCard } from 'lucide-react'

const Checkout = () => {
  const navigate = useNavigate()
  const { cartItems, getTotalPrice } = useCart()
  const [selectedMode, setSelectedMode] = useState('click-collect')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Vous devez être connecté pour accéder à cette page')
      navigate('/login')
      return
    }
    if (cartItems.length === 0) {
      navigate('/cart')
    }
  }, [cartItems, navigate])

  const handleContinue = () => {
    if (selectedMode === 'click-collect') {
      navigate('/checkout/time-slot')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-sky-700 font-semibold mb-6 hover:text-sky-800"
        >
          <ArrowLeft size={20} />
          Retour au panier
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Mode de retrait</h1>
          <p className="text-gray-600 mb-8">Choisissez comment vous souhaitez récupérer votre commande</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Click & Collect */}
            <button
              onClick={() => setSelectedMode('click-collect')}
              className={`p-6 border-2 rounded-xl transition-all duration-200 text-left ${
                selectedMode === 'click-collect'
                  ? 'border-sky-700 bg-sky-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${
                  selectedMode === 'click-collect' ? 'bg-sky-700' : 'bg-gray-100'
                }`}>
                  <Store size={24} className={selectedMode === 'click-collect' ? 'text-white' : 'text-gray-600'} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">Click & Collect</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Retirez votre commande en pharmacie au créneau de votre choix
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs text-green-600 font-medium">✓ Gratuit</p>
                    <p className="text-xs text-green-600 font-medium">✓ Paiement au comptoir</p>
                    <p className="text-xs text-green-600 font-medium">✓ Disponible sous 2h</p>
                  </div>
                </div>
              </div>
            </button>

            {/* Livraison (désactivé) */}
            <div className="p-6 border-2 border-gray-200 rounded-xl opacity-50 cursor-not-allowed">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-gray-100">
                  <CreditCard size={24} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">Livraison à domicile</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Recevez votre commande directement chez vous
                  </p>
                  <p className="text-xs text-gray-500 font-medium">Bientôt disponible</p>
                </div>
              </div>
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Récapitulatif</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Articles ({cartItems.length})</span>
                <span>{getTotalPrice().toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Mode de retrait</span>
                <span className="font-medium text-sky-700">Click & Collect</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span className="text-sky-700">{getTotalPrice().toFixed(2)} DH</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleContinue}
            disabled={!selectedMode}
            className="w-full py-3 bg-sky-700 hover:bg-sky-800 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Choisir un créneau horaire
          </button>
        </div>
      </div>
    </div>
  )
}

export default Checkout
