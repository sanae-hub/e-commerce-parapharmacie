# 🏥 ParaClick - E-commerce Parapharmacie

Application e-commerce complète pour une parapharmacie avec système **Click & Collect** en temps réel.

## 📋 Table des Matières

- [🚀 Démarrage Rapide](#-démarrage-rapide)
- [📚 Documentation API](#-documentation-api)
- [🏗️ Architecture](#-architecture)
- [📁 Structure du Projet](#-structure-du-projet)
- [🛠️ Technologies](#-technologies)

---

## 🚀 Démarrage Rapide

### Installation Backend
```bash
cd backend
npm install
cp .env.example .env
npm run db:push && npm run seed
npm run dev  # Démarre sur http://localhost:5000
```

### Installation Frontend
```bash
cd frontend
npm install
npm run dev  # Démarre sur http://localhost:3000
```

---

## 📚 Documentation API

### 📄 NOS 3 GUIDES PRINCIPAUX

| Document | Description | Usage |
|----------|-------------|-------|
| **[API_REST_DOCUMENTATION.md](API_REST_DOCUMENTATION.md)** ⭐ | Documentation **complète de 52 endpoints** avec exemples JSON | 👉 **Référence détaillée** |
| **[ENDPOINTS_QUICK_REFERENCE.md](ENDPOINTS_QUICK_REFERENCE.md)** 🚀 | Tableaux récapitulatifs rapides | 👉 **Recherche rapide** |
| **[API_ARCHITECTURE_DIAGRAM.md](API_ARCHITECTURE_DIAGRAM.md)** 🏗️ | Hiérarchie et flux de données | 👉 **Diagrammes & architecture** |

### 52 Endpoints REST

```
┌─ 🔐 AUTHENTIFICATION (4)
│  ├─ POST /auth/signup
│  ├─ POST /auth/login
│  ├─ POST /auth/forgot-password
│  └─ POST /auth/reset-password
│
├─ 👤 PROFIL & PANIER (4)
│  ├─ GET /user/profile
│  ├─ PUT /user/profile
│  ├─ POST /user/cart
│  └─ GET /user/cart
│
├─ 🛒 COMMANDES (5)
│  ├─ POST /orders/create
│  ├─ GET /orders/my-orders
│  ├─ PUT /orders/:id/cancel
│  ├─ PUT /orders/:id/status
│  └─ POST /orders/send-confirmation
│
├─ 📦 PRODUITS (6)
│  ├─ GET /products (public)
│  ├─ GET /products/:id
│  ├─ POST /products (admin)
│  ├─ PUT /products/:id (admin)
│  ├─ DELETE /products/:id (admin)
│  └─ GET /products/search
│
├─ 🏢 ADMIN (19)
│  ├─ 📚 CATÉGORIES (10)
│  ├─ 🎁 PROMO CODES (5)
│  ├─ 🎉 PROMOTIONS (7)
│  └─ ⏰ TIME SLOTS (3)
│
├─ 📊 DASHBOARD (6)
│  ├─ POST /admin/login
│  ├─ GET /admin/kpis
│  ├─ GET /admin/sales-chart
│  ├─ GET /admin/urgent-orders
│  ├─ GET /admin/low-stock-products
│  └─ GET /admin/orders
│
├─ ⬆️ UPLOAD (2)
│  ├─ POST /upload
│  └─ POST /upload/multiple
│
└─ 🏥 SANTÉ (1)
   └─ GET /health
```

---

## 🏗️ Architecture

```
Frontend (React)     Backend (Express)    Database (PostgreSQL)
    │                   │                          │
    │─── HTTP/REST ────→│                         │
    │←──── JSON ────────│                         │
    │                   │────── Prisma ORM ──────→│
    │                   │←─── Query Results ─────→
    │                   │
    │─ WebSocket ──────→│
    │←─ Real-time ─────→│
    │                   │
                        ↓
                   Services:
                   • Cloudinary (Images)
                   • Gmail (Emails)
                   • Socket.IO (WebSocket)
```

---

## 📁 Structure du Projet

```
e-commerce-parapharmacie/
├── backend/
│   ├── src/server.js                    # API principale
│   ├── src/routes/                      # Routes REST
│   ├── prisma/schema.prisma             # Schéma DB
│   ├── scripts/                         # Utilitaires
│   └── README.md
├── frontend/
│   ├── src/                             # React components
│   ├── package.json
│   └── vite.config.js
├── 📄 API_REST_DOCUMENTATION.md         ⭐ PRINCIPAL
├── 📄 ENDPOINTS_QUICK_REFERENCE.md      🚀 RAPIDE
├── 📄 API_ARCHITECTURE_DIAGRAM.md       🏗️ DIAGRAMME
└── docker-compose.yml
```

---

## 🛠️ Technologies

- **Backend:** Node.js + Express + Prisma + PostgreSQL
- **Frontend:** React 19 + Vite + TailwindCSS
- **Services:** Cloudinary, Gmail, Socket.IO, JWT
- **Infrastructure:** Docker, Docker Compose, Nginx

---

## ✅ Checklist Endpoints

| Catégorie | GET | POST | PUT | DELETE | Total |
|-----------|-----|------|-----|--------|-------|
| Auth | 0 | 4 | 0 | 0 | 4 |
| User | 2 | 1 | 1 | 0 | 4 |
| Orders | 2 | 2 | 2 | 0 | 5 |
| Products | 3 | 1 | 1 | 1 | 6 |
| Admin | 5 | 1 | 0 | 0 | 6 |
| Categories | 1 | 4 | 4 | 3 | 10 |
| Promo | 2 | 1 | 1 | 1 | 5 |
| Promotions | 2 | 1 | 1 | 1 | 7 |
| TimeSlots | 2 | 0 | 1 | 0 | 3 |
| Upload | 0 | 2 | 0 | 0 | 2 |
| Health | 1 | 0 | 0 | 0 | 1 |
| **TOTAL** | **20** | **17** | **11** | **5** | **52** |

---

## 🔐 Authentification

```javascript
// Récupérer token
const response = await axios.post('/api/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});

// Utiliser token
axios.defaults.headers.common['Authorization'] = 
  `Bearer ${response.data.token}`;
```

---

## 📊 Statuts de Commande

```
RECEIVED → PREPARING → READY → COMPLETED
                     ↓
                  CANCELLED
```

---

## 🚀 Scripts

```bash
# Backend
npm run dev                    # Démarrage développement
npm run db:push               # Schéma → DB
npm run seed                  # Données initiales
node scripts/list-users.js    # Lister utilisateurs

# Frontend
npm run dev                    # Dev server
npm run build                  # Production build
```

---

## 🐳 Docker

```bash
docker-compose up --build
```

---

## 📚 Guides Détaillés

- ⭐ **[API_REST_DOCUMENTATION.md](API_REST_DOCUMENTATION.md)** - 52 endpoints détaillés
- 🚀 **[ENDPOINTS_QUICK_REFERENCE.md](ENDPOINTS_QUICK_REFERENCE.md)** - Tableaux rapides
- 🏗️ **[API_ARCHITECTURE_DIAGRAM.md](API_ARCHITECTURE_DIAGRAM.md)** - Architecture
- 📖 [backend/README.md](backend/README.md) - Guide backend
- 🎨 [frontend/README.md](frontend/README.md) - Guide frontend

---

**Version :** 1.0 | **Mise à jour :** 22 mars 2026 | **Status :** ✅ Production-ready
 
