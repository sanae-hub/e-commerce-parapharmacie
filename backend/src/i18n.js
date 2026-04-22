// src/i18n.js
// Module d'internationalisation simple pour le backend

const i18n = {
  // Langue par défaut
  locale: 'fr',
  
  // Traductions
  translations: {
    fr: {
      'order.created': 'Commande créée avec succès',
      'order.not_found': 'Commande non trouvée',
      'order.status_updated': 'Statut de la commande mis à jour',
      'order.cancelled': 'Commande annulée',
      'order.cannot_cancel': 'Cette commande ne peut pas être annulée',
      'error.server': 'Erreur serveur',
      'error.unauthorized': 'Non autorisé',
      'error.invalid_token': 'Token invalide',
      'error.missing_fields': 'Champs manquants',
      'product.out_of_stock': 'Produit en rupture de stock',
      'product.not_found': 'Produit non trouvé',
      'success.login': 'Connexion réussie',
      'success.logout': 'Déconnexion réussie',
      'success.profile_updated': 'Profil mis à jour',
    },
    en: {
      'order.created': 'Order created successfully',
      'order.not_found': 'Order not found',
      'order.status_updated': 'Order status updated',
      'order.cancelled': 'Order cancelled',
      'order.cannot_cancel': 'This order cannot be cancelled',
      'error.server': 'Server error',
      'error.unauthorized': 'Unauthorized',
      'error.invalid_token': 'Invalid token',
      'error.missing_fields': 'Missing fields',
      'product.out_of_stock': 'Product out of stock',
      'product.not_found': 'Product not found',
      'success.login': 'Login successful',
      'success.logout': 'Logout successful',
      'success.profile_updated': 'Profile updated',
    }
  },
  
  t: function(key, params = {}) {
    let text = this.translations[this.locale]?.[key] || key;
    Object.keys(params).forEach(param => {
      text = text.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
    });
    return text;
  },
  
  setLocale: function(locale) {
    if (this.translations[locale]) {
      this.locale = locale;
    }
  },
  
  getLocale: function() {
    return this.locale;
  }
};

export default i18n;