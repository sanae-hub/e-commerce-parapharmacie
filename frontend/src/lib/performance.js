// Optimisations pour les images
export const IMAGE_CONFIG = {
  // Formats d'images modernes
  formats: ['webp', 'avif'],

  // Tailles responsives
  sizes: {
    mobile: 400,
    tablet: 768,
    desktop: 1200
  },

  // Qualité d'optimisation
  quality: {
    webp: 85,
    avif: 80,
    jpg: 90
  }
}

// Configuration du cache
export const CACHE_CONFIG = {
  // Durée de cache pour les ressources statiques
  static: 31536000, // 1 an

  // Durée de cache pour les API
  api: 300, // 5 minutes

  // Stratégies de cache
  strategies: {
    images: 'cache-first',
    api: 'network-first',
    static: 'cache-first'
  }
}

// Métriques de performance
export const PERFORMANCE_METRICS = {
  // Temps de chargement cible
  targetLoadTime: 3000, // 3 secondes

  // Seuils d'alerte
  thresholds: {
    lcp: 2500, // Largest Contentful Paint
    fid: 100,  // First Input Delay
    cls: 0.1   // Cumulative Layout Shift
  }
}