# 🏗️ Architecture API RESTful - Diagramme

## Hiérarchie des Endpoints

```
/api
├── 🔐 /auth                          [4 endpoints]
│   ├── POST /signup
│   ├── POST /login
│   ├── POST /forgot-password
│   └── POST /reset-password
│
├── 👤 /user                          [4 endpoints]
│   ├── GET /profile
│   ├── PUT /profile
│   ├── POST /cart
│   └── GET /cart
│
├── 🛒 /orders                        [5 endpoints]
│   ├── POST /create
│   ├── GET /my-orders
│   ├── PUT /:orderId/cancel
│   ├── PUT /:orderId/status
│   └── POST /send-confirmation
│
├── 📦 /products                      [6 endpoints]
│   ├── GET / (public)
│   ├── GET /:id (public)
│   ├── POST / (admin)
│   ├── PUT /:id (admin)
│   ├── DELETE /:id (admin)
│   └── GET /search (public)
│
├── 🏢 /admin                         [18 endpoints]
│   ├── POST /login
│   │
│   ├── 📚 /categories                [10 endpoints]
│   │   ├── GET /
│   │   ├── POST /
│   │   ├── PUT /:id
│   │   ├── DELETE /:id
│   │   ├── POST /:id/subcategories
│   │   ├── PUT /:id/subcategories/:subId
│   │   ├── DELETE /:id/subcategories/:subId
│   │   ├── POST /:id/subcategories/:subId/items
│   │   ├── PUT /:id/subcategories/:subId/items/:itemId
│   │   └── DELETE /:id/subcategories/:subId/items/:itemId
│   │
│   ├── 🎁 /promo-codes               [5 endpoints]
│   │   ├── GET /
│   │   ├── POST /
│   │   ├── GET /:id
│   │   ├── PUT /:id
│   │   └── DELETE /:id
│   │
│   ├── 🎉 /promotions                [7 endpoints]
│   │   ├── GET /
│   │   ├── POST /
│   │   ├── GET /:id
│   │   ├── PUT /:id
│   │   ├── DELETE /:id
│   │   ├── GET /:id/stats
│   │   └── PUT /:id/stats
│   │
│   ├── ⏰ /time-slots                 [3 endpoints]
│   │   ├── GET /config
│   │   ├── PUT /config
│   │   └── GET /heatmap-slots
│   │
│   └── 📊 Dashboard Stats            [5 endpoints]
│       ├── GET /kpis
│       ├── GET /sales-chart
│       ├── GET /urgent-orders
│       ├── GET /low-stock-products
│       └── GET /orders
│
├── ⬆️ /upload                         [2 endpoints]
│   ├── POST /
│   └── POST /multiple
│
└── 🏥 /health                        [1 endpoint]
    └── GET /

Total : 52 endpoints
```

---

## Flux Architectural

```
┌─────────────────────────────────────────┐
│        Application Frontend             │
│      (React - Port 3000)                │
└────────────┬────────────────────────────┘
             │ HTTP/REST
             │ WebSocket
             ↓
┌─────────────────────────────────────────┐
│      API Express Backend                │
│      (Node.js - Port 5000)              │
│                                         │
│  Routes:                                │
│  ├─ Auth (signup/login)                │
│  ├─ User (profile/cart)                │
│  ├─ Orders (CRUD)                      │
│  ├─ Products (CRUD)                    │
│  ├─ Admin Dashboard                    │
│  └─ Upload (Cloudinary)                │
└────────────┬────────────────────────────┘
             │ Prisma ORM
             ↓
┌─────────────────────────────────────────┐
│      PostgreSQL Database                │
│                                         │
│  Tables:                                │
│  ├─ users                              │
│  ├─ products                           │
│  ├─ categories                         │
│  ├─ orders                             │
│  ├─ promoCodes                         │
│  ├─ promotions                         │
│  └─ timeSlots                          │
└─────────────────────────────────────────┘
             ↓ (async)
┌─────────────────────────────────────────┐
│      Services Externes                  │
│                                         │
│  ├─ Cloudinary (Images)                │
│  ├─ Gmail (Email)                      │
│  ├─ Twilio (SMS)                       │
│  └─ Socket.IO (WebSocket)             │
└─────────────────────────────────────────┘
```

---

## Flux de Données - Exemple Commande

```
1. Client Browse
   ├─ GET /api/products
   ├─ GET /api/products/:id
   └─ POST /api/user/cart

2. Client Checkout
   ├─ POST /api/orders/create
   │  ├─ Créer Order en DB
   │  └─ Émettre : admin_new_order (WebSocket)
   └─ POST /api/orders/send-confirmation
      ├─ Envoyer Email
      └─ Envoyer SMS (si activé)

3. Admin Dashboard (WebSocket)
   ├─ Reçoit : admin_new_order
   ├─ GET /api/admin/urgent-orders
   ├─ GET /api/admin/kpis
   └─ Visualise : Heatmap, Stats

4. Admin Change Status
   ├─ PUT /api/admin/orders/:orderId/status
   ├─ Émet : admin_order_status_changed (WebSocket)
   └─ Envoie : Notification au client

5. Client Notification (WebSocket)
   ├─ Reçoit : ORDER_STATUS_CHANGED
   ├─ Affiche : Notification
   └─ GET /api/orders/my-orders (refresh)
```

---

## Matrice de Sécurité

```
┌──────────────────────────────────────────────────────┐
│             AUTHENTIFICATION REQUISE                 │
├──────────────────────┬───────────────────────────────┤
│ Endpoint             │ Rôles Autorisés              │
├──────────────────────┼───────────────────────────────┤
│ /user/*              │ CLIENT authentifié           │
│ /admin/*             │ ADMIN                        │
│ /admin/categories    │ ADMIN                        │
│ /admin/promotions    │ ADMIN                        │
│ /orders/my-orders    │ CLIENT authentifié           │
│ /orders/:id/cancel   │ CLIENT (proprio commande)    │
├──────────────────────┼───────────────────────────────┤
│             SEMI-AUTHENTIFICATION                    │
├──────────────────────┼───────────────────────────────┤
│ /orders/create       │ Optionnel (guest possible)   │
│ /upload              │ Optionnel                    │
├──────────────────────┼───────────────────────────────┤
│             PUBLIQUE (Pas d'Auth)                    │
├──────────────────────┼───────────────────────────────┤
│ /auth/signup         │ Tous                         │
│ /auth/login          │ Tous                         │
│ /products (GET)      │ Tous                         │
│ /products/:id (GET)  │ Tous                         │
│ /health              │ Tous                         │
└──────────────────────┴───────────────────────────────┘
```

---

## Distribution des Méthodes HTTP

```
GET
├─ Récupérer ressources (26 total)
│  ├─ Products: 3 (list, detail, search)
│  ├─ User: 2 (profile, cart)
│  ├─ Admin: 5 (stats, orders, charts)
│  ├─ Categories: 1
│  ├─ Promo: 1
│  ├─ Promotions: 2
│  ├─ TimeSlots: 2
│  ├─ Orders: 2
│  └─ Santé: 1

POST
├─ Créer ressources (17 total)
│  ├─ Auth: 4 (signup, login, forgot, reset)
│  ├─ Orders: 2 (create, confirmation)
│  ├─ Products: 1
│  ├─ User: 1 (cart)
│  ├─ Categories: 4 (cat, subcat, items x2)
│  ├─ Promo: 2 (codes, promotions)
│  └─ Upload: 2

PUT
├─ Modifier ressources (8 total)
│  ├─ User: 1 (profile)
│  ├─ Orders: 2 (cancel, status)
│  ├─ Products: 1
│  ├─ Categories: 4 (cat, subcat, items x2)
│  ├─ Promo: 1 (codes, promotions x2)
│  ├─ Promotions: 1 (stats)
│  └─ TimeSlots: 1

DELETE
├─ Supprimer ressources (4 total)
│  ├─ Products: 1
│  ├─ Categories: 3 (cat, subcat, items)
│  └─ Promo: 2 (codes, promotions)
```

---

## Approche REST pour Chaque Ressource

### Produits
```
GET    /products              ← List all (public)
POST   /products              ← Create (admin)
GET    /products/:id          ← Detail (public)
PUT    /products/:id          ← Update (admin)
DELETE /products/:id          ← Delete (admin)
```

### Commandes
```
POST   /orders/create         ← Create
GET    /orders/my-orders      ← List user orders
PUT    /orders/:id/cancel     ← Cancel
PUT    /orders/:id/status     ← Change status
```

### Catégories
```
GET    /categories            ← List
POST   /categories            ← Create
PUT    /categories/:id        ← Update
DELETE /categories/:id        ← Delete
```

### Codes Promo
```
GET    /promo-codes           ← List
POST   /promo-codes           ← Create
GET    /promo-codes/:id       ← Detail
PUT    /promo-codes/:id       ← Update
DELETE /promo-codes/:id       ← Delete
```

---

## Cas d'Usage Courants

### 1️⃣ Client Browse & Shop
```
GET /api/products?categoryId=X&limit=20
GET /api/products/:productId
POST /api/user/cart
```

### 2️⃣ Client Checkout
```
POST /api/orders/create
POST /api/orders/send-confirmation
```

### 3️⃣ Client Track Order
```
GET /api/orders/my-orders
PUT /api/orders/:orderId/cancel (if RECEIVED)
WebSocket: Notifications temps réel
```

### 4️⃣ Admin Dashboard
```
GET /api/admin/kpis
GET /api/admin/sales-chart?period=7d
GET /api/admin/urgent-orders
GET /api/admin/heatmap-slots
```

### 5️⃣ Admin Product Management
```
GET /api/products/
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id
```

### 6️⃣ Admin Category Management
```
GET /api/categories
POST /api/categories/:id/subcategories
PUT /api/categories/:id/subcategories/:subId
```

### 7️⃣ Admin Promotion Management
```
POST /api/promotions
GET /api/promotions/:id/stats
PUT /api/promotions/:id/stats
```

---

## Performance & Optimisation

| Aspect | Status | Details |
|--------|--------|---------|
| **Pagination** | ✅ | Implémenté pour products, orders |
| **Filtres** | ✅ | Catégories, prix, marque, status |
| **Caching** | ❌ | À considérer (Redis) |
| **Rate Limiting** | ❌ | À implémenter |
| **Compression** | ✅ | GZIP standard |
| **CORS** | ✅ | Configuré |

---

## Erreurs Courantes

| Code | Signification | Exemple |
|------|---------------|---------|
| 400 | Bad Request | Données invalides |
| 401 | Unauthorized | Token manquant |
| 403 | Forbidden | Droits insuffisants |
| 404 | Not Found | Ressource inexistante |
| 500 | Server Error | Erreur serveur |

---

## Roadmap Améliorations

- [ ] GraphQL alternative
- [ ] API versioning (v2)
- [ ] Webhook pour intégrations
- [ ] Export API (PDF, CSV)
- [ ] Analytics avancées
- [ ] Machine Learning recommendations
- [ ] Payment Gateway integration
- [ ] E-signature pour Click & Collect

---

**Architecture Version :** 1.0  
**Mise à jour :** 22 mars 2026  
**Statut :** Production-ready
