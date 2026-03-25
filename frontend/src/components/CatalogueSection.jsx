import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart, Star, Package } from 'lucide-react'
import { useCart } from '../context/CartContext'

const CatalogueSection = ({ onFavoritesChange }) => {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites))
    if (onFavoritesChange) {
      onFavoritesChange(favorites)
    }
  }, [favorites, onFavoritesChange])

  // Catalogue de produits
  const catalogueProducts = [
    {
      id: 1,
      name: 'Crème Hydratante Visage CeraVe',
      brand: 'CeraVe',
      price: 1299,
      oldPrice: 1899,
      image: '/images/cerave.jpg',
      rating: 5,
      reviews: 128,
      stock: 15,
      category: 'Cosmétiques & Soin',
    },
    {
      id: 2,
      name: 'Gel Nettoyant CeraVe 200ml',
      brand: 'CeraVe',
      price: 899,
      oldPrice: 899,
      image: '/images/cerave.jpg',
      rating: 5,
      reviews: 85,
      stock: 22,
      category: 'Cosmétiques & Soin',
    },
    {
      id: 3,
      name: 'Lotion Hydratante CeraVe 473ml',
      brand: 'CeraVe',
      price: 2499,
      oldPrice: 3299,
      image: '/images/cerave.jpg',
      rating: 5,
      reviews: 256,
      stock: 3,
      category: 'Cosmétiques & Soin',
    },
    {
      id: 4,
      name: 'Crème Réparatrice CeraVe',
      brand: 'CeraVe',
      price: 1099,
      oldPrice: 1599,
      image: '/images/cerave.jpg',
      rating: 4,
      reviews: 142,
      stock: 30,
      category: 'Cosmétiques & Soin',
    },
    {
      id: 6,
      name: 'Gel Nettoyant Doux Avene',
      brand: 'Avene',
      price: 1199,
      oldPrice: 1499,
      image: '/images/gelAvene.webp',
      rating: 4,
      reviews: 134,
      stock: 22,
      category: 'Cosmétiques & Soin',
    },
    {
      id: 7,
      name: 'Lait Corps Hydratant Mixa',
      brand: 'Mixa',
      price: 599,
      oldPrice: 799,
      image: '/images/laitCorpsMixa.webp',
      rating: 5,
      reviews: 278,
      stock: 45,
      category: 'Cosmétiques & Soin',
    },
    {
      id: 8,
      name: 'Crème Hydratante Cetaphil',
      brand: 'Cetaphil',
      price: 1099,
      oldPrice: 1399,
      image: '/images/cetaphil.webp',
      rating: 4,
      reviews: 156,
      stock: 30,
      category: 'Cosmétiques & Soin',
    },
    {
      id: 9,
      name: 'Eau Thermale Avene Spray',
      brand: 'Avene',
      price: 1299,
      oldPrice: 1699,
      image: '/images/eauThermaleAvene.jpg',
      rating: 5,
      reviews: 423,
      stock: 15,
      category: 'Cosmétiques & Soin',
    },
    {
      id: 10,
      name: 'Huile Lavante CeraVe',
      brand: 'CeraVe',
      price: 1599,
      oldPrice: 1999,
      image: '/images/huilelavantCerave.jpg',
      rating: 5,
      reviews: 298,
      stock: 25,
      category: 'Cosmétiques & Soin',
    },
    {
      id: 11,
      name: 'Sérum Retinal Revox',
      brand: 'Revox',
      price: 799,
      oldPrice: 1099,
      image: '/images/serumRetinalRevox.webp',
      rating: 4,
      reviews: 187,
      stock: 18,
      category: 'Cosmétiques & Soin',
    },
    {
      id: 12,
      name: 'Crème Eucerin Visage',
      brand: 'Eucerin',
      price: 2199,
      oldPrice: 2799,
      image: '/images/eucerin1.webp',
      rating: 5,
      reviews: 145,
      stock: 20,
      category: 'Cosmétiques & Soin',
    },
  ]

  const handleAddToCart = (product) => {
    addToCart(product)
  }

  const handleToggleFavorite = (product) => {
    setFavorites(prev => {
      const isFavorited = prev.some(fav => fav.id === product.id)
      if (isFavorited) {
        return prev.filter(fav => fav.id !== product.id)
      }
      return [...prev, product]
    })
  }

  const isFavorite = (productId) => {
    return favorites.some(fav => fav.id === productId)
  }

  return (
    <div className="bg-gray-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Package size={28} className="text-sky-700" strokeWidth={2} />
            Notre Catalogue
          </h2>
          <p className="text-gray-600">Découvrez notre sélection de produits parapharmaceutiques</p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {catalogueProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={isFavorite(product.id)}
            />
          ))}
        </div>

        {/* Voir tout */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/products')}
            className="px-8 py-3 bg-sky-700 hover:bg-sky-800 text-white font-semibold rounded-lg transition-colors"
          >
            Voir tous les produits
          </button>
        </div>
      </div>
    </div>
  )
}

// Composant ProductCard
const ProductCard = ({ product, onAddToCart, onToggleFavorite, isFavorite }) => {
  const navigate = useNavigate()
  const [isAdded, setIsAdded] = useState(false)

  const handleAddToCart = () => {
    setIsAdded(true)
    onAddToCart(product)
    setTimeout(() => setIsAdded(false), 2000)
  }

  const handleProductClick = () => {
    navigate(`/product/${product.id}`)
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
      {/* Image Container */}
      <div 
        onClick={handleProductClick}
        className="relative bg-gray-100 h-48 md:h-56 overflow-hidden cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badge promo si applicable */}
        {product.oldPrice > product.price && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs md:text-sm font-bold bg-orange-500 text-white">
            -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite(product)
          }}
          className="absolute top-3 left-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
        >
          <Heart
            size={18}
            className={`transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
            strokeWidth={1.8}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 md:p-4">
        {/* Brand */}
        <p className="text-xs text-gray-500 mb-1">{product.brand}</p>

        {/* Product Name */}
        <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2 line-clamp-2 h-10">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < product.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                strokeWidth={1.5}
              />
            ))}
          </div>
          <span className="text-xs text-gray-600">({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg md:text-xl font-bold text-sky-700">{product.price.toFixed(2)} DH</span>
          {product.oldPrice > product.price && (
            <span className="text-sm text-gray-500 line-through">{product.oldPrice.toFixed(2)} DH</span>
          )}
        </div>

        {/* Stock Status */}
        <div className="mb-3">
          {product.stock > 0 ? (
            <p className="text-xs text-green-600 font-medium">En stock ({product.stock})</p>
          ) : (
            <p className="text-xs text-red-600 font-medium">Rupture de stock</p>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
            isAdded
              ? 'bg-green-500 text-white'
              : product.stock === 0
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-sky-700 hover:bg-sky-800 text-white'
          }`}
        >
          <ShoppingCart size={16} strokeWidth={1.8} />
          {isAdded ? 'Ajouté !' : 'Ajouter au panier'}
        </button>
      </div>
    </div>
  )
}

export default CatalogueSection
