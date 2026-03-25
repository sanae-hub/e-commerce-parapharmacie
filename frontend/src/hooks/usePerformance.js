import { useEffect, useState } from 'react'

// Hook pour mesurer les performances
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    lcp: 0,
    fid: 0,
    cls: 0
  })

  useEffect(() => {
    // Mesure du temps de chargement
    const loadTime = performance.now()
    setMetrics(prev => ({ ...prev, loadTime }))

    // Largest Contentful Paint (LCP)
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }))
    })
    observer.observe({ entryTypes: ['largest-contentful-paint'] })

    // Cumulative Layout Shift (CLS)
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      }
      setMetrics(prev => ({ ...prev, cls: clsValue }))
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        setMetrics(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }))
      }
    })
    fidObserver.observe({ entryTypes: ['first-input'] })

    return () => {
      observer.disconnect()
      clsObserver.disconnect()
      fidObserver.disconnect()
    }
  }, [])

  return metrics
}

// Fonction pour mesurer la vitesse de connexion
export const getConnectionSpeed = () => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection

  if (!connection) return 'unknown'

  const { effectiveType } = connection

  switch (effectiveType) {
    case '4g':
      return '4g'
    case '3g':
      return '3g'
    case '2g':
      return '2g'
    case 'slow-2g':
      return 'slow-2g'
    default:
      return 'unknown'
  }
}

// Hook pour adapter le contenu selon la vitesse de connexion
export const useAdaptiveLoading = () => {
  const [connectionSpeed, setConnectionSpeed] = useState('unknown')

  useEffect(() => {
    setConnectionSpeed(getConnectionSpeed())

    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    if (connection) {
      const updateConnectionSpeed = () => {
        setConnectionSpeed(getConnectionSpeed())
      }

      connection.addEventListener('change', updateConnectionSpeed)
      return () => connection.removeEventListener('change', updateConnectionSpeed)
    }
  }, [])

  // Retourne true si la connexion est lente
  const isSlowConnection = ['2g', 'slow-2g'].includes(connectionSpeed)

  return { connectionSpeed, isSlowConnection }
}