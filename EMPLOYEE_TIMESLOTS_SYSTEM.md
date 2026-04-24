# 🎯 SYSTÈME DE CRÉNEAUX - Admin vs Employés

## 📊 Vue d'Ensemble

Le système de créneaux repose sur **DEUX concepts distincts**:

### 1️⃣ **Créneaux ADMIN** (TimeSlotConfig) - Contexte General
- **Utilité**: Définir les heures d'ouverture générales de la pharmacie par jour de la semaine
- **Qui les gère**: Administrateur uniquement
- **Structure**: 
  - Un créneau par jour par défaut
  - Plusieurs plages horaires possibles (ex: 8-12, 15-20)
  - Capacité par défaut pour tous les clients
  - Exclusions horaires (pause déjeuner)

- **Exemple**:
  ```
  Lundi:
    - 08:00 - 12:00 (capacité: 5)
    - 15:00 - 20:00 (capacité: 8)
  ```

### 2️⃣ **Créneaux EMPLOYÉS** (EmployeeSchedule) - Spécifique à chaque employé
- **Utilité**: Gérer la disponibilité de chaque employé et ses réservations spéciales
- **Qui les gère**: Admin peut assigner les créneaux, employé voit sa disponibilité
- **Structure**: 
  - Un ou plusieurs créneaux par jour de la semaine par employé
  - Réservations spéciales (congés, jours fermés, indisponibilités)
  - Capacité maximale que l'employé peut gérer
  - Statut d'availability

- **Exemple - Employé A (Salim)**:
  ```
  Lundi:
    - 08:00 - 12:00 (capacité: 3)
    - 15:00 - 20:00 (capacité: 5)
  Mardi:
    - RÉSERVATION: Congé payé
  Mercredi:
    - 09:00 - 13:00 (capacité: 4)
    - 15:00 - 19:00 (capacité: 4)
  ```

- **Exemple - Employé B (Fatima)**:
  ```
  Lundi:
    - 12:00 - 17:00 (capacité: 3)
  Mardi:
    - 08:00 - 12:00 (capacité: 3)
    - 15:00 - 20:00 (capacité: 5)
  ```

## 🔄 Flux de Réservation Client

```
1. Client demande un créneau pour Lundi 09:00
   ↓
2. Système CHECK: Existe-t-il un créneau ADMIN pour Lundi 09:00 ?
   - OUI: TimeSlotConfig Lundi 08:00-12:00 existe
   ↓
3. Système CHECK: Quel employé est disponible à cette heure ?
   - Salim: Lundi 08:00-12:00 ✅
   - Fatima: Lundi 12:00-17:00 ❌
   ↓
4. Assignation du créneau à Salim
   - Réservation créée: Lundi 09:00 avec Salim
```

## 📋 Modèles Prisma

### TimeSlotConfig (Créneaux Admin)
```
{
  dayOfWeek: 1,              // 0-6 (Lundi)
  startTime: "08:00",        // Heure début
  endTime: "12:00",          // Heure fin
  capacity: 5,               // Capacité default
  intervalMinutes: 60,       // Durée du créneau
  excludeHours: [13, 14],    // Heures fermées
  active: true
}
```

### EmployeeSchedule (Disponibilité Employé)
```
{
  employeeId: "emp_123",     // ID de l'employé
  dayOfWeek: 1,              // 0-6 (Lundi)
  startTime: "08:00",        // Heure début
  endTime: "12:00",          // Heure fin
  maxCapacity: 3,            // Max clients cet employé
  isAvailable: true          // Est disponible ce jour
}
```

### EmployeeSlotReservation (Réservations Spéciales)
```
{
  employeeId: "emp_123",
  date: "2026-04-21",        // Date spécifique
  startTime: "08:00",        // Heure début
  endTime: "12:00",          // Heure fin
  status: "ON_LEAVE",        // ACTIVE, CANCELLED, ON_LEAVE
  reason: "Congé annuel"     // Raison
}
```

## 🔌 Endpoints API

### Créneaux Admin (TimeSlotConfig)
```
GET    /api/admin/time-slots/config              → Lister tous les créneaux
POST   /api/admin/time-slots/config              → Créer un créneau
PUT    /api/admin/time-slots/config/:id          → Modifier
DELETE /api/admin/time-slots/config/:id          → Supprimer

GET    /api/admin/time-slots/available?date=... → Créneaux disponibles pour une date
```

### Créneaux Employés
```
GET    /api/admin/employees/:employeeId/schedule
POST   /api/admin/employees/:employeeId/schedule
PUT    /api/admin/employees/:employeeId/schedule/:scheduleId
DELETE /api/admin/employees/:employeeId/schedule/:scheduleId

GET    /api/admin/employees/:employeeId/reservations
POST   /api/admin/employees/:employeeId/reservations
PUT    /api/admin/employees/:employeeId/reservations/:reservationId
DELETE /api/admin/employees/:employeeId/reservations/:reservationId

GET    /api/admin/employees/:employeeId/availability?date=...&time=...
```

## 📝 Cas d'Usage

### Cas 1: Créer les horaires de la pharmacie
```bash
# Admin crée les créneaux généraux
POST /api/admin/time-slots/config
{
  "dayOfWeek": 1,        // Lundi
  "startTime": "08:00",
  "endTime": "12:00",
  "capacity": 10,
  "intervalMinutes": 60
}

POST /api/admin/time-slots/config
{
  "dayOfWeek": 1,        // Lundi aussi
  "startTime": "15:00",
  "endTime": "20:00",
  "capacity": 10,
  "intervalMinutes": 60
}
```

### Cas 2: Assigner un employé à ces créneaux
```bash
# Admin assigne Salim au même créneaux
POST /api/admin/employees/emp_salim/schedule
{
  "dayOfWeek": 1,
  "startTime": "08:00",
  "endTime": "12:00",
  "maxCapacity": 3
}

POST /api/admin/employees/emp_salim/schedule
{
  "dayOfWeek": 1,
  "startTime": "15:00",
  "endTime": "20:00",
  "maxCapacity": 5
}
```

### Cas 3: Ajouter un congé employé
```bash
# Salim en congé le 25 Avril
POST /api/admin/employees/emp_salim/reservations
{
  "date": "2026-04-25",
  "startTime": "08:00",
  "endTime": "20:00",
  "status": "ON_LEAVE",
  "reason": "Congé annuel"
}
```

### Cas 4: Vérifier la disponibilité
```bash
# Vérifier si Salim est dispo Lundi 09:00
GET /api/admin/employees/emp_salim/availability?date=2026-04-21&time=09:00

Response:
{
  "isAvailable": true,
  "schedules": [
    { "dayOfWeek": 1, "startTime": "08:00", "endTime": "12:00" }
  ],
  "blockedReservation": null
}
```

## 🎯 Validation des Chevauchements

### Pour TimeSlotConfig
- ❌ Rejeté: Lundi 08:00-14:00 + Lundi 10:00-16:00 (chevauchement)
- ✅ Accepté: Lundi 08:00-12:00 + Lundi 15:00-20:00 (pas de chevauchement)

### Pour EmployeeSchedule
- ❌ Rejeté: Même employé, même jour, créneau qui se chevauche
- ✅ Accepté: Même employé, plusieurs créneaux non-chevauchants

### Pour EmployeeSlotReservation
- ⚠️ Warn: Une réservation surcharge le créneau existant
- ✅ OK: Peut avoir plusieurs réservations différents jours

## 🧪 Cas de Test

### Test 1: Créer deux créneaux Admin
```bash
POST /api/admin/time-slots/config
{ dayOfWeek: 1, startTime: "08:00", endTime: "12:00", capacity: 5 }

POST /api/admin/time-slots/config
{ dayOfWeek: 1, startTime: "15:00", endTime: "20:00", capacity: 5 }

✅ Doit réussir (pas de chevauchement)
```

### Test 2: Créer deux créneaux Employé
```bash
POST /api/admin/employees/emp1/schedule
{ dayOfWeek: 1, startTime: "08:00", endTime: "12:00", maxCapacity: 3 }

POST /api/admin/employees/emp1/schedule
{ dayOfWeek: 1, startTime: "15:00", endTime: "20:00", maxCapacity: 5 }

✅ Doit réussir (pas de chevauchement)
```

### Test 3: Chevauchement Employé
```bash
POST /api/admin/employees/emp1/schedule
{ dayOfWeek: 1, startTime: "08:00", endTime: "12:00", maxCapacity: 3 }

POST /api/admin/employees/emp1/schedule
{ dayOfWeek: 1, startTime: "10:00", endTime: "15:00", maxCapacity: 5 }

❌ Doit échouer: "Ce créneau chevauche un autre créneau"
```

### Test 4: Vérifier disponibilité après congé
```bash
# Salim en congé 25 Avril
POST /api/admin/employees/emp_salim/reservations
{
  "date": "2026-04-25",
  "startTime": "08:00",
  "endTime": "20:00",
  "status": "ON_LEAVE"
}

# Vérifier dispo
GET /api/admin/employees/emp_salim/availability?date=2026-04-25&time=09:00

✅ isAvailable: false (blocké par congé)
```

## 🎓 Résumé

| Aspect | TimeSlotConfig (Admin) | EmployeeSchedule (Employé) |
|--------|--------|--------|
| **Portée** | Toute la pharmacie | Un employé spécifique |
| **Qui gère** | Admin | Admin |
| **Qui peut modifier** | Admin | Admin |
| **Fréquence** | Récurrente (par jour semaine) | Récurrente (par jour semaine) |
| **Spécialisations** | Capacité globale | Capacité par employé |
| **Surcharge** | Exclusions horaires | Réservations spéciales |
| **Cas d'usage** | Heures ouverture | Indisponibilité employé |

## ✅ Checklist Implémentation

- [x] Routes backend pour EmployeeSchedule (GET, POST, PUT, DELETE)
- [x] Routes backend pour EmployeeSlotReservation
- [x] Validation des chevauchements
- [x] Endpoint availability check
- [x] Logs d'audit pour toutes les actions
- [x] WebSocket notifications
- [ ] Frontend pour gérer les créneaux employé
- [ ] Frontend pour gérer les réservations employé
- [ ] Interface d'affichage des créneaux
- [ ] Tests unitaires

---

**Version**: 1.0  
**Date**: 2026-04-21  
**Statut**: Backend complet, Frontend en attente
