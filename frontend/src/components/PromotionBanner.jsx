import { useState, useEffect, Suspense, lazy } from 'react';
import { ChevronRight, ChevronLeft, Percent, DollarSign, X } from 'lucide-react';
import api from '../api/axios';

// Promotions par défaut pour chargement rapide
const DEFAULT_PROMOTIONS = []; // Aucun contenu par défaut pour ne pas afficher le bandeau de bienvenue par défaut

const PromotionBanner = () => {
  const [promotions, setPromotions] = useState(DEFAULT_PROMOTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    // Chargement différé des vraies promotions
    const timer = setTimeout(() => {
      fetchActivePromotions();
    }, 1000); // Délai de 1 seconde pour prioriser le contenu principal

    return () => clearTimeout(timer);
  }, []);

  const fetchActivePromotions = async () => {
    try {
      const { data } = await api.get('/promotions/active');
      const filtered = data.filter(p => p.displayOnHomepage && p.active);
      if (filtered.length > 0) {
        setPromotions(filtered.sort((a, b) => a.order - b.order));
        setDataLoaded(true);
      }
    } catch (err) {
      console.error('Error fetching promotions:', err);
      // Garde les promotions par défaut en cas d'erreur
    }
  };

  useEffect(() => {
    if (!autoPlay || promotions.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promotions.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay, promotions.length]);

  // Toujours afficher le composant avec les promotions par défaut
  if (promotions.length === 0) return null;

  const current = promotions[currentIndex];
  const isPercentage = current.discountType === 'percentage';

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? promotions.length - 1 : prev - 1
    );
    setAutoPlay(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % promotions.length);
    setAutoPlay(false);
  };

  const handleClose = () => {
    setPromotions(promotions.filter((_, i) => i !== currentIndex));
    if (currentIndex >= promotions.length - 1) {
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative h-64 md:h-96 bg-gradient-to-r from-gray-900 to-gray-800">
        {/* Fond avec image */}
        {current.bannerImage && (
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `url(${current.bannerImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        )}

        {/* Contenu */}
        <div className="relative h-full flex items-center justify-between px-6 md:px-12">
          {/* Côté gauche - Texte et détails */}
          <div className="flex-1 pr-8">
            <div className="space-y-2 md:space-y-4">
              <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight">
                {current.title}
              </h2>

              {current.description && (
                <p className="text-gray-200 text-sm md:text-base max-w-md">
                  {current.description}
                </p>
              )}

              {current.bannerText && (
                <p className="text-gray-300 text-sm md:text-base italic">
                  {current.bannerText}
                </p>
              )}

              {/* Badge de réduction */}
              <div className="pt-2 md:pt-4">
                <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm px-4 md:px-6 py-2 rounded-lg border border-white border-opacity-30">
                  {isPercentage ? (
                    <Percent size={20} className="text-yellow-400" />
                  ) : (
                    <DollarSign size={20} className="text-green-400" />
                  )}
                  <span className="text-white font-bold text-lg md:text-2xl">
                    {current.discountValue}
                    {isPercentage ? '%' : ' DH'}
                  </span>
                  <span className="text-white text-xs md:text-sm ml-2">
                    {isPercentage ? 'de réduction' : 'de réduction'}
                  </span>
                </div>
              </div>

              {/* Dates */}
              <div className="pt-2 text-xs md:text-sm text-gray-300">
                <p>
                  Du {new Date(current.startDate).toLocaleDateString('fr-FR')} au{' '}
                  {new Date(current.endDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>

          {/* Côté droit - Bouton CTA (optionnel) */}
          <div className="hidden md:flex flex-col items-center justify-center">
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-semibold transition-all transform hover:scale-105 mb-4">
              Découvrir
              <ChevronRight className="inline ml-2" size={18} />
            </button>
          </div>
        </div>

        {/* Bouton fermeture */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 bg-black bg-opacity-40 hover:bg-opacity-60 rounded-lg text-white transition-all"
          aria-label="Fermer la bannière"
        >
          <X size={20} />
        </button>

        {/* Navigation si plusieurs promotions */}
        {promotions.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black bg-opacity-40 hover:bg-opacity-60 rounded-full text-white transition-all z-10"
              aria-label="Promotion précédente"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black bg-opacity-40 hover:bg-opacity-60 rounded-full text-white transition-all z-10"
              aria-label="Promotion suivante"
            >
              <ChevronRight size={24} />
            </button>

            {/* Points de pagination */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {promotions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setAutoPlay(false);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'bg-white w-8'
                      : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                  }`}
                  aria-label={`Aller à la promotion ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Hover pour relancer l'autoplay */}
      <div
        className="absolute inset-0 opacity-0 hover:opacity-0"
        onMouseEnter={() => setAutoPlay(false)}
        onMouseLeave={() => setAutoPlay(true)}
      />
    </div>
  );
};

export default PromotionBanner;
