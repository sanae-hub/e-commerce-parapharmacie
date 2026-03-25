# Scripts Utilitaires

Ce dossier contient des scripts pour gérer la base de données, les utilisateurs et les images Cloudinary.

## 👥 Gestion des Utilisateurs

### 1. list-users.js - Lister tous les utilisateurs

**Usage :** Afficher tous les utilisateurs présents dans la base de données

**Commande :**
```bash
node scripts/list-users.js
```

**Résultat :**
- Liste complète des utilisateurs avec nom, email et rôle
- Compte total des utilisateurs

---

### 2. cleanup-users.js - Nettoyer les utilisateurs

**Usage :** Supprimer tous les utilisateurs sauf ceux spécifiés

**Commande :**
```bash
node scripts/cleanup-users.js
```

**Configuration :**
Le script conserve automatiquement :
- `admin@parapharmacie.ma` (Admin ParaClick)
- `sanaepatrish@gmail.com` (sanae patrish)

**Actions effectuées :**
- Supprime les favoris liés aux utilisateurs
- Supprime les logs d'audit
- Supprime les commandes (avec cascade)
- Supprime les utilisateurs
- Affiche un rapport détaillé

---

### 3. create-test-users.js - Créer des utilisateurs de test

**Usage :** Ajouter des utilisateurs de test à la base de données

**Commande :**
```bash
node scripts/create-test-users.js
```

**Utilisateurs créés :**
- Caissier : `caissier@parapharmacie.ma`
- Préparateur : `preparateur@parapharmacie.ma`
- 2 Clients de test

---

## ☁️ Scripts Cloudinary

### 4. test-upload.js - Test d'upload simple

**Usage :** Tester l'upload d'une seule image vers Cloudinary

**Commande :**
```bash
node scripts/test-upload.js
```

**Configuration :**
1. Placez une image de test dans `backend/images/test.jpg`
2. Ou modifiez `IMAGE_PATH` dans le script

**Résultat :**
- Affiche l'URL Cloudinary de l'image
- Affiche les informations (taille, dimensions, format)

---

### 5. upload-images-to-cloudinary.js - Upload en masse

**Usage :** Uploader toutes les images d'un dossier vers Cloudinary

**Commande :**
```bash
node scripts/upload-images-to-cloudinary.js
```

**Préparation :**
1. Créez le dossier `backend/images/`
2. Placez toutes vos images dedans
3. Exécutez le script

**Résultat :**
- Upload toutes les images vers Cloudinary
- Sauvegarde les URLs dans `uploaded-images.json`
- Affiche la progression en temps réel

---

## 🔧 Configuration requise

### Variables d'environnement (.env)

Assurez-vous que `backend/.env` contient :

```env
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

### Structure des dossiers

```
backend/
├── images/              # Placez vos images ici
│   ├── test.jpg
│   ├── produit1.jpg
│   └── produit2.jpg
├── scripts/
│   ├── test-upload.js
│   ├── upload-images-to-cloudinary.js
│   └── uploaded-images.json  # Généré automatiquement
└── src/
    └── config/
        └── cloudinary.js
```

---

## 📝 Exemples d'utilisation

### Exemple 1 : Tester la connexion Cloudinary

```bash
# 1. Placez une image de test
cp /path/to/image.jpg backend/images/test.jpg

# 2. Lancez le test
cd backend
node scripts/test-upload.js
```

### Exemple 2 : Uploader toutes vos images produits

```bash
# 1. Copiez toutes vos images
cp /path/to/products/*.jpg backend/images/

# 2. Lancez l'upload en masse
cd backend
node scripts/upload-images-to-cloudinary.js

# 3. Récupérez les URLs
cat scripts/uploaded-images.json
```

---

## 🎯 Workflow recommandé

### Pour débuter (première fois)

1. **Tester la connexion**
   ```bash
   node scripts/test-upload.js
   ```

2. **Si ça marche, uploader en masse**
   ```bash
   node scripts/upload-images-to-cloudinary.js
   ```

3. **Récupérer les URLs**
   - Ouvrez `scripts/uploaded-images.json`
   - Copiez les URLs dans votre base de données

### Pour ajouter de nouvelles images

1. **Placez les nouvelles images** dans `backend/images/`
2. **Lancez le script** : `node scripts/upload-images-to-cloudinary.js`
3. **Mettez à jour** votre base de données avec les nouvelles URLs

---

## 🐛 Troubleshooting

### ❌ "Cannot find module '../src/config/cloudinary.js'"
- Vérifiez que vous êtes dans le dossier `backend/`
- Vérifiez que le fichier `src/config/cloudinary.js` existe

### ❌ "Invalid credentials"
- Vérifiez vos identifiants dans `.env`
- Reconnectez-vous à Cloudinary Dashboard pour vérifier

### ❌ "ENOENT: no such file or directory"
- Le dossier `images/` n'existe pas
- Créez-le : `mkdir images`
- Placez-y vos images

### ❌ "File too large"
- Limite par défaut : 5MB
- Compressez vos images avant upload
- Ou modifiez la limite dans le script

---

## 📚 Documentation

- [Guide complet d'upload](../GUIDE_UPLOAD_IMAGES_CLOUDINARY.md)
- [Guide Cloudinary + Axios](../GUIDE_CLOUDINARY_AXIOS.md)
- [Démarrage rapide](../QUICKSTART_CLOUDINARY.md)

---

## 💡 Astuces

### Optimiser les images avant upload

```bash
# Avec ImageMagick
mogrify -resize 1000x1000 -quality 85 *.jpg

# Avec ffmpeg
for i in *.jpg; do ffmpeg -i "$i" -vf scale=1000:1000 "optimized_$i"; done
```

### Renommer les images en masse

```bash
# Ajouter un préfixe
for i in *.jpg; do mv "$i" "produit_$i"; done

# Numéroter
counter=1; for i in *.jpg; do mv "$i" "produit_$counter.jpg"; ((counter++)); done
```

### Vérifier les images uploadées

```bash
# Lister toutes les URLs
cat scripts/uploaded-images.json | grep "url"

# Compter les images uploadées
cat scripts/uploaded-images.json | grep "url" | wc -l
```

---

**✅ Scripts prêts à l'emploi pour gérer vos images Cloudinary !**
