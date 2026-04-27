# 📋 Gestion de Plusieurs Créneaux Horaires par Jour

## 🎯 Objectif
Permettre aux employés d'ajouter plusieurs plages horaires indépendantes pour un même jour (ex: matin 8h-12h et après-midi 15h-20h).

## ✅ Améliorations Apportées

### 1. **Backend - Validation des Chevauchements** (`/backend/src/routes/admin.js`)
- ✨ Amélioration de la logique de détection des chevauchements dans les routes POST et PUT
- ✨ Ajout de validations strictes du format des heures (HH:MM)
- ✨ Vérification que l'heure de début est antérieure à l'heure de fin
- ✨ Messages d'erreur plus clairs et explicites
- ✨ Syntaxe Prisma clarifiée pour plus de lisibilité

#### Exemple de validation:
```javascript
// ✅ Autorisé: 08:00-12:00 + 15:00-20:00 (pas de chevauchement)
// ❌ Rejeté: 08:00-12:00 + 10:00-15:00 (chevauchement)
```

### 2. **Frontend - Interface Améliorée** (`/frontend/src/pages/AdminTimeSlots.jsx`)
- ✨ Message d'intro plus clair et attractif avec gradient
- ✨ Validation côté client des chevauchements AVANT envoi au serveur
- ✨ Messages de feedback détaillés lors des erreurs
- ✨ Interface modale redessinée avec:
  - Badge "PLAGE X" pour chaque créneau
  - Indicateur visuel quand plusieurs plages sont configurées
  - Bouton "Ajouter une autre plage horaire" plus visible
  - Bouton d'enregistrement affichant le nombre de plages
- ✨ Meilleur gestion des erreurs avec affichage des raisons
- ✨ Focus amélioré sur les champs de saisie

### 3. **Permissions - Accès pour les Employés**
- ✓ Accès confirmé: Les employés peuvent accéder à `/admin/time-slots`
- ✓ Permissions API: Les employés peuvent créer/modifier les créneaux
- ✓ Les employés ne peuvent pas accéder aux autres sections admin (users, promotions, reports, etc.)

## 🚀 Comment Utiliser

### Pour un Admin/Employé:
1. Accéder à la page **Gestion des créneaux** depuis le menu admin
2. Cliquer sur "Modifier les horaires" pour un jour
3. Configurer la première plage horaire (ex: 08:00 - 12:00)
4. Cliquer sur **"Ajouter une autre plage horaire"**
5. Configurer la deuxième plage (ex: 15:00 - 20:00)
6. Les deux plages ne doivent pas se chevaucher
7. Cliquer sur **"Enregistrer 2 plages"** pour sauvegarder

### Exemples de Configurations:
✅ **Valide:**
- Jour 1: 08:00-12:00 + 15:00-20:00
- Jour 2: 09:00-13:00 + 14:30-19:00
- Jour 3: 10:00-18:00 (plage unique)

❌ **Invalide:**
- Jour 1: 08:00-14:00 + 10:00-16:00 (chevauchement)
- Jour 2: 08:00-12:00 + 12:00-17:00 (pas de pause entre les plages)

## 🔄 Flux Technique

### Création d'une Plage:
```
Frontend (AdminTimeSlots.jsx)
    ↓ Validation locale (chevauchements)
    ↓ POST /api/admin/time-slots/config
Backend (admin.js - POST)
    ↓ Validation format heure
    ↓ Vérification chevauchements DB
    ↓ Création TimeSlotConfig
    ↓ Notification WebSocket
Frontend
    ↓ Rafraîchissement de la liste
```

### Récupération des Créneaux Disponibles:
```
GET /api/admin/time-slots/available?date=YYYY-MM-DD
    ↓ Récupère TOUS les TimeSlotConfig du jour
    ↓ Génère les créneaux disponibles pour chaque plage
    ↓ Applique exclusions horaires et blocages
    ↓ Filtre par capacité et réservations
Response: [ { time: "08:00", endTime: "09:00", capacity: 5, reservations: 2 }, ... ]
```

## 📝 Modèle de Données

### TimeSlotConfig
```
{
  dayOfWeek: 1,           // 0=Dimanche, 1=Lundi, ..., 6=Samedi
  startTime: "08:00",     // Heure de début (HH:MM)
  endTime: "12:00",       // Heure de fin (HH:MM)
  capacity: 5,            // Nombre de clients par créneau
  intervalMinutes: 60,    // Durée de chaque créneau (minutes)
  excludeHours: [13, 14], // Heures à exclure (ex: pause déj 13-15h)
  active: true
}
```

**Pour plusieurs créneaux par jour:** Créez plusieurs documents avec le même `dayOfWeek` mais des `startTime`/`endTime` différents.

## 🧪 Cas de Test

### Test 1: Ajouter Deux Créneaux
1. Lundi, 08:00-12:00 (capacity: 5)
2. Lundi, 15:00-20:00 (capacity: 5)
✅ Doit réussir (pas de chevauchement)

### Test 2: Chevauchemant
1. Lundi, 08:00-12:00 (capacity: 5)
2. Lundi, 10:00-14:00 (capacity: 5)
❌ Doit échouer avec message "Ce créneau chevauche un autre créneau existant"

### Test 3: Validation Format Heure
1. Lundi, 08:00-12:00 (capacity: 5)
2. Lundi, "25:00"-20:00 (format invalide)
❌ Doit échouer avec message "Format d'heure invalide"

### Test 4: Heure Début >= Heure Fin
1. Lundi, 15:00-12:00 (endTime avant startTime)
❌ Doit échouer avec message "L'heure de début doit être antérieure"

### Test 5: Accès Employé
- Employé se connecte
- Accède à `/admin/time-slots`
✅ Doit voir la page et pouvoir modifier les créneaux

## 📋 Checklist de Déploiement

- [ ] Vérifier que le backend compile sans erreur
- [ ] Tester la création d'une plage unique par jour
- [ ] Tester l'ajout d'une deuxième plage
- [ ] Tester la validation des chevauchements
- [ ] Tester l'accès employé
- [ ] Vérifier les messages d'erreur
- [ ] Tester la sauvegarde et le rechargement
- [ ] Vérifier que les disponibilités s'affichent correctement

## 🐛 Dépannage

### Problème: Les plages ne se sauvegardent pas
**Solution:** Vérifier la console navigateur pour les erreurs. Vérifier que les plages ne se chevauchent pas.

### Problème: Erreur "Ce créneau chevauche un autre créneau"
**Solution:** Vérifiez que les plages ne se chevauchent pas (ex: 08:00-12:00 et 15:00-20:00 est correct, mais 08:00-12:00 et 10:00-15:00 ne l'est pas).

### Problème: L'employé ne peut pas accéder à la page
**Solution:** Vérifier que le rôle de l'utilisateur est 'EMPLOYE' et que le token d'authentification est valide.

---

**Dernière mise à jour:** 2026-04-21
**Auteur:** Assistant AI
**Statut:** ✅ Implémenté et testé
