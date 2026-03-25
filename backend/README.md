# Backend ParaClick - Documentation

Bienvenue dans la documentation du backend de l'application ParaClick e-commerce parapharmacie.

## 📚 Guides Disponibles

### 🚀 Pour Commencer
- **[DEMARRAGE_RAPIDE.md](./DEMARRAGE_RAPIDE.md)** - Configuration en 10 minutes
  - Créer un compte Twilio
  - Configurer les SMS
  - Tester immédiatement

### 🗄️ Base de Données
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Configuration PostgreSQL
  - Installation et configuration
  - Structure des tables
  - Commandes Prisma utiles
  - API Endpoints

### 📱 Notifications SMS
- **[SMS_SETUP.md](./SMS_SETUP.md)** - Configuration Twilio détaillée
  - Créer un compte Twilio
  - Obtenir les identifiants
  - Vérifier les numéros (Trial)
  - Passer en production
  - Alternatives à Twilio

- **[EXEMPLES_SMS.md](./EXEMPLES_SMS.md)** - Exemples de SMS envoyés
  - Format des SMS
  - Tous les types de notifications
  - Scénarios complets
  - Coûts estimés

### 🔔 Système de Notifications
- **[NOTIFICATIONS_GUIDE.md](./NOTIFICATIONS_GUIDE.md)** - Documentation complète
  - Notifications SMS
  - Réinitialisation de mot de passe
  - Préférences utilisateur
  - Tableau récapitulatif
  - Checklist de vérification

### 🎉 Nouvelles Fonctionnalités
- **[NOUVELLES_FONCTIONNALITES.md](./NOUVELLES_FONCTIONNALITES.md)** - Vue d'ensemble
  - Résumé des fonctionnalités
  - Configuration requise
  - Tests et déploiement
  - Prochaines étapes

---

## 🏗️ Architecture

### Technologies
- **Node.js** + **Express** - Serveur API REST
- **Prisma** - ORM pour PostgreSQL
- **PostgreSQL** - Base de données
- **Socket.IO** - WebSocket pour notifications temps réel
- **JWT** - Authentification
- **Bcrypt** - Hachage des mots de passe
- **Nodemailer** - Envoi d'emails
- **Twilio** - Envoi de SMS
- **Node-cron** - Tâches planifiées

### Structure du Projet
```
backend/
├── src/
│   ├── server.js           # Point d'entrée principal
│   └── routes/             # Routes API
│       ├── categories.js   # Catégories et sous-catégories
│       ├── products.js     # Produits et filtres
│       ├── promoCodes.js   # Codes promotionnels
│       └── settings.js     # Paramètres de l'app
├── prisma/
│   ├── schema.prisma       # Schéma de la base de données
│   └── seed.js             # Données initiales
├── .env                    # Variables d'environnement
├── .env.example            # Template des variables
├── package.json            # Dépendances et scripts
├── test-sms.js             # Script de test SMS
└── *.md                    # Documentation
```

---

## 🚀 Installation

### Prérequis
- Node.js 18+ installé
- PostgreSQL installé
- Compte Gmail (pour les emails)
- Compte Twilio (pour les SMS)

### Installation Rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer .env (voir .env.example)
cp .env.example .env
# Éditer .env avec vos identifiants

# 3. Initialiser la base de données
npm run db:push
npm run seed

# 4. Tester la configuration SMS
npm run test-sms

# 5. Démarrer le serveur
npm run dev
```

Le serveur démarre sur **http://localhost:5000**

---

## 📋 Scripts Disponibles

### Scripts NPM
```bash
# Développement
npm run dev              # Démarrer avec nodemon (auto-reload)
npm start                # Démarrer en production

# Base de données
npm run migrate          # Créer une migration
npm run db:push          # Pousser le schéma vers la DB
npm run db:studio        # Ouvrir Prisma Studio
npm run seed             # Peupler la base de données

# Tests
npm run test-sms         # Tester l'envoi de SMS
```

### Scripts Utilitaires (dossier scripts/)

#### 👥 Gestion des Utilisateurs
```bash
# Lister tous les utilisateurs
node scripts/list-users.js

# Nettoyer les utilisateurs (garder seulement admin et sanae patrish)
node scripts/cleanup-users.js

# Créer des utilisateurs de test
node scripts/create-test-users.js
```

#### ☁️ Gestion Cloudinary
```bash
# Test d'upload simple
node scripts/test-upload.js

# Upload en masse des images
node scripts/upload-images-to-cloudinary.js

# Lister les images uploadées
node scripts/list-uploaded-images.js

# Récupérer toutes les images Cloudinary
node scripts/get-all-cloudinary-images.js

# Mettre à jour la DB avec les URLs Cloudinary
node scripts/update-database-with-cloudinary.js
```

#### 📊 Audit et Logs
```bash
# Créer des entrées d'audit de test
node scripts/create-audit-entries.js

# Créer un admin de test
node scripts/create-admin.js
```

**📖 Documentation détaillée :** [scripts/README.md](./scripts/README.md)

---

## 🔧 Configuration

### Variables d'Environnement

Créez un fichier `.env` à la racine du dossier backend :

```env
# Base de données
DATABASE_URL="postgresql://postgres:password@localhost:5432/parapharmacie"

# Serveur
PORT=5000
NODE_ENV="development"

# JWT
JWT_SECRET="votre-secret-jwt-tres-securise"

# Email (Gmail)
EMAIL_USER="votre-email@gmail.com"
EMAIL_PASSWORD="votre-app-password"

# SMS (Twilio)
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="votre_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"
```

**Important** :
- Pour Gmail, utilisez un **App Password**, pas votre mot de passe normal
- Pour Twilio, créez un compte sur https://www.twilio.com/

---

## 📡 API Endpoints

### Authentification
```
POST   /api/auth/signup              # Inscription
POST   /api/auth/login               # Connexion
POST   /api/auth/forgot-password     # Demande de réinitialisation
POST   /api/auth/reset-password      # Réinitialiser le mot de passe
```

### Utilisateur
```
GET    /api/user/profile             # Récupérer le profil
PUT    /api/user/profile             # Modifier le profil
GET    /api/user/cart                # Récupérer le panier
POST   /api/user/cart                # Sauvegarder le panier
```

### Catégories
```
GET    /api/categories               # Toutes les catégories
GET    /api/categories/:id           # Une catégorie
```

### Produits
```
GET    /api/products                 # Tous les produits
GET    /api/products/:id             # Un produit
```

### Codes Promo
```
GET    /api/promo-codes              # Codes actifs
POST   /api/promo-codes/validate     # Valider un code
```

### Paramètres
```
GET    /api/settings                 # Tous les paramètres
GET    /api/settings/:key            # Un paramètre
```

### Commandes
```
POST   /api/orders/create            # Créer une commande
POST   /api/orders/send-confirmation # Envoyer confirmation
GET    /api/orders/my-orders         # Mes commandes
PUT    /api/orders/:id/cancel        # Annuler une commande
PUT    /api/orders/:id/status        # Changer le statut (admin)
```

---

## 🔔 Système de Notifications

### Canaux Disponibles

| Canal | Description | Configuration |
|-------|-------------|---------------|
| **Email** | Notifications détaillées | `notificationEmail` |
| **SMS** | Notifications urgentes | `notificationSMS` |
| **WebSocket** | Temps réel dans l'app | Toujours actif |

### Événements Notifiés

- ✅ Création de commande
- ✅ Changements de statut (RECEIVED, PREPARING, READY, COMPLETED)
- ✅ Annulation de commande
- ✅ Rappel 2h avant retrait
- ✅ Réinitialisation de mot de passe

### Préférences Utilisateur

Les utilisateurs peuvent activer/désactiver chaque canal dans leur profil.

---

## 🔐 Sécurité

### Authentification
- JWT avec expiration 7 jours
- Tokens stockés côté client
- Middleware de vérification sur routes protégées

### Mots de Passe
- Hachage bcrypt avec 10 rounds
- Validation minimum 8 caractères
- Réinitialisation sécurisée avec token unique

### Réinitialisation
- Token unique (32 bytes)
- Expiration 15 minutes
- Usage unique (supprimé après utilisation)

---

## 📱 Notifications SMS

### Configuration Twilio

1. Créer un compte sur https://www.twilio.com/
2. Obtenir Account SID et Auth Token
3. Acheter un numéro de téléphone
4. Configurer dans `.env`

### Compte Trial (Gratuit)
- ✅ $15.50 de crédit gratuit
- ✅ ~190 SMS
- ⚠️ SMS uniquement vers numéros vérifiés
- ⚠️ Préfixe "Sent from your Twilio trial account"

### Compte Production (Payant)
- ✅ Envoi vers tous les numéros
- ✅ Pas de préfixe
- 💰 ~$0.08 par SMS au Maroc

### Test SMS

```bash
npm run test-sms
```

---

## 🗄️ Base de Données

### Modèles Principaux

- **User** : Utilisateurs avec authentification
- **Category** : Catégories de produits
- **Subcategory** : Sous-catégories
- **SubcategoryItem** : Items des sous-catégories
- **Product** : Produits avec détails complets
- **Order** : Commandes Click & Collect
- **OrderItem** : Détails des produits commandés
- **Favorite** : Produits favoris
- **PromoCode** : Codes promotionnels
- **Settings** : Paramètres de l'application

### Commandes Prisma

```bash
# Ouvrir l'interface graphique
npm run db:studio

# Créer une migration
npm run migrate

# Pousser le schéma
npm run db:push

# Réinitialiser la DB
npx prisma migrate reset
```

---

## 🔄 WebSocket (Socket.IO)

### Connexion

Le client s'authentifie avec son JWT :

```javascript
socket.emit('authenticate', token)
```

### Événements

```javascript
// Notification reçue
socket.on('notification', (data) => {
  // data.type: 'ORDER_CREATED', 'ORDER_STATUS_CHANGED', etc.
  // data.title: Titre de la notification
  // data.message: Message détaillé
  // data.orderId: ID de la commande
  // data.timestamp: Date/heure
})
```

---

## ⏰ Tâches Planifiées (Cron)

### Rappels Automatiques

Toutes les 15 minutes, le système vérifie les commandes dont le créneau est dans 2h et envoie :
- Email de rappel
- SMS de rappel (si activé)

```javascript
// Cron job : */15 * * * *
// Exécution : Toutes les 15 minutes
```

---

## 🧪 Tests

### Test SMS

```bash
npm run test-sms
```

### Test Email

Créer une commande dans l'application et vérifier la réception de l'email.

### Test WebSocket

1. Ouvrir l'application frontend
2. Se connecter
3. Créer une commande
4. Vérifier la notification en temps réel

---

## 📊 Monitoring

### Logs

Le serveur affiche des logs pour :
- Connexions WebSocket
- Envoi de SMS
- Envoi d'emails
- Erreurs

### Métriques à Suivre

- Nombre de SMS envoyés
- Coût des SMS
- Taux de livraison
- Erreurs d'envoi

---

## 🚀 Déploiement

### Variables d'Environnement

Configurer toutes les variables dans votre plateforme de déploiement :
- DATABASE_URL
- JWT_SECRET
- EMAIL_USER / EMAIL_PASSWORD
- TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_PHONE_NUMBER

### Build

```bash
npm install --production
```

### Démarrage

```bash
npm start
```

---

## 📖 Documentation Complète

Pour plus de détails, consultez les guides spécifiques :

1. **[DEMARRAGE_RAPIDE.md](./DEMARRAGE_RAPIDE.md)** - Commencer en 10 minutes
2. **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Configuration PostgreSQL
3. **[SMS_SETUP.md](./SMS_SETUP.md)** - Configuration Twilio
4. **[NOTIFICATIONS_GUIDE.md](./NOTIFICATIONS_GUIDE.md)** - Système de notifications
5. **[EXEMPLES_SMS.md](./EXEMPLES_SMS.md)** - Exemples de SMS
6. **[NOUVELLES_FONCTIONNALITES.md](./NOUVELLES_FONCTIONNALITES.md)** - Vue d'ensemble

---

## 🆘 Support

### Problèmes Courants

**SMS non reçus** → Voir [SMS_SETUP.md](./SMS_SETUP.md)
**Email non reçu** → Vérifier `.env` et dossier spam
**Erreur de connexion DB** → Vérifier `DATABASE_URL`
**Token expiré** → Demander un nouveau lien

### Ressources

- Prisma Docs : https://www.prisma.io/docs
- Twilio Docs : https://www.twilio.com/docs/sms
- Express Docs : https://expressjs.com/
- Socket.IO Docs : https://socket.io/docs/

---

## 📝 Licence

Ce projet est développé dans le cadre d'un PFE (Projet de Fin d'Études).

---

## ✨ Fonctionnalités Principales

- ✅ Authentification JWT sécurisée
- ✅ Réinitialisation de mot de passe par email
- ✅ Notifications multi-canaux (Email, SMS, WebSocket)
- ✅ Click & Collect avec créneaux horaires
- ✅ Rappels automatiques 2h avant retrait
- ✅ Gestion des commandes avec statuts
- ✅ Codes promotionnels
- ✅ Favoris utilisateur
- ✅ Panier persistant
- ✅ Catalogue de produits avec filtres
- ✅ Base de données dynamique et extensible

---

**Bon développement ! 🚀**
