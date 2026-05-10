@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ============================================================
REM  run-full-perf-test.bat
REM  Lance tous les tests k6 en séquence et génère un rapport
REM  Usage : run-full-perf-test.bat
REM ============================================================

SET BASE_URL=http://127.0.0.1:5000
SET DISABLE_RATE_LIMIT=true
SET K6=k6
SET TESTS=tests\performance
SET REPORTS=tests\performance\reports
SET ADMIN_EMAIL=admin@parapharmacie.ma
SET ADMIN_PASS=Admin1234!

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║        SUITE COMPLÈTE DE TESTS DE PERFORMANCE               ║
echo ║        Cible : %BASE_URL%                        ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM ── Vérifier que le serveur est accessible ───────────────────────────────
echo [CHECK] Vérification du serveur...
curl -s --max-time 5 %BASE_URL%/api/health >nul 2>&1
IF ERRORLEVEL 1 (
  echo.
  echo  ERREUR : Backend inaccessible sur %BASE_URL%
  echo  Démarrez le backend d'abord :
  echo    cd backend ^&^& npm run dev
  echo.
  pause
  exit /b 1
)
echo  OK - Serveur accessible
echo.

REM ── Créer le dossier reports si absent ──────────────────────────────────
if not exist "%REPORTS%" mkdir "%REPORTS%"

REM ── Horodatage du rapport ────────────────────────────────────────────────
for /f "tokens=1-3 delims=/ " %%a in ("%date%") do set DATE_STR=%%c-%%b-%%a
for /f "tokens=1-2 delims=: " %%a in ("%time%") do set TIME_STR=%%a-%%b
SET TIMESTAMP=%DATE_STR%_%TIME_STR%

echo ════════════════════════════════════════════════════════════════
echo  ÉTAPE 1/7 — Smoke Test (endpoints publics, 1 VU, 30s)
echo ════════════════════════════════════════════════════════════════
%K6% run --env BASE_URL=%BASE_URL% %TESTS%\01_public_endpoints.js
SET RESULT_01=%ERRORLEVEL%
echo.

echo ════════════════════════════════════════════════════════════════
echo  ÉTAPE 2/7 — Auth Test (login/signup, jusqu'à 10 VUs)
echo ════════════════════════════════════════════════════════════════
%K6% run --env BASE_URL=%BASE_URL% ^
     --env TEST_EMAIL=%ADMIN_EMAIL% ^
     --env TEST_PASSWORD=%ADMIN_PASS% ^
     %TESTS%\02_auth.js
SET RESULT_02=%ERRORLEVEL%
echo.

echo ════════════════════════════════════════════════════════════════
echo  ÉTAPE 3/7 — Orders Test (commandes, jusqu'à 15 VUs)
echo ════════════════════════════════════════════════════════════════
%K6% run --env BASE_URL=%BASE_URL% ^
     --env TEST_ADMIN_EMAIL=%ADMIN_EMAIL% ^
     --env TEST_ADMIN_PASSWORD=%ADMIN_PASS% ^
     %TESTS%\03_orders.js
SET RESULT_03=%ERRORLEVEL%
echo.

echo ════════════════════════════════════════════════════════════════
echo  ÉTAPE 4/7 — Admin Dashboard (KPIs/rapports, jusqu'à 10 VUs)
echo ════════════════════════════════════════════════════════════════
%K6% run --env BASE_URL=%BASE_URL% ^
     --env TEST_ADMIN_EMAIL=%ADMIN_EMAIL% ^
     --env TEST_ADMIN_PASSWORD=%ADMIN_PASS% ^
     %TESTS%\04_admin_dashboard.js
SET RESULT_04=%ERRORLEVEL%
echo.

echo ════════════════════════════════════════════════════════════════
echo  ÉTAPE 5/7 — User Journey (parcours complet, jusqu'à 20 VUs)
echo ════════════════════════════════════════════════════════════════
%K6% run --env BASE_URL=%BASE_URL% %TESTS%\05_user_journey.js
SET RESULT_05=%ERRORLEVEL%
echo.

echo ════════════════════════════════════════════════════════════════
echo  ÉTAPE 6/7 — Load 200 Users (charge maximale, 200 VUs)
echo ════════════════════════════════════════════════════════════════
%K6% run --env BASE_URL=%BASE_URL% ^
     --env TEST_EMAIL=%ADMIN_EMAIL% ^
     --env TEST_PASSWORD=%ADMIN_PASS% ^
     %TESTS%\07_load_200_users.js
SET RESULT_07=%ERRORLEVEL%
echo.

echo ════════════════════════════════════════════════════════════════
echo  ÉTAPE 7/7 — Spike Test (promo flash, pic 200 VUs en 10s)
echo ════════════════════════════════════════════════════════════════
%K6% run --env BASE_URL=%BASE_URL% %TESTS%\08_spike_promo_flash.js
SET RESULT_08=%ERRORLEVEL%
echo.

REM ── Rapport final ────────────────────────────────────────────────────────
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                  RAPPORT FINAL                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

SET TOTAL_PASS=0
SET TOTAL_FAIL=0

call :check_result "01 Smoke / Endpoints publics " %RESULT_01%
call :check_result "02 Auth (login/signup)        " %RESULT_02%
call :check_result "03 Orders (commandes)         " %RESULT_03%
call :check_result "04 Admin Dashboard            " %RESULT_04%
call :check_result "05 User Journey (20 VUs)      " %RESULT_05%
call :check_result "07 Load 200 Users             " %RESULT_07%
call :check_result "08 Spike Promo Flash          " %RESULT_08%

echo.
echo  Tests réussis  : !TOTAL_PASS!/7
echo  Tests échoués  : !TOTAL_FAIL!/7
echo.
echo  Rapports JSON  : %REPORTS%\
echo.

IF !TOTAL_FAIL! EQU 0 (
  echo  VERDICT : APPLICATION PRÊTE POUR 200 UTILISATEURS SIMULTANÉS
) ELSE (
  echo  VERDICT : !TOTAL_FAIL! TEST(S) ÉCHOUÉ(S) — OPTIMISATIONS NÉCESSAIRES
)
echo.
pause
exit /b 0

REM ── Fonction check_result ────────────────────────────────────────────────
:check_result
SET TEST_NAME=%~1
SET TEST_CODE=%~2
IF "%TEST_CODE%"=="0" (
  echo   PASS  %TEST_NAME%
  SET /A TOTAL_PASS+=1
) ELSE (
  echo   FAIL  %TEST_NAME%  [code=%TEST_CODE%]
  SET /A TOTAL_FAIL+=1
)
exit /b 0
