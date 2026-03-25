# 📚 Architecture RESTful API - ParaClick E-commerce

## Vue d'ensemble

Cette documentation décrit tous les endpoints REST de l'API ParaClick avec les méthodes HTTP supportées (GET, POST, PUT, PATCH, DELETE).

**URL de base :** `http://localhost:5000/api`

---

## 🔐 Authentification (/api/auth)

### 1. **POST** `/auth/signup` - Inscription utilisateur

Créer un nouveau compte client.

**Requête :**
```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean.dupont@email.com",
  "phone": "+212612345678",
  "address": "123 Rue de Paris, Casablanca",
  "password": "SecurePass123!"
}
```

**Réponse :** `201 Created`
```json
{
  "message": "Inscription réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_12345",
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean.dupont@email.com"
  }
}
```

---

### 2. **POST** `/auth/login` - Connexion utilisateur

Authentifier un client.

**Requête :**
```json
{
  "email": "jean.dupont@email.com",
  "password": "SecurePass123!"
}
```

**Réponse :** `200 OK`
```json
{
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_12345",
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean.dupont@email.com"
  }
}
```

---

### 3. **POST** `/auth/forgot-password` - Demander réinitialisation

Envoyer un email pour réinitialiser le mot de passe.

**Requête :**
```json
{
  "email": "jean.dupont@email.com"
}
```

**Réponse :** `200 OK`
```json
{
  "message": "Email de réinitialisation envoyé"
}
```

---

### 4. **POST** `/auth/reset-password` - Réinitialiser mot de passe

Définir un nouveau mot de passe avec le token reçu par email.

**Requête :**
```json
{
  "token": "a1b2c3d4e5f6g7h8...",
  "password": "NewPassword123!"
}
```

**Réponse :** `200 OK`
```json
{
  "message": "Mot de passe réinitialisé avec succès"
}
```

---

## 👤 Profil & Panier (/api/user)

### 5. **GET** `/user/profile` - Récupérer profil utilisateur

Récupérer les informations du profil connecté.

**Authentification :** ✅ Requise (Bearer Token)

**Réponse :** `200 OK`
```json
{
  "id": "user_12345",
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean.dupont@email.com",
  "phone": "+212612345678",
  "address": "123 Rue de Paris, Casablanca",
  "profileImage": "https://cloudinary.com/...",
  "notificationEmail": true,
  "notificationSMS": true,
  "notificationPush": false
}
```

---

### 6. **PUT** `/user/profile` - Modifier profil utilisateur

Mettre à jour les informations du profil connecté.

**Authentification :** ✅ Requise

**Requête :**
```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "phone": "+212612345678",
  "address": "456 Avenue Mohammed V, Rabat",
  "profileImage": "https://cloudinary.com/...",
  "notificationEmail": true,
  "notificationSMS": false,
  "notificationPush": true
}
```

**Réponse :** `200 OK`
```json
{
  "message": "Profil mis à jour avec succès",
  "user": {
    "id": "user_12345",
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean.dupont@email.com",
    "phone": "+212612345678",
    "address": "456 Avenue Mohammed V, Rabat",
    "profileImage": "https://cloudinary.com/...",
    "notificationEmail": true,
    "notificationSMS": false,
    "notificationPush": true
  }
}
```

---

### 7. **POST** `/user/cart` - Sauvegarder panier

Enregistrer le panier de l'utilisateur.

**Authentification :** ✅ Requise

**Requête :**
```json
{
  "cart": [
    {
      "id": "prod_123",
      "name": "Gel Douche Bio",
      "price": 49.99,
      "quantity": 2,
      "image": "https://cloudinary.com/..."
    },
    {
      "id": "prod_456",
      "name": "Shampoing Natural",
      "price": 79.99,
      "quantity": 1,
      "image": "https://cloudinary.com/..."
    }
  ]
}
```

**Réponse :** `200 OK`
```json
{
  "message": "Panier sauvegardé"
}
```

---

### 8. **GET** `/user/cart` - Récupérer panier

Récupérer le panier sauvegardé de l'utilisateur.

**Authentification :** ✅ Requise

**Réponse :** `200 OK`
```json
{
  "cart": [
    {
      "id": "prod_123",
      "name": "Gel Douche Bio",
      "price": 49.99,
      "quantity": 2,
      "image": "https://cloudinary.com/..."
    },
    {
      "id": "prod_456",
      "name": "Shampoing Natural",
      "price": 79.99,
      "quantity": 1,
      "image": "https://cloudinary.com/..."
    }
  ]
}
```

---

## 🛒 Commandes (/api/orders)

### 9. **POST** `/orders/create` - Créer commande

Créer une nouvelle commande Click & Collect.

**Authentification :** ❌ Optionnelle (guest ou logué)

**Requête :**
```json
{
  "items": [
    {
      "productId": "prod_123",
      "quantity": 2,
      "price": 49.99
    }
  ],
  "total": 119.98,
  "timeSlot": {
    "date": "2026-03-25",
    "startTime": "14:00",
    "endTime": "15:00"
  },
  "orderNumber": "ORDER-2026-001",
  "type": "CLICK_COLLECT"
}
```

**Réponse :** `201 Created`
```json
{
  "id": "order_12345",
  "orderNumber": "ORDER-2026-001",
  "userId": "user_12345",
  "total": 119.98,
  "status": "RECEIVED",
  "timeSlotDate": "2026-03-25",
  "timeSlotStart": "14:00",
  "timeSlotEnd": "15:00",
  "items": [
    {
      "productId": "prod_123",
      "quantity": 2,
      "price": 49.99
    }
  ],
  "createdAt": "2026-03-22T10:30:00.000Z"
}
```

---

### 10. **GET** `/orders/my-orders` - Récupérer commandes utilisateur

Récupérer toutes les commandes de l'utilisateur connecté.

**Authentification :** ✅ Requise

**Réponse :** `200 OK`
```json
{
  "orders": [
    {
      "id": "order_12345",
      "orderNumber": "ORDER-2026-001",
      "total": 119.98,
      "status": "READY",
      "timeSlotDate": "2026-03-25",
      "timeSlotStart": "14:00",
      "items": [
        {
          "productId": "prod_123",
          "quantity": 2,
          "product": {
            "name": "Gel Douche Bio",
            "price": 49.99,
            "image": "https://cloudinary.com/..."
          }
        }
      ],
      "createdAt": "2026-03-22T10:30:00.000Z"
    }
  ]
}
```

---

### 11. **PUT** `/orders/:orderId/cancel` - Annuler commande

Annuler une commande (seulement si status = RECEIVED).

**Authentification :** ✅ Requise

**Paramètres URL :**
- `orderId` : ID de la commande

**Réponse :** `200 OK`
```json
{
  "message": "Commande annulée",
  "order": {
    "id": "order_12345",
    "status": "CANCELLED",
    "orderNumber": "ORDER-2026-001"
  }
}
```

---

### 12. **PUT** `/orders/:orderId/status` - Mettre à jour statut (Admin)

Mettre à jour le statut d'une commande (RECEIVED → PREPARING → READY → COMPLETED).

**Authentification :** ❌ Non requise (pour WebSocket admin)

**Paramètres URL :**
- `orderId` : ID de la commande

**Requête :**
```json
{
  "status": "PREPARING"
}
```

**Valeurs possibles :** `RECEIVED`, `PREPARING`, `READY`, `COMPLETED`, `CANCELLED`

**Réponse :** `200 OK`
```json
{
  "message": "Statut mis à jour",
  "order": {
    "id": "order_12345",
    "status": "PREPARING",
    "orderNumber": "ORDER-2026-001"
  }
}
```

---

### 13. **POST** `/orders/send-confirmation` - Envoyer confirmation

Envoyer un email de confirmation de commande avec QR code.

**Authentification :** ❌ Optionnelle

**Requête :**
```json
{
  "orderNumber": "ORDER-2026-001",
  "timeSlot": {
    "date": "2026-03-25"
  },
  "qrCode": "data:image/png;base64,..."
}
```

**Réponse :** `200 OK`
```json
{
  "message": "Email envoyé"
}
```

---

## 📦 Produits & Catalogue (/api/products)

### 14. **GET** `/products` - Lister produits (public)

Récupérer la liste des produits disponibles avec filtres (publique).

**Paramètres Query :**
- `page` : Numéro de page (défaut: 1)
- `limit` : Résultats par page (défaut: 20)
- `search` : Recherche par nom/SKU/marque
- `categoryId` : Filtrer par catégorie
- `brandId` : Filtrer par marque
- `minPrice` : Prix minimum
- `maxPrice` : Prix maximum
- `inStock` : Uniquement produits en stock (true/false)

**Réponse :** `200 OK`
```json
{
  "products": [
    {
      "id": "prod_123",
      "name": "Gel Douche Bio",
      "description": "Gel douche naturel sans paraben",
      "price": 49.99,
      "oldPrice": 59.99,
      "stock": 150,
      "image": "https://cloudinary.com/...",
      "category": {
        "id": "cat_1",
        "name": "Soins corporels"
      },
      "brand": "BioBeauté",
      "rating": 4.5,
      "reviews": 23
    }
  ],
  "total": 245,
  "page": 1,
  "pages": 13
}
```

---

### 15. **GET** `/products/:id` - Détail produit

Récupérer les détails complets d'un produit (public).

**Paramètres URL :**
- `id` : ID du produit

**Réponse :** `200 OK`
```json
{
  "id": "prod_123",
  "name": "Gel Douche Bio",
  "description": "Gel douche naturel sans paraben",
  "usage": "Utiliser sur peau mouillée",
  "composition": "Eau, Alcool cétylique, Glycérine...",
  "benefits": ["Hydratant", "Doux", "Respectueux de la peau"],
  "price": 49.99,
  "oldPrice": 59.99,
  "stock": 150,
  "image": "https://cloudinary.com/...",
  "images": [
    "https://cloudinary.com/prod_123_1.jpg",
    "https://cloudinary.com/prod_123_2.jpg"
  ],
  "category": {
    "id": "cat_1",
    "name": "Soins corporels"
  },
  "brand": "BioBeauté",
  "sku": "GDB-BIO-500",
  "type": "PHYSICAL",
  "variants": [
    {
      "id": "var_1",
      "name": "500ml",
      "price": 49.99
    }
  ],
  "rating": 4.5,
  "reviews": 23,
  "relatedProducts": [...]
}
```

---

### 16. **POST** `/products` - Créer produit (Admin)

Créer un nouveau produit.

**Authentification :** ✅ Requise (Admin)

**Requête :**
```json
{
  "name": "Gel Douche Bio",
  "description": "Gel douche naturel",
  "usage": "Sur peau mouillée",
  "composition": "Eau, Glycérine...",
  "benefits": ["Hydratant", "Doux"],
  "price": 49.99,
  "oldPrice": 59.99,
  "brand": "BioBeauté",
  "brandId": "brand_1",
  "sku": "GDB-BIO-500",
  "stock": 100,
  "stockAlert": 10,
  "categoryId": "cat_1",
  "type": "PHYSICAL",
  "variants": [
    {
      "name": "500ml",
      "price": 49.99
    }
  ],
  "active": true
}
```

**Réponse :** `201 Created`
```json
{
  "id": "prod_123",
  "name": "Gel Douche Bio",
  "price": 49.99,
  "stock": 100,
  "category": {
    "id": "cat_1",
    "name": "Soins corporels"
  },
  "createdAt": "2026-03-22T10:30:00.000Z"
}
```

---

### 17. **PUT** `/products/:id` - Modifier produit (Admin)

Mettre à jour un produit existant.

**Authentification :** ✅ Requise (Admin)

**Paramètres URL :**
- `id` : ID du produit

**Requête :** (même structure que POST `/products`)

**Réponse :** `200 OK`
```json
{
  "id": "prod_123",
  "name": "Gel Douche Bio - Édition 2026",
  "price": 54.99,
  "stock": 120,
  "updatedAt": "2026-03-22T11:45:00.000Z"
}
```

---

## 📚 Catégories (/api/admin/categories)

### 18. **GET** `/admin/categories` - Lister catégories (Admin)

Récupérer toutes les catégories avec sous-catégories.

**Authentification :** ✅ Requise (Admin)

**Réponse :** `200 OK`
```json
[
  {
    "id": "cat_1",
    "name": "Soins corporels",
    "icon": "🧴",
    "order": 1,
    "subcategories": [
      {
        "id": "subcat_1",
        "title": "Gels douche",
        "icon": "🛁",
        "order": 1,
        "items": [
          {
            "id": "item_1",
            "name": "Bio & Natural",
            "order": 1
          }
        ]
      }
    ],
    "_count": {
      "products": 45
    }
  }
]
```

---

### 19. **POST** `/admin/categories` - Créer catégorie (Admin)

Créer une nouvelle catégorie.

**Authentification :** ✅ Requise (Admin)

**Requête :**
```json
{
  "name": "Soins visage",
  "icon": "😊",
  "hasSubcategories": true,
  "order": 2
}
```

**Réponse :** `201 Created`
```json
{
  "id": "cat_2",
  "name": "Soins visage",
  "icon": "😊",
  "hasSubcategories": true,
  "order": 2
}
```

---

### 20. **PUT** `/admin/categories/:id` - Modifier catégorie (Admin)

Mettre à jour une catégorie.

**Authentification :** ✅ Requise (Admin)

**Paramètres URL :**
- `id` : ID de la catégorie

**Requête :**
```json
{
  "name": "Soins visage avancés",
  "icon": "✨",
  "order": 2
}
```

**Réponse :** `200 OK`
```json
{
  "id": "cat_2",
  "name": "Soins visage avancés",
  "icon": "✨",
  "order": 2
}
```

---

### 21. **DELETE** `/admin/categories/:id` - Supprimer catégorie (Admin)

Supprimer une catégorie (impossible si produits associés).

**Authentification :** ✅ Requise (Admin)

**Paramètres URL :**
- `id` : ID de la catégorie

**Réponse :** `200 OK`
```json
{
  "message": "Catégorie supprimée"
}
```

**Erreur :** `400 Bad Request`
```json
{
  "error": "Impossible de supprimer: 5 produit(s) associé(s)"
}
```

---

### 22. **POST** `/admin/categories/:id/subcategories` - Créer sous-catégorie (Admin)

Créer une sous-catégorie.

**Authentification :** ✅ Requise (Admin)

**Paramètres URL :**
- `id` : ID de la catégorie parent

**Requête :**
```json
{
  "title": "Sérums",
  "icon": "💧",
  "order": 1
}
```

**Réponse :** `201 Created`
```json
{
  "id": "subcat_2",
  "title": "Sérums",
  "icon": "💧",
  "categoryId": "cat_2",
  "order": 1
}
```

---

### 23. **PUT** `/admin/categories/:id/subcategories/:subId` - Modifier sous-catégorie (Admin)

Mettre à jour une sous-catégorie.

**Authentification :** ✅ Requise (Admin)

**Paramètres URL :**
- `id` : ID de la catégorie parent
- `subId` : ID de la sous-catégorie

**Requête :**
```json
{
  "title": "Sérums Premium",
  "icon": "👑",
  "order": 1
}
```

**Réponse :** `200 OK`
```json
{
  "id": "subcat_2",
  "title": "Sérums Premium",
  "icon": "👑",
  "order": 1
}
```

---

### 24. **DELETE** `/admin/categories/:id/subcategories/:subId` - Supprimer sous-catégorie (Admin)

Supprimer une sous-catégorie.

**Authentification :** ✅ Requise (Admin)

**Paramètres URL :**
- `id` : ID de la catégorie parent
- `subId` : ID de la sous-catégorie

**Réponse :** `200 OK`
```json
{
  "message": "Sous-catégorie supprimée"
}
```

---

### 25. **POST** `/admin/categories/:id/subcategories/:subId/items` - Créer item (Admin)

Créer un item de sous-catégorie.

**Authentification :** ✅ Requise (Admin)

**Paramètres URL :**
- `id` : ID de la catégorie
- `subId` : ID de la sous-catégorie

**Requête :**
```json
{
  "name": "Sérums au collagène",
  "order": 1
}
```

**Réponse :** `201 Created`
```json
{
  "id": "item_2",
  "name": "Sérums au collagène",
  "subcategoryId": "subcat_2",
  "order": 1
}
```

---

### 26. **PUT** `/admin/categories/:id/subcategories/:subId/items/:itemId` - Modifier item (Admin)

Mettre à jour un item.

**Authentification :** ✅ Requise (Admin)

**Paramètres URL :**
- `id` : ID de la catégorie
- `subId` : ID de la sous-catégorie
- `itemId` : ID de l'item

**Requête :**
```json
{
  "name": "Sérums hydratants premium",
  "order": 1
}
```

**Réponse :** `200 OK`
```json
{
  "id": "item_2",
  "name": "Sérums hydratants premium",
  "order": 1
}
```

---

### 27. **DELETE** `/admin/categories/:id/subcategories/:subId/items/:itemId` - Supprimer item (Admin)

Supprimer un item de sous-catégorie.

**Authentification :** ✅ Requise (Admin)

**Paramètres URL :**
- `id` : ID de la catégorie
- `subId` : ID de la sous-catégorie
- `itemId` : ID de l'item

**Réponse :** `200 OK`
```json
{
  "message": "Item supprimé"
}
```

---

## 🎁 Codes Promotionnels (/api/admin/promo-codes)

### 28. **GET** `/admin/promo-codes` - Lister codes promo (Admin)

Récupérer tous les codes promotionnels.

**Authentification :** ✅ Requise (Admin)

**Paramètres Query :**
- `active` : Filtrer par statut (true/false)
- `search` : Rechercher par code
- `page` : Numéro de page
- `limit` : Résultats par page

**Réponse :** `200 OK`
```json
[
  {
    "id": "promo_1",
    "code": "PRINTEMPS20",
    "type": "PERCENTAGE",
    "discountValue": 20,
    "maxUses": 100,
    "usedCount": 23,
    "active": true,
    "startDate": "2026-03-01T00:00:00.000Z",
    "endDate": "2026-04-30T23:59:59.000Z",
    "createdAt": "2026-02-28T10:00:00.000Z"
  }
]
```

---

### 29. **POST** `/admin/promo-codes` - Créer code promo (Admin)

Créer un nouveau code promotionnel.

**Authentification :** ✅ Requise (Admin)

**Requête :**
```json
{
  "code": "PRINTEMPS20",
  "type": "PERCENTAGE",
  "discountValue": 20,
  "minPurchase": 100,
  "maxUses": 100,
  "active": true,
  "startDate": "2026-03-01T00:00:00.000Z",
  "endDate": "2026-04-30T23:59:59.000Z",
  "description": "Promotion printemps 20%"
}
```

**Types possibles :** `PERCENTAGE`, `FIXED_AMOUNT`

**Réponse :** `201 Created`
```json
{
  "id": "promo_1",
  "code": "PRINTEMPS20",
  "type": "PERCENTAGE",
  "discountValue": 20,
  "createdAt": "2026-03-22T10:30:00.000Z"
}
```

---

### 30. **GET** `/admin/promo-codes/:id` - Détail code promo (Admin)

Récupérer les détails d'un code promo.

**Authentification :** ✅ Requise (Admin)

**Paramètres URL :**
- `id` : ID du code promo

**Réponse :** `200 OK`
```json
{
  "id": "promo_1",
  "code": "PRINTEMPS20",
  "type": "PERCENTAGE",
  "discountValue": 20,
  "minPurchase": 100,
  "maxUses": 100,
  "usedCount": 23,
  "active": true,
  "startDate": "2026-03-01T00:00:00.000Z",
  "endDate": "2026-04-30T23:59:59.000Z",
  "description": "Promotion printemps 20%",
  "createdAt": "2026-02-28T10:00:00.000Z",
  "updatedAt": "2026-03-22T10:30:00.000Z"
}
```

---

### 31. **PUT** `/admin/promo-codes/:id` - Modifier code promo (Admin)

Mettre à jour un code promo.

**Authentification :** ✅ Requise (Admin)

**Paramètres URL :**
- `id` : ID du code promo

**Requête :**
```json
{
  "active": false,
  "maxUses": 50,
  "endDate": "2026-03-31T23:59:59.000Z"
}
```

**Réponse :** `200 OK`
```json
{
  "id": "promo_1",
  "code": "PRINTEMPS20",
  "active": false,
  "maxUses": 50,
  "updatedAt": "2026-03-22T11:00:00.000Z"
}
```

---

### 32. **DELETE** `/admin/promo-codes/:id` - Supprimer code promo (Admin)

Supprimer un code promo.

**Authentification :** ✅ Requise (Admin)

**Paramètres URL :**
- `id` : ID du code promo

**Réponse :** `200 OK`
```json
{
  "message": "Code promotionnel supprimé"
}
```

---

## 🎉 Promotions (/api/admin/promotions)

### 33. **GET** `/admin/promotions` - Lister promotions (Admin)

Récupérer toutes les promotions.

**Authentification :** ✅ Requise (Admin)

**Paramètres Query :**
- `active` : Filtrer par statut
- `page` : Numéro de page
- `limit` : Résultats par page

**Réponse :** `200 OK`
```json
[
  {
    "id": "promo_1",
    "name": "Soldes printemps",
    "type": "PRODUCT_DISCOUNT",
    "description": "Réduction sur les produits sélectionnés",
    "discountValue": 15,
    "active": true,
    "productIds": ["prod_123", "prod_456"],
    "startDate": "2026-03-01T00:00:00.000Z",
    "endDate": "2026-04-30T23:59:59.000Z",
    "createdAt": "2026-02-28T10:00:00.000Z"
  }
]
```

---

### 34. **POST** `/admin/promotions` - Créer promotion (Admin)

Créer une nouvelle promotion.

**Authentification :** ✅ Requise (Admin)

**Requête :**
```json
{
  "name": "Soldes printemps",
  "type": "PRODUCT_DISCOUNT",
  "description": "Réduction sur les produits sélectionnés",
  "discountValue": 15,
  "productIds": ["prod_123", "prod_456"],
  "categoryIds": [],
  "active": true,
  "startDate": "2026-03-01T00:00:00.000Z",
  "endDate": "2026-04-30T23:59:59.000Z",
  "bannerImage": "https://cloudinary.com/banner.jpg"
}
```

**Types possibles :** `PRODUCT_DISCOUNT`, `CATEGORY_DISCOUNT`, `BANNER`

**Réponse :** `201 Created`
```json
{
  "id": "promo_1",
  "name": "Soldes printemps",
  "type": "PRODUCT_DISCOUNT",
  "active": true,
  "createdAt": "2026-03-22T10:30:00.000Z"
}
```

---

### 35. **GET** `/admin/promotions/:id` - Détail promotion (Admin)

Récupérer les détails d'une promotion.

**Authentification :** ✅ Requise (Admin)

**Paramètres URL :**
- `id` : ID de la promotion

**Réponse :** `200 OK`
```json
{
  "id": "promo_1",
  "name": "Soldes printemps",
  "type": "PRODUCT_DISCOUNT",
  "description": "Réduction sur les produits sélectionnés",
  "discountValue": 15,
  "productIds": ["prod_123", "prod_456"],
  "categoryIds": [],
  "active": true,
  "startDate": "2026-03-01T00:00:00.000Z",
  "endDate": "2026-04-30T23:59:59.000Z",
  "bannerImage": "https://cloudinary.com/banner.jpg",
  "createdAt": "2026-02-28T10:00:00.000Z"
}
```

---

### 36. **PUT** `/admin/promotions/:id` - Modifier promotion (Admin)

Mettre à jour une promotion.

**Authentification :** ✅ Requise (Admin)

**Paramètres URL :**
- `id` : ID de la promotion

**Requête :**
```json
{
  "name": "Soldes printemps - Édition spéciale",
  "discountValue": 25,
  "active": true
}
```

**Réponse :** `200 OK`
```json
{
  "id": "promo_1",
  "name": "Soldes printemps - Édition spéciale",
  "discountValue": 25,
  "updatedAt": "2026-03-22T11:00:00.000Z"
}
```

---

### 37. **DELETE** `/admin/promotions/:id` - Supprimer promotion (Admin)

Supprimer une promotion.

**Authentification :** ✅ Requise (Admin)

**Paramètres URL :**
- `id` : ID de la promotion

**Réponse :** `200 OK`
```json
{
  "message": "Promotion supprimée"
}
```

---

### 38. **GET** `/admin/promotions/:id/stats` - Stats promotion (Admin)

Récupérer les statistiques d'une promotion.

**Authentification :** ✅ Requise (Admin)

**Paramètres URL :**
- `id` : ID de la promotion

**Réponse :** `200 OK`
```json
{
  "id": "promo_1",
  "name": "Soldes printemps",
  "views": 1250,
  "clicks": 450,
  "conversions": 85,
  "revenue": 4250.50,
  "clickThroughRate": 36,
  "conversionRate": 18.9
}
```

---

### 39. **PUT** `/admin/promotions/:id/stats` - Mettre à jour stats (Admin)

Mettre à jour les statistiques d'une promotion.

**Authentification :** ✅ Requise (Admin)

**Paramètres URL :**
- `id` : ID de la promotion

**Requête :**
```json
{
  "views": 1500,
  "clicks": 550,
  "conversions": 100
}
```

**Réponse :** `200 OK`
```json
{
  "id": "promo_1",
  "views": 1500,
  "clicks": 550,
  "conversions": 100,
  "conversionRate": 18.18
}
```

---

## ⏰ Créneaux (Click & Collect) (/api/admin/time-slots)

### 40. **GET** `/admin/time-slots/config` - Config créneaux (Admin)

Récupérer la configuration des créneaux Click & Collect.

**Authentification :** ✅ Requise (Admin)

**Réponse :** `200 OK`
```json
{
  "id": "config_1",
  "slotsPerDay": 8,
  "slotDuration": 60,
  "maxOrdersPerSlot": 20,
  "advanceBookingDays": 14,
  "operatingHours": {
    "start": "09:00",
    "end": "18:00"
  },
  "closedDays": ["SUNDAY"],
  "unavailableDates": [
    "2026-04-10",
    "2026-04-11"
  ]
}
```

---

### 41. **PUT** `/admin/time-slots/config` - Modifier config (Admin)

Mettre à jour la configuration des créneaux.

**Authentification :** ✅ Requise (Admin)

**Requête :**
```json
{
  "slotsPerDay": 10,
  "slotDuration": 45,
  "maxOrdersPerSlot": 25,
  "advanceBookingDays": 21,
  "operatingHours": {
    "start": "08:00",
    "end": "20:00"
  },
  "closedDays": ["SUNDAY"],
  "unavailableDates": []
}
```

**Réponse :** `200 OK`
```json
{
  "id": "config_1",
  "slotsPerDay": 10,
  "slotDuration": 45,
  "updated": true
}
```

---

### 42. **GET** `/admin/heatmap-slots` - Heatmap créneaux (Admin)

Récupérer une heatmap de disponibilité des créneaux.

**Authentification :** ✅ Requise (Admin)

**Paramètres Query :**
- `startDate` : Date de début (YYYY-MM-DD)
- `endDate` : Date de fin (YYYY-MM-DD)

**Réponse :** `200 OK`
```json
{
  "heatmap": [
    {
      "date": "2026-03-25",
      "slots": [
        {
          "time": "09:00-10:00",
          "ordersCount": 18,
          "capacity": 20,
          "availabilityPercent": 90
        },
        {
          "time": "10:00-11:00",
          "ordersCount": 20,
          "capacity": 20,
          "availabilityPercent": 100
        }
      ]
    }
  ]
}
```

---

## 📊 Statistiques & Dashboard (/api/admin)

### 43. **GET** `/admin/kpis` - KPIs temps réel (Admin)

Récupérer les indicateurs clés de performance.

**Authentification :** ✅ Requise (Admin)

**Réponse :** `200 OK`
```json
{
  "ordersToday": 45,
  "dailyRevenue": 8250.50,
  "monthlyRevenue": 125450.75,
  "outOfStock": 5,
  "lowStock": 23,
  "slotsReservedToday": 18,
  "pendingOrders": 12
}
```

---

### 44. **GET** `/admin/sales-chart` - Graphique ventes (Admin)

Récupérer les données pour graphique de ventes.

**Authentification :** ✅ Requise (Admin)

**Paramètres Query :**
- `period` : Période (7d, 30d, 12m)

**Réponse :** `200 OK`
```json
[
  {
    "date": "2026-03-16",
    "revenue": 2450.50,
    "orders": 32
  },
  {
    "date": "2026-03-17",
    "revenue": 3125.75,
    "orders": 41
  }
]
```

---

### 45. **GET** `/admin/urgent-orders` - Commandes urgentes (Admin)

Récupérer les commandes des 2 prochaines heures.

**Authentification :** ✅ Requise (Admin)

**Réponse :** `200 OK`
```json
[
  {
    "id": "order_123",
    "orderNumber": "ORDER-2026-001",
    "timeSlotDate": "2026-03-22T14:30:00.000Z",
    "status": "RECEIVED",
    "user": {
      "firstName": "Jean",
      "lastName": "Dupont",
      "phone": "+212612345678"
    },
    "items": [
      {
        "quantity": 2,
        "product": {
          "name": "Gel Douche Bio",
          "image": "https://cloudinary.com/..."
        }
      }
    ]
  }
]
```

---

### 46. **GET** `/admin/low-stock-products` - Produits stock faible (Admin)

Récupérer les produits en stock faible.

**Authentification :** ✅ Requise (Admin)

**Paramètres Query :**
- `threshold` : Seuil de stock (défaut: 10)

**Réponse :** `200 OK`
```json
[
  {
    "id": "prod_123",
    "name": "Gel Douche Bio",
    "stock": 3,
    "image": "https://cloudinary.com/...",
    "price": 49.99,
    "brand": "BioBeauté"
  }
]
```

---

### 47. **GET** `/admin/orders` - Lister commandes (Admin)

Récupérer toutes les commandes avec filtres.

**Authentification :** ✅ Requise (Admin)

**Paramètres Query :**
- `status` : Filtrer par statut
- `search` : Rechercher par numéro/client
- `from` : Date de début
- `to` : Date de fin
- `page` : Numéro de page
- `limit` : Résultats par page

**Réponse :** `200 OK`
```json
{
  "orders": [
    {
      "id": "order_123",
      "orderNumber": "ORDER-2026-001",
      "total": 119.98,
      "status": "READY",
      "timeSlotDate": "2026-03-25T14:00:00.000Z",
      "user": {
        "firstName": "Jean",
        "lastName": "Dupont",
        "email": "jean.dupont@email.com",
        "phone": "+212612345678"
      },
      "itemsCount": 3,
      "createdAt": "2026-03-22T10:30:00.000Z"
    }
  ],
  "total": 156,
  "page": 1,
  "pages": 8
}
```

---

### 48. **PUT** `/admin/orders/:orderId/status` - Changer statut (Admin)

Mettre à jour le statut d'une commande (route admin spécifique).

**Authentification :** ✅ Requise (Admin)

**Paramètres URL :**
- `orderId` : ID de la commande

**Requête :**
```json
{
  "status": "READY"
}
```

**Réponse :** `200 OK`
```json
{
  "message": "Statut mis à jour",
  "order": {
    "id": "order_123",
    "status": "READY"
  }
}
```

---

## ⬆️ Upload & Images (/api/upload)

### 49. **POST** `/upload` - Upload image (Admin/Client)

Uploader une image vers Cloudinary.

**Authentification :** ❌ Optionnelle

**Content-Type :** `multipart/form-data`

**Paramètres :**
- `file` : Fichier image (JPG, PNG, WebP)
- `folder` : Dossier Cloudinary (optionnel)

**Réponse :** `200 OK`
```json
{
  "url": "https://res.cloudinary.com/...",
  "publicId": "paraclick/prod_123",
  "width": 800,
  "height": 600,
  "format": "jpg",
  "size": 125450
}
```

---

### 50. **POST** `/upload/multiple` - Upload multiple images (Admin)

Uploader plusieurs images.

**Authentification :** ❌ Optionnelle

**Content-Type :** `multipart/form-data`

**Paramètres :**
- `files` : Fichiers images (tableau)
- `folder` : Dossier Cloudinary

**Réponse :** `200 OK`
```json
[
  {
    "url": "https://res.cloudinary.com/image1.jpg",
    "publicId": "paraclick/prod_123_1"
  },
  {
    "url": "https://res.cloudinary.com/image2.jpg",
    "publicId": "paraclick/prod_123_2"
  }
]
```

---

## 🔍 Recherche & Filtres (/api/products)

### 51. **GET** `/products/search` - Recherche produits

Rechercher les produits par mots-clés.

**Paramètres Query :**
- `q` : Terme de recherche
- `limit` : Nombre de résultats

**Réponse :** `200 OK`
```json
[
  {
    "id": "prod_123",
    "name": "Gel Douche Bio",
    "price": 49.99,
    "image": "https://cloudinary.com/..."
  }
]
```

---

## 🏥 Santé & Test (/api)

### 52. **GET** `/health` - Vérifier santé serveur

Vérifier si le serveur est opérationnel.

**Authentification :** ❌ Non requise

**Réponse :** `200 OK`
```json
{
  "status": "OK"
}
```

---

## 📋 Codes de Statut HTTP

| Code | Signification |
|------|---------------|
| **200** | OK - Requête réussie |
| **201** | Created - Ressource créée |
| **204** | No Content - Succès sans réponse |
| **400** | Bad Request - Données invalides |
| **401** | Unauthorized - Token manquant/invalide |
| **403** | Forbidden - Accès refusé (droits insuffisants) |
| **404** | Not Found - Ressource non trouvée |
| **500** | Internal Server Error - Erreur serveur |

---

## 🔒 Sécurité & Authentification

### Bearer Token (JWT)

Pour les endpoints protégés, inclure le token JWT dans le header :

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Rôles Utilisateur

| Rôle | Permissions |
|------|-------------|
| **CLIENT** | GET produits, POST/GET/PUT commandes, GET profil, WebSocket client |
| **ADMIN** | Accès complet, gestion produits/catégories, dashboard |
| **CAISSIER** | Gestion commandes, visualisation |
| **PREPARATEUR** | Préparation commandes |

---

## 🔄 WebSocket Events (Temps réel)

```javascript
// Client Connect
socket.emit('authenticate', token)

// Admin Connect
socket.emit('admin_authenticate', adminToken)

// Nouvelles commandes
io.to('admin_room').emit('admin_new_order', orderData)

// Changement statut
io.to(`user_${userId}`).emit('notification', {
  type: 'ORDER_STATUS_CHANGED',
  status: 'READY'
})
```

---

## 📝 Exemple de Flux Complet (Achat)

1. **Inscription/Connexion**
   ```
   POST /api/auth/signup ou POST /api/auth/login
   ```

2. **Parcourir produits**
   ```
   GET /api/products?categoryId=cat_1&limit=20
   GET /api/products/:id
   ```

3. **Ajouter au panier**
   ```
   POST /api/user/cart (sauvegarde locale)
   ```

4. **Créer commande**
   ```
   POST /api/orders/create
   ```

5. **Confirmation**
   ```
   POST /api/orders/send-confirmation
   ```

6. **Suivi**
   ```
   GET /api/orders/my-orders
   WebSocket: notification de changement de statut
   ```

---

## 🚀 Prochaines Améliorations

- [ ] Pagination automatique pour listes longues
- [ ] Filtres avancés (prix, notation, etc.)
- [ ] Endpoint de revues/ratings produits
- [ ] Gestion des adresses multiples
- [ ] Favoris/Wishlist
- [ ] Historique de recherche
- [ ] Recommandations IA
- [ ] Export commandes (PDF/CSV)

---

**Version :** 1.0  
**Dernière mise à jour :** 22 mars 2026  
**Statut :** Documenté et opérationnel
