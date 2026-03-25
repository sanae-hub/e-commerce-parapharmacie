// frontend/src/components/Navbar.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, User, UserPlus, Settings, Heart, Bell, X, LogOut, Package, Moon, Sun } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useWebSocket } from '../context/WebSocketContext'
import { useFavorites } from '../context/FavoritesContext'  // ← AJOUTER CET IMPORT
import axios from '../api/axios'
import MiniCart from './MiniCart'
import MiniFavorites from './MiniFavorites'

const Navbar = () => {
  const navigate = useNavigate()
  const { getTotalItems, cart } = useCart()
  const { user, logout, isAuthenticated } = useAuth()
  const { notifications, removeNotification, requestNotificationPermission } = useWebSocket()
  const { favorites, removeFavorite, getFavoritesCount, refreshFavorites } = useFavorites()  // ← UTILISER LE CONTEXTE
  
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showMiniCart, setShowMiniCart] = useState(false)
  const [showMiniFavorites, setShowMiniFavorites] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    return localStorage.getItem('theme') === 'dark'
  })
  const [loading, setLoading] = useState(true)

  // Références pour la gestion des clics extérieurs
  const notificationsRef = useRef(null)
  const cartRef = useRef(null)
  const favoritesRef = useRef(null)
  const menuRef = useRef(null)

  // Gestion des clics extérieurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setShowMiniCart(false)
      }
      if (favoritesRef.current && !favoritesRef.current.contains(event.target)) {
        setShowMiniFavorites(false)
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Thème
  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('theme', 'light')
    }
  }, [isDarkTheme])

  // Rafraîchir les favoris après connexion
  useEffect(() => {
    if (isAuthenticated) {
      refreshFavorites()
      requestNotificationPermission()
    }
    setLoading(false)
  }, [isAuthenticated, refreshFavorites, requestNotificationPermission])

  // Recherche de produits depuis l'API
  const searchProducts = async (query) => {
    if (query.trim().length < 2) return []
    
    try {
      const response = await axios.get(`/products/search?q=${encodeURIComponent(query)}&limit=8`)
      return response.data
    } catch (error) {
      console.error('Erreur recherche:', error)
      return []
    }
  }

  // Mise à jour des suggestions en temps réel
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchValue.trim().length > 1) {
        const results = await searchProducts(searchValue)
        setSearchSuggestions(results)
        setShowSuggestions(true)
      } else {
        setSearchSuggestions([])
        setShowSuggestions(false)
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchValue])

  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`)
      setShowSuggestions(false)
      setSearchValue('')
      setShowMobileSearch(false)
    }
  }

  const handleSuggestionClick = (product) => {
    navigate(`/product/${product.id}`)
    setShowSuggestions(false)
    setSearchValue('')
    setShowMobileSearch(false)
  }

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleLogout = async () => {
    await logout()
    setShowMenu(false)
    navigate('/')
  }

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme)
  }

  const handleRemoveFavorite = (productId) => {
    removeFavorite(productId)
  }

  if (loading) {
    return (
      <nav className="bg-white border-b border-gray-200 py-3 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
            <div className="hidden md:block h-12 w-96 bg-gray-200 animate-pulse rounded-full"></div>
            <div className="flex gap-2">
              <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-full"></div>
              <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-full"></div>
              <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-full"></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white border-b border-gray-200 py-3 px-4 md:px-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        {/* Barre de recherche mobile plein écran */}
        {showMobileSearch && (
          <div className="md:hidden fixed inset-0 bg-white z-50 flex flex-col">
            <div className="flex items-center gap-3 p-4 border-b border-gray-200">
              <button
                onClick={() => {
                  setShowMobileSearch(false)
                  setSearchValue('')
                  setShowSuggestions(false)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} className="text-gray-600" />
              </button>
              <div className="flex-1 relative">
                <div className="flex items-center rounded-full border-2 border-sky-700 bg-white">
                  <input
                    type="text"
                    value={searchValue}
                    onChange={e => setSearchValue(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    placeholder="Rechercher un produit..."
                    autoFocus
                    className="flex-1 px-4 py-3 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
                  />
                  {searchValue && (
                    <button
                      onClick={() => {
                        setSearchValue('')
                        setShowSuggestions(false)
                      }}
                      className="pr-3 text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <button
                    onClick={handleSearch}
                    className="m-1.5 w-10 h-10 bg-sky-700 hover:bg-sky-800 text-white rounded-full flex items-center justify-center"
                  >
                    <Search size={18} strokeWidth={2.2} />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Suggestions mobile */}
            {searchSuggestions.length > 0 && (
              <div className="flex-1 overflow-y-auto">
                {searchSuggestions.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSuggestionClick(product)}
                    className="w-full text-left px-4 py-4 hover:bg-gray-50 border-b border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          <Package size={24} className="text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.brand || 'Marque'}</p>
                        <p className="text-sm font-semibold text-sky-600 mt-1">{product.price} DH</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Conteneur principal */}
        <div className="flex items-center justify-between gap-2">

          {/* Logo / Marque */}
          <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/')}>
            <img
              src="/logo.jpeg"
              alt="ParaClick"
              className="h-8 md:h-10 lg:h-12 w-auto object-contain"
            />
          </div>

          {/* Barre de recherche centrée - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-auto relative">
            <div className={`flex items-center rounded-full border-2 transition-all duration-300 bg-white w-full ${
              searchFocused ? 'border-sky-700 shadow-lg' : 'border-gray-300 hover:border-gray-400'
            }`}>
              <input
                type="text"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => {
                  setSearchFocused(false)
                  setShowSuggestions(false)
                }, 200)}
                onKeyPress={handleSearchKeyPress}
                placeholder="Rechercher un produit..."
                className="flex-1 px-4 md:px-5 py-2.5 md:py-3 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
              />
              {searchValue && (
                <button
                  onClick={() => {
                    setSearchValue('')
                    setShowSuggestions(false)
                  }}
                  className="pr-2 md:pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
              <button 
                onClick={handleSearch}
                className="m-1.5 w-9 h-9 md:w-10 md:h-10 bg-sky-700 hover:bg-sky-800 text-white rounded-full transition-colors flex items-center justify-center flex-shrink-0"
              >
                <Search size={16} strokeWidth={2.2} />
              </button>
            </div>

            {/* Suggestions dropdown - Desktop */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                {searchSuggestions.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSuggestionClick(product)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                  >
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                        <Package size={20} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.brand || 'Marque'}</p>
                      <p className="text-sm font-semibold text-sky-600">{product.price} DH</p>
                    </div>
                    {product.oldPrice && product.oldPrice > product.price && (
                      <span className="text-xs text-green-600 font-medium">-{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Actions droite */}
          <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3 flex-shrink-0">

            {/* Recherche mobile */}
            <button 
              onClick={() => setShowMobileSearch(true)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Search size={20} className="text-gray-600" strokeWidth={1.8} />
            </button>

            {/* Notifications */}
            <div className="relative hidden sm:block" ref={notificationsRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 md:p-2.5 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <Bell size={20} className="text-gray-600 group-hover:text-sky-700 transition-colors md:w-[22px] md:h-[22px]" strokeWidth={1.8} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Bell size={32} className="mx-auto mb-2 text-gray-300" />
                      <p>Aucune notification</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notif, index) => (
                        <div key={index} className="p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-semibold text-sm text-gray-900">{notif.title}</p>
                            <button
                              onClick={() => removeNotification(index)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(notif.timestamp).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Favoris - UTILISE LE CONTEXTE */}
            <div className="relative" ref={favoritesRef}>
              <button
                onClick={() => setShowMiniFavorites(!showMiniFavorites)}
                className="relative p-2 md:p-2.5 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <Heart size={20} className="text-gray-600 group-hover:text-red-500 transition-colors md:w-[22px] md:h-[22px]" strokeWidth={1.8} />
                {favorites.length > 0 && (  // ← UTILISE favorites DU CONTEXTE
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-sky-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </button>
              {showMiniFavorites && (
                <MiniFavorites
                  favorites={favorites}
                  onRemove={handleRemoveFavorite}
                  onClose={() => setShowMiniFavorites(false)}
                />
              )}
            </div>

            {/* Panier */}
            <div className="relative" ref={cartRef}>
              <button
                onClick={() => setShowMiniCart(!showMiniCart)}
                className="relative p-2 md:p-2.5 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <ShoppingCart size={20} className="text-gray-600 group-hover:text-sky-700 transition-colors md:w-[22px] md:h-[22px]" strokeWidth={1.8} />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
              {showMiniCart && <MiniCart onClose={() => setShowMiniCart(false)} />}
            </div>

            {/* Thème */}
            <button
              onClick={toggleTheme}
              className="p-2 md:p-2.5 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              {isDarkTheme ? (
                <Sun size={20} className="text-gray-600 group-hover:text-yellow-500 transition-colors md:w-[22px] md:h-[22px]" strokeWidth={1.8} />
              ) : (
                <Moon size={20} className="text-gray-600 group-hover:text-gray-900 transition-colors md:w-[22px] md:h-[22px]" strokeWidth={1.8} />
              )}
            </button>

            {/* Menu Utilisateur */}
            <div className="relative" ref={menuRef}>
              <button onClick={() => setShowMenu(!showMenu)} className="p-2 md:p-2.5 rounded-lg hover:bg-gray-100 transition-colors group">
                <Settings size={20} className="text-gray-600 group-hover:text-gray-900 transition-colors md:w-[22px] md:h-[22px]" strokeWidth={1.8} />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                  {isAuthenticated && user ? (
                    <>
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <p className="font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        {user.role !== 'CLIENT' && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-sky-100 text-sky-700">
                            {user.role === 'ADMIN' ? 'Administrateur' : user.role === 'PREPARATEUR' ? 'Préparateur' : 'Caissier'}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          navigate('/my-orders')
                          setShowMenu(false)
                        }}
                        className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                      >
                        <Package size={16} className="text-gray-500" />
                        <span>Mes commandes</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/edit-profile')
                          setShowMenu(false)
                        }}
                        className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                      >
                        <User size={16} className="text-gray-500" />
                        <span>Modifier le profil</span>
                      </button>
                      {(user.role === 'ADMIN' || user.role === 'PREPARATEUR' || user.role === 'CAISSIER') && (
                        <button
                          onClick={() => {
                            navigate('/admin')
                            setShowMenu(false)
                          }}
                          className="w-full text-left px-4 py-2.5 text-sky-600 hover:bg-sky-50 flex items-center gap-3 transition-colors border-t border-gray-200 mt-1"
                        >
                          <Settings size={16} />
                          <span>Administration</span>
                        </button>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors border-t border-gray-200"
                      >
                        <LogOut size={16} />
                        <span>Déconnexion</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          navigate('/login')
                          setShowMenu(false)
                        }}
                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                      >
                        <User size={16} className="text-gray-500" />
                        <span>Se connecter</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/signup')
                          setShowMenu(false)
                        }}
                        className="w-full text-left px-4 py-3 text-sky-600 hover:bg-sky-50 flex items-center gap-3 transition-colors border-t border-gray-200"
                      >
                        <UserPlus size={16} />
                        <span>Créer un compte</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Profil utilisateur - Avatar */}
            {isAuthenticated && user && (
              <button
                onClick={() => navigate('/edit-profile')}
                className="hidden sm:flex items-center gap-2 px-2 md:px-3 py-2 md:py-2.5 rounded-lg hover:bg-gray-100 transition-all duration-200"
              >
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="Profil"
                    className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border-2 border-sky-700"
                  />
                ) : (
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-sky-700 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm md:text-base">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </span>
                  </div>
                )}
              </button>
            )}

            {/* Boutons Connexion/Inscription pour non connectés */}
            {!isAuthenticated && (
              <>
                <button 
                  onClick={() => navigate('/login')} 
                  className="hidden lg:flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium text-xs md:text-sm hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                >
                  <User size={14} strokeWidth={1.8} />
                  <span>Connexion</span>
                </button>
                <button 
                  onClick={() => navigate('/signup')} 
                  className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-medium text-xs md:text-sm transition-all duration-200"
                >
                  <UserPlus size={14} strokeWidth={1.8} />
                  <span className="hidden sm:inline">S'inscrire</span>
                  <span className="sm:hidden">+</span>
                </button>
              </>
            )}

          </div>

        </div>
      </div>
    </nav>
  )
}

export default Navbar