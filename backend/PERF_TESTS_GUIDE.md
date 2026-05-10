# 🚀 LANCER LES TESTS DE PERFORMANCE

## Étape 1 — Démarrer le backend (Terminal 1)
```
cd backend
npm run dev
```
Attendre : `Serveur démarré sur http://localhost:5000`

## Étape 2 — Lancer la suite complète (Terminal 2)
```
cd backend
run-full-perf-test.bat
```

## Résultat attendu
```
╔══════════════════════════════════════════════════════════════╗
║                  RAPPORT FINAL                              ║
╚══════════════════════════════════════════════════════════════╝

  PASS  01 Smoke / Endpoints publics
  PASS  02 Auth (login/signup)
  PASS  03 Orders (commandes)
  PASS  04 Admin Dashboard
  PASS  05 User Journey (20 VUs)
  PASS  07 Load 200 Users
  PASS  08 Spike Promo Flash

  Tests réussis  : 7/7
  Tests échoués  : 0/7

  VERDICT : APPLICATION PRÊTE POUR 200 UTILISATEURS SIMULTANÉS
```

## Lancer un test individuel
```
cd backend

# Smoke (1 user, 30s)
k6 run --env BASE_URL=http://localhost:5000 tests/performance/01_public_endpoints.js

# 200 users
k6 run --env BASE_URL=http://localhost:5000 --env TEST_EMAIL=admin@parapharmacie.ma --env TEST_PASSWORD=Admin1234! tests/performance/07_load_200_users.js

# Stress (jusqu'à 100 users, trouve le point de rupture)
k6 run --env BASE_URL=http://localhost:5000 tests/performance/06_stress.js

# Endurance (50 users × 10 minutes, détecte fuites mémoire)
k6 run --env BASE_URL=http://localhost:5000 tests/performance/09_endurance.js
```

## Rapports JSON générés
```
backend/tests/performance/reports/
  01_public_endpoints_summary.json
  02_auth_summary.json
  03_orders_summary.json
  04_admin_dashboard_summary.json
  05_user_journey_summary.json
  07_load_200_users_summary.json
  08_spike_summary.json
```

## Interpréter les résultats

| Métrique     | Excellent   | Acceptable   | À optimiser  |
|--------------|-------------|--------------|--------------|
| p95 latence  | < 500ms     | < 1500ms     | > 1500ms     |
| Taux erreur  | < 1%        | < 5%         | > 5%         |
| Checks       | > 99%       | > 95%        | < 95%        |
