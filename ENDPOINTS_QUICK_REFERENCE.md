# 📋 Résumé Rapide - Endpoints API ParaClick

## 🔐 AUTHENTIFICATION (/api/auth)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/auth/signup` | Inscription utilisateur | ❌ |
| POST | `/auth/login` | Connexion utilisateur | ❌ |
| POST | `/auth/forgot-password` | Demander réinitialisation mot de passe | ❌ |
| POST | `/auth/reset-password` | Réinitialiser mot de passe | ❌ |

---

## 👤 PROFIL & PANIER (/api/user)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/user/profile` | Récupérer profil connecté | ✅ |
| PUT | `/user/profile` | Modifier profil connecté | ✅ |
| POST | `/user/cart` | Sauvegarder panier | ✅ |
| GET | `/user/cart` | Récupérer panier | ✅ |

---

## 🛒 COMMANDES (/api/orders)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/orders/create` | Créer commande Click & Collect | ❌* |
| GET | `/orders/my-orders` | Récupérer commandes utilisateur | ✅ |
| PUT | `/orders/:orderId/cancel` | Annuler commande (user) | ✅ |
| PUT | `/orders/:orderId/status` | Changer statut (admin) | ❌* |
| POST | `/orders/send-confirmation` | Envoyer confirmation email | ❌* |

**❌* = Optionnelle selon le contexte**

---

## 📦 PRODUITS & CATALOGUE (/api/products)

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| GET | `/products` | Lister produits publics | ❌ | Tous |
| GET | `/products/:id` | Détail produit public | ❌ | Tous |
| POST | `/products` | Créer produit | ✅ | Admin |
| PUT | `/products/:id` | Modifier produit | ✅ | Admin |
| DELETE | `/products/:id` | Supprimer produit | ✅ | Admin |
| GET | `/products/search` | Rechercher produits | ❌ | Tous |

---

## 📚 CATÉGORIES (/api/admin/categories)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/admin/categories` | Lister catégories | ✅ Admin |
| POST | `/admin/categories` | Créer catégorie | ✅ Admin |
| PUT | `/admin/categories/:id` | Modifier catégorie | ✅ Admin |
| DELETE | `/admin/categories/:id` | Supprimer catégorie | ✅ Admin |
| POST | `/admin/categories/:id/subcategories` | Créer sous-catégorie | ✅ Admin |
| PUT | `/admin/categories/:id/subcategories/:subId` | Modifier sous-catégorie | ✅ Admin |
| DELETE | `/admin/categories/:id/subcategories/:subId` | Supprimer sous-catégorie | ✅ Admin |
| POST | `/admin/categories/:id/subcategories/:subId/items` | Créer item | ✅ Admin |
| PUT | `/admin/categories/:id/subcategories/:subId/items/:itemId` | Modifier item | ✅ Admin |
| DELETE | `/admin/categories/:id/subcategories/:subId/items/:itemId` | Supprimer item | ✅ Admin |

---

## 🎁 CODES PROMO (/api/admin/promo-codes)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/admin/promo-codes` | Lister codes promo | ✅ Admin |
| POST | `/admin/promo-codes` | Créer code promo | ✅ Admin |
| GET | `/admin/promo-codes/:id` | Détail code promo | ✅ Admin |
| PUT | `/admin/promo-codes/:id` | Modifier code promo | ✅ Admin |
| DELETE | `/admin/promo-codes/:id` | Supprimer code promo | ✅ Admin |

**Types :** `PERCENTAGE`, `FIXED_AMOUNT`

---

## 🎉 PROMOTIONS (/api/admin/promotions)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/admin/promotions` | Lister promotions | ✅ Admin |
| POST | `/admin/promotions` | Créer promotion | ✅ Admin |
| GET | `/admin/promotions/:id` | Détail promotion | ✅ Admin |
| PUT | `/admin/promotions/:id` | Modifier promotion | ✅ Admin |
| DELETE | `/admin/promotions/:id` | Supprimer promotion | ✅ Admin |
| GET | `/admin/promotions/:id/stats` | Stats promotion | ✅ Admin |
| PUT | `/admin/promotions/:id/stats` | Mettre à jour stats | ✅ Admin |

**Types :** `PRODUCT_DISCOUNT`, `CATEGORY_DISCOUNT`, `BANNER`

---

## ⏰ CRÉNEAUX (/api/admin/time-slots)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/admin/time-slots/config` | Config créneaux | ✅ Admin |
| PUT | `/admin/time-slots/config` | Modifier config | ✅ Admin |
| GET | `/admin/heatmap-slots` | Heatmap disponibilité | ✅ Admin |

---

## 📊 DASHBOARD & STATISTIQUES (/api/admin)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/admin/login` | Connexion admin | ❌ |
| GET | `/admin/kpis` | KPIs temps réel | ✅ Admin |
| GET | `/admin/sales-chart` | Graphique ventes | ✅ Admin |
| GET | `/admin/urgent-orders` | Commandes 2h | ✅ Admin |
| GET | `/admin/low-stock-products` | Produits stock faible | ✅ Admin |
| GET | `/admin/orders` | Lister commandes | ✅ Admin |

---

## ⬆️ UPLOAD (/api/upload)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/upload` | Upload image | ❌ |
| POST | `/upload/multiple` | Upload multiple | ❌ |

---

## 🏥 UTILITAIRE

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/health` | Vérifier serveur | ❌ |

---

## 📊 Résumé par Catégorie

### Authentification
- **4 endpoints** pour signup/login/réinitialisation

### Utilisateur
- **4 endpoints** pour profil et panier

### Commandes
- **5 endpoints** pour création/suivi/annulation

### Produits
- **6 endpoints** pour public + CRUD admin

### Catégories
- **10 endpoints** avec sous-catégories et items

### Promotions
- **5 endpoints** codes + **7 endpoints** promotions = **12 endpoints**

### Créneaux
- **3 endpoints** configuration et heatmap

### Dashboard
- **1 endpoint** login + **5 endpoints** statistiques = **6 endpoints**

### Fichiers
- **2 endpoints** upload

**Total : 52 endpoints au total**

---

## 🔄 Statuts de Commande

```
RECEIVED → PREPARING → READY → COMPLETED
                     ↓
                  CANCELLED
```

---

## 🔐 Authentification Bearer (JWT)

```
Authorization: Bearer <token_jwt>
```

**Expiration :** 7 jours

---

## 📱 Rôles Utilisateur

- **CLIENT** : Accès public + ses commandes
- **ADMIN** : Accès complet
- **CAISSIER** : Gestion commandes
- **PREPARATEUR** : Préparation

---

## ✅ Checklist des Méthodes HTTP

| Méthode | Total | Endpoints |
|---------|-------|-----------|
| **GET** | 26 | Récupération données |
| **POST** | 17 | Création ressources |
| **PUT** | 8 | Modification ressources |
| **DELETE** | 4 | Suppression ressources |
| **PATCH** | 0 | (Non utilisé) |

**Total : 52 requêtes**

---

## Error Handling

```json
{
  "error": "Description de l'erreur",
  "status": 400
}
```

---

## Rate Limiting

- ❌ Non implémenté actuellement
- 💡 À considérer pour production

---

## Documentation Complète

📖 Voir : [API_REST_DOCUMENTATION.md](API_REST_DOCUMENTATION.md)

---

**Version :** 1.0  
**Mise à jour :** 22 mars 2026
