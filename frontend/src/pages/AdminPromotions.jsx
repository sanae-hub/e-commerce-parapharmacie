import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tag, Plus, Edit2, Trash2, Copy, Eye, EyeOff, ChevronDown, BarChart3,
  Calendar, Percent, DollarSign, ShoppingCart, TrendingUp, Filter, Search,
  AlertCircle, X, Check, Clock
} from 'lucide-react';
import adminApi from '../api/adminAxios';

const AdminPromotions = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('promo-codes');
  const [loading, setLoading] = useState(false);
  const [promoCodes, setPromoCodes] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }
    adminApi.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
    setCurrentPage(1);
  }, [navigate, activeTab]);

  useEffect(() => {
    if (activeTab === 'promo-codes') {
      fetchPromoCodes();
    } else {
      fetchPromotions();
    }
  }, [currentPage, activeTab, filter]);

  const fetchPromoCodes = async () => {
    setLoading(true);
    try {
      const activeFilter = filter === 'all' ? '' : `&active=${filter === 'active'}`;
      const { data } = await adminApi.get(
        `/promo-codes?page=${currentPage}&limit=${limit}${activeFilter}`
      );
      setPromoCodes(data.promoCodes);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des codes promo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const activeFilter = filter === 'all' ? '' : `&active=${filter === 'active'}`;
      const { data } = await adminApi.get(
        `/promotions?page=${currentPage}&limit=${limit}${activeFilter}`
      );
      setPromotions(data.promotions);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des promotions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromoCode = async (data) => {
    try {
      await adminApi.post('/promo-codes', data);
      setSuccess('Code promo créé avec succès');
      setShowForm(false);
      setFormData(null);
      fetchPromoCodes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    }
  };

  const handleCreatePromotion = async (data) => {
    try {
      await adminApi.post('/promotions', data);
      setSuccess('Promotion créée avec succès');
      setShowForm(false);
      setFormData(null);
      fetchPromotions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    }
  };

  const handleDeletePromoCode = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce code promo ?')) return;
    try {
      await adminApi.delete(`/promo-codes/${id}`);
      setSuccess('Code promo supprimé');
      fetchPromoCodes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  const handleDeletePromotion = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) return;
    try {
      await adminApi.delete(`/promotions/${id}`);
      setSuccess('Promotion supprimée');
      fetchPromotions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  const togglePromoCodeStatus = async (id, currentStatus) => {
    try {
      await adminApi.put(`/promo-codes/${id}`, { active: !currentStatus });
      setSuccess('Statut mis à jour');
      fetchPromoCodes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de la mise à jour');
    }
  };

  const togglePromotionStatus = async (id, currentStatus) => {
    try {
      await adminApi.put(`/promotions/${id}`, { active: !currentStatus });
      setSuccess('Statut mis à jour');
      fetchPromotions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de la mise à jour');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Code copié !');
    setTimeout(() => setSuccess(''), 2000);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Tag size={28} className="text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Promotions</h1>
                <p className="text-sm text-gray-600">Codes promo et bannières promotionnelles</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Retour
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
            <button onClick={() => setError('')} className="ml-auto text-red-600">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800 font-medium">{success}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => {
              setActiveTab('promo-codes');
              setCurrentPage(1);
            }}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'promo-codes'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Tag size={18} className="inline mr-2" />
            Codes Promo
          </button>
          <button
            onClick={() => {
              setActiveTab('promotions');
              setCurrentPage(1);
            }}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'promotions'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Percent size={18} className="inline mr-2" />
            Bannières
          </button>
        </div>

        {/* Controls */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-600" />
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="all">Tous</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>

          <div className="flex-1 max-w-xs">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <button
            onClick={() => {
              setShowForm(true);
              setFormData(null);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            {activeTab === 'promo-codes' ? 'Nouveau Code' : 'Nouvelle Bannière'}
          </button>
        </div>

        {/* Promo Codes Tab */}
        {activeTab === 'promo-codes' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              </div>
            ) : promoCodes.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <Tag size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Aucun code promo</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Créer un code promo
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {promoCodes.map((promo) => (
                  <PromoCodeCard
                    key={promo.id}
                    promo={promo}
                    onEdit={(p) => {
                      setFormData(p);
                      setShowForm(true);
                    }}
                    onDelete={() => handleDeletePromoCode(promo.id)}
                    onToggle={() => togglePromoCodeStatus(promo.id, promo.active)}
                    onCopy={() => copyToClipboard(promo.code)}
                    onViewHistory={() => setSelectedPromo(promo)}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Affichage {(currentPage - 1) * limit + 1} à {Math.min(currentPage * limit, total)} sur {total}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        page === currentPage
                          ? 'bg-purple-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Promotions Tab */}
        {activeTab === 'promotions' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              </div>
            ) : promotions.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <Percent size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Aucune promotion</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Créer une promotion
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {promotions.map((promotion) => (
                  <PromotionCard
                    key={promotion.id}
                    promotion={promotion}
                    onEdit={(p) => {
                      setFormData(p);
                      setShowForm(true);
                    }}
                    onDelete={() => handleDeletePromotion(promotion.id)}
                    onToggle={() => togglePromotionStatus(promotion.id, promotion.active)}
                    onViewStats={() => console.log('View stats:', promotion)}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Affichage {(currentPage - 1) * limit + 1} à {Math.min(currentPage * limit, total)} sur {total}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        page === currentPage
                          ? 'bg-purple-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Formulaire */}
      {showForm && (
        <FormModal
          type={activeTab}
          data={formData}
          onSubmit={activeTab === 'promo-codes' ? handleCreatePromoCode : handleCreatePromotion}
          onClose={() => {
            setShowForm(false);
            setFormData(null);
          }}
        />
      )}

      {/* Modal Historique */}
      {selectedPromo && (
        <HistoryModal
          promo={selectedPromo}
          onClose={() => setSelectedPromo(null)}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
};

// Composant PromoCodeCard
const PromoCodeCard = ({
  promo,
  onEdit,
  onDelete,
  onToggle,
  onCopy,
  onViewHistory,
  formatCurrency,
  formatDate
}) => {
  const isExpired = promo.expiryDate && new Date(promo.expiryDate) < new Date();
  const isLimited = promo.usageLimit && promo.usageCount >= promo.usageLimit;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <code className="text-lg font-mono font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded">
              {promo.code}
            </code>
            <button
              onClick={onCopy}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Copier le code"
            >
              <Copy size={16} />
            </button>
            {!promo.active && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium">
                <EyeOff size={14} />
                Désactivé
              </span>
            )}
            {isExpired && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs font-medium">
                <Clock size={14} />
                Expiré
              </span>
            )}
            {isLimited && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs font-medium">
                <AlertCircle size={14} />
                Limite atteinte
              </span>
            )}
          </div>
          {promo.description && (
            <p className="text-gray-600 text-sm">{promo.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onViewHistory()}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Voir l'historique"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => onEdit(promo)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Modifier"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-400 hover:text-red-600 transition-colors"
            title="Supprimer"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b border-gray-200">
        <div>
          <p className="text-xs text-gray-500 mb-1">Réduction</p>
          <p className="text-lg font-semibold text-gray-900">
            {promo.discountValue}{promo.discountType === 'percentage' ? '%' : ' DH'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Type</p>
          <p className="text-sm font-medium text-gray-900">
            {promo.applicableOn === 'global'
              ? 'Global'
              : promo.applicableOn === 'product'
              ? 'Produit'
              : 'Catégorie'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Utilisations</p>
          <p className="text-sm font-medium text-gray-900">
            {promo.usageCount}
            {promo.usageLimit ? `/${promo.usageLimit}` : ''}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Expiration</p>
          <p className="text-sm font-medium text-gray-900">
            {promo.expiryDate ? formatDate(promo.expiryDate) : 'Sans limite'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        {promo.minPurchaseAmount > 0 && (
          <span className="text-xs text-gray-500">
            Montant minimum: {formatCurrency(promo.minPurchaseAmount)}
          </span>
        )}
        <button
          onClick={onToggle}
          className={`ml-auto px-3 py-1 rounded text-sm font-medium transition-colors ${
            promo.active
              ? 'bg-green-50 text-green-700 hover:bg-green-100'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {promo.active ? 'Actif' : 'Inactif'}
        </button>
      </div>
    </div>
  );
};

// Composant PromotionCard
const PromotionCard = ({
  promotion,
  onEdit,
  onDelete,
  onToggle,
  onViewStats,
  formatCurrency,
  formatDate
}) => {
  const today = new Date();
  const startDate = new Date(promotion.startDate);
  const endDate = new Date(promotion.endDate);
  const isActive = today >= startDate && today <= endDate;
  const isUpcoming = today < startDate;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        {promotion.bannerImage && (
          <img
            src={promotion.bannerImage}
            alt={promotion.title}
            className="w-full md:w-48 h-32 md:h-auto object-cover"
          />
        )}

        {/* Contenu */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div className="mb-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{promotion.title}</h3>
                {promotion.description && (
                  <p className="text-sm text-gray-600 mt-1">{promotion.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onViewStats()}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Statistiques"
                >
                  <BarChart3 size={18} />
                </button>
                <button
                  onClick={() => onEdit(promotion)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Modifier"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={onDelete}
                  className="p-2 text-red-400 hover:text-red-600 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap mt-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded text-sm font-medium">
                {promotion.discountValue}{promotion.discountType === 'percentage' ? '%' : ' DH'}
                de réduction
              </span>
              {isActive && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-sm font-medium">
                  <TrendingUp size={14} />
                  En cours
                </span>
              )}
              {isUpcoming && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm font-medium">
                  <Clock size={14} />
                  À venir
                </span>
              )}
              {!promotion.active && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded text-sm font-medium">
                  <EyeOff size={14} />
                  Désactivée
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-t border-gray-200 pt-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Début</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(promotion.startDate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Fin</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(promotion.endDate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Affichage</p>
              <p className="text-sm font-medium text-gray-900">
                {promotion.displayOnHomepage ? 'Accueil' : 'Non affiché'}
              </p>
            </div>
            <div>
              <button
                onClick={onToggle}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  promotion.active
                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {promotion.active ? 'Activée' : 'Désactivée'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant FormModal
const FormModal = ({ type, data, onSubmit, onClose }) => {
  const [formData, setFormData] = useState(
    data || (type === 'promo-codes'
      ? {
          code: '',
          description: '',
          discountType: 'percentage',
          discountValue: '',
          applicableOn: 'global',
          productIds: [],
          categoryIds: [],
          minPurchaseAmount: '',
          maxDiscountAmount: '',
          usageLimit: '',
          expiryDate: '',
          active: true
        }
      : {
          title: '',
          description: '',
          bannerImage: '',
          bannerText: '',
          discountType: 'percentage',
          discountValue: '',
          applicableOn: 'global',
          productIds: [],
          categoryIds: [],
          minPurchaseAmount: '',
          maxDiscountAmount: '',
          startDate: '',
          endDate: '',
          displayOnHomepage: true,
          order: 0,
          active: true
        }
    )
  );

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (type === 'promo-codes' && !formData.code) {
      setError('Le code est requis');
      return;
    }
    
    if (!formData.discountValue) {
      setError('La valeur de réduction est requise');
      return;
    }

    if (type === 'promotions' && !formData.title) {
      setError('Le titre est requis');
      return;
    }

    if (type === 'promotions' && (!formData.startDate || !formData.endDate)) {
      setError('Les dates de début et fin sont requises');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {data ? 'Modifier' : 'Créer'} {type === 'promo-codes' ? 'un code promo' : 'une promotion'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {type === 'promo-codes' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code Promo
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="EX: PROMO20"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={!!data}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optionnel)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Description du code promo..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de réduction
                  </label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="percentage">Pourcentage (%)</option>
                    <option value="fixed">Montant fixe (DH)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valeur
                  </label>
                  <input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleChange}
                    placeholder="20"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  S'applique sur
                </label>
                <select
                  name="applicableOn"
                  value={formData.applicableOn}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="global">Panier global</option>
                  <option value="product">Produit spécifique</option>
                  <option value="category">Catégorie</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant minimum (optionnel)
                  </label>
                  <input
                    type="number"
                    name="minPurchaseAmount"
                    value={formData.minPurchaseAmount}
                    onChange={handleChange}
                    placeholder="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Réduction max (optionnel)
                  </label>
                  <input
                    type="number"
                    name="maxDiscountAmount"
                    value={formData.maxDiscountAmount}
                    onChange={handleChange}
                    placeholder="500"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Limite d'utilisations (optionnel)
                  </label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleChange}
                    placeholder="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'expiration (optionnel)
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Actif</span>
              </label>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ex: Soldes d'hiver"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Description de la promotion..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image bannière (URL Cloudinary)
                </label>
                <input
                  type="text"
                  name="bannerImage"
                  value={formData.bannerImage}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de réduction
                  </label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="percentage">Pourcentage (%)</option>
                    <option value="fixed">Montant fixe (DH)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valeur
                  </label>
                  <input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleChange}
                    placeholder="20"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="displayOnHomepage"
                    checked={formData.displayOnHomepage}
                    onChange={handleChange}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Afficher sur l'accueil</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Actif</span>
                </label>
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              {data ? 'Mise à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Composant HistoryModal
const HistoryModal = ({ promo, onClose, formatDate, formatCurrency }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await adminApi.get(`/promo-codes/${promo.id}/history`);
        setHistory(data.history);
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [promo.id]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Historique d'utilisation</h2>
            <p className="text-sm text-gray-600 mt-1">Code: <code className="font-mono font-bold text-purple-600">{promo.code}</code></p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Pas d'utilisation encore</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 text-sm">Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 text-sm">Commande</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 text-sm">Client</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-700 text-sm">Montant total</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-700 text-sm">Réduction</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">
                        {item.order?.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {item.order?.user
                          ? `${item.order.user.firstName} ${item.order.user.lastName}`
                          : 'Client supprimé'}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900">
                        {formatCurrency(item.order?.total || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-right text-green-600">
                        -{formatCurrency(item.appliedDiscount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPromotions;
