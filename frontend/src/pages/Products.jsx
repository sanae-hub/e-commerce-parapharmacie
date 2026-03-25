// frontend/src/pages/Products.jsx
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { ArrowLeft, Filter, Grid3x3, List, Loader2 } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import ProductCardList from '../components/ProductCardList'

const Products = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const categoryName = searchParams.get('category')
  const subcategoryName = searchParams.get('subcategory')
  const { addToCart } = useCart()
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites')
    return saved ? JSON.parse(saved) : []
  })
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('viewMode') || 'grid'
  })
  const observerTarget = useRef(null)
  const isFetching = useRef(false)  // ← AJOUTER CETTE REF

  const fetchProducts = useCallback(async (pageNum, append = false) => {
    if (isFetching.current) return  // ← ÉVITER LES APPELS MULTIPLES
    
    isFetching.current = true
    setLoading(true)
    
    try {
      const params = new URLSearchParams({
        page: pageNum,
        limit: 12
      })
      
      if (categoryName) params.append('category', categoryName)
      if (subcategoryName) params.append('subcategory', subcategoryName)

      const response = await fetch(`http://localhost:5000/api/products?${params}`)
      if (response.ok) {
        const data = await response.json()
        
        let productsData = []
        let paginationData = { currentPage: pageNum, totalPages: 1, total: 0, hasMore: false }
        
        if (data.products && data.pagination) {
          productsData = data.products
          paginationData = data.pagination
        } else if (Array.isArray(data)) {
          productsData = data
          paginationData = {
            currentPage: pageNum,
            totalPages: Math.ceil(productsData.length / 12),
            total: productsData.length,
            hasMore: productsData.length === 12
          }
        } else {
          productsData = []
        }
        
        if (append) {
          setProducts(prev => [...prev, ...productsData])
        } else {
          setProducts(productsData)
        }
        
        const hasMoreData = paginationData.hasMore !== undefined 
          ? paginationData.hasMore 
          : pageNum < (paginationData.totalPages || 1)
        
        setHasMore(hasMoreData)
        setTotalPages(paginationData.totalPages || 1)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
      isFetching.current = false
    }
  }, [categoryName, subcategoryName])  // ← RETIRER "loading" DES DÉPENDANCES

  // Réinitialiser quand les filtres changent
  useEffect(() => {
    setProducts([])
    setPage(1)
    setHasMore(true)
    fetchProducts(1, false)
  }, [categoryName, subcategoryName])  // ← AJOUTER fetchProducts ? Non, seulement les filtres

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    localStorage.setItem('viewMode', viewMode)
  }, [viewMode])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !isFetching.current) {
          const nextPage = page + 1
          setPage(nextPage)
          fetchProducts(nextPage, true)
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [hasMore, loading, page, fetchProducts])

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sky-700 font-semibold mb-6 hover:text-sky-800"
        >
          <ArrowLeft size={20} />
          Retour à l'accueil
        </button>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {subcategoryName ? subcategoryName : categoryName || 'Tous les produits'}
            </h1>
            {subcategoryName && categoryName && (
              <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <button 
                  onClick={() => navigate('/')}
                  className="hover:text-sky-700"
                >
                  Accueil
                </button>
                <span>/</span>
                <button 
                  onClick={() => navigate(`/products?category=${encodeURIComponent(categoryName)}`)}
                  className="hover:text-sky-700"
                >
                  {categoryName}
                </button>
                <span>/</span>
                <span className="text-gray-900 font-medium">{subcategoryName}</span>
              </nav>
            )}
            <p className="text-gray-600">
              {products.length} produit{products.length > 1 ? 's' : ''} disponible{products.length > 1 ? 's' : ''}
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-sky-700 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Vue grille"
            >
              <Grid3x3 size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' 
                  ? 'bg-sky-700 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Vue liste"
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {products.length === 0 && !loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Filter size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Aucun produit trouvé</h2>
            <p className="text-gray-600 mb-6">Aucun produit disponible dans cette catégorie</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-sky-700 hover:bg-sky-800 text-white font-semibold rounded-lg transition-colors"
            >
              Voir tous les produits
            </button>
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={isFavorite(product.id)}
                  />
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="flex flex-col gap-4">
                {products.map((product) => (
                  <ProductCardList
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={isFavorite(product.id)}
                  />
                ))}
              </div>
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-center items-center py-8">
                <Loader2 size={32} className="animate-spin text-sky-700" />
              </div>
            )}

            {/* Infinite Scroll Target */}
            {hasMore && products.length > 0 && <div ref={observerTarget} className="h-10" />}

            {/* End of List */}
            {!hasMore && products.length > 0 && (
              <div className="text-center py-8 text-gray-500">
                Vous avez vu tous les produits
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Products