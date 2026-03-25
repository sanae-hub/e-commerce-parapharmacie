import { useState } from 'react';
import { ImageOff } from 'lucide-react';

const CloudinaryImage = ({ 
  src, 
  alt = 'Image', 
  className = '',
  fallbackSrc = null,
  showPlaceholder = true 
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  // Si erreur et pas de fallback, afficher placeholder
  if (error && !fallbackSrc) {
    return showPlaceholder ? (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <ImageOff size={48} className="text-gray-400" />
      </div>
    ) : null;
  }

  return (
    <>
      {loading && (
        <div className={`bg-gray-200 animate-pulse ${className}`} />
      )}
      <img
        src={error && fallbackSrc ? fallbackSrc : src}
        alt={alt}
        className={`${className} ${loading ? 'hidden' : ''}`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />
    </>
  );
};

export default CloudinaryImage;

// UTILISATION :

// Exemple 1 : Simple
// <CloudinaryImage 
//   src="https://res.cloudinary.com/demo/image/upload/v1234/product.jpg"
//   alt="Produit"
//   className="w-full h-48 object-cover rounded-lg"
// />

// Exemple 2 : Avec fallback
// <CloudinaryImage 
//   src={product.image}
//   fallbackSrc="/placeholder.jpg"
//   alt={product.name}
//   className="w-full h-48 object-cover"
// />

// Exemple 3 : Sans placeholder si erreur
// <CloudinaryImage 
//   src={product.image}
//   alt={product.name}
//   showPlaceholder={false}
//   className="w-32 h-32 rounded-full"
// />
