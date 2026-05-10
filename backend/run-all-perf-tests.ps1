# run-all-perf-tests.ps1
$BASE_URL    = "http://127.0.0.1:5000"
$ADMIN_EMAIL = "admin@parapharmacie.ma"
$ADMIN_PASS  = "Admin1234!"
$TESTS       = "tests/performance"
$results     = @()

function Check-Backend {
    try {
        $r = Invoke-WebRequest -Uri "$BASE_URL/api/health" -TimeoutSec 3 -UseBasicParsing
        return $r.StatusCode -eq 200
    } catch {
        return $false
    }
}

function Run-Test {
    param(
        [string]$name,
        [string]$file,
        [string]$extra = ""
    )

    Write-Host ""
    Write-Host ("=" * 60) -ForegroundColor Cyan
    Write-Host "  $name" -ForegroundColor Yellow
    Write-Host ("=" * 60) -ForegroundColor Cyan

    if (-not (Check-Backend)) {
        Write-Host "  BACKEND ARRETE - relance npm run dev" -ForegroundColor Red
        $script:results += [PSCustomObject]@{ name = $name; status = "SKIP" }
        return
    }

    if ($extra -ne "") {
        $cmd = "k6 run --env BASE_URL=$BASE_URL $extra $TESTS/$file"
    } else {
        $cmd = "k6 run --env BASE_URL=$BASE_URL $TESTS/$file"
    }

    Write-Host "  $cmd" -ForegroundColor Gray
    Write-Host ""

    Invoke-Expression $cmd
    $code = $LASTEXITCODE

    if ($code -eq 0) {
        $script:results += [PSCustomObject]@{ name = $name; status = "PASS" }
        Write-Host "  >> PASS" -ForegroundColor Green
    } else {
        $script:results += [PSCustomObject]@{ name = $name; status = "FAIL" }
        Write-Host "  >> FAIL (code=$code)" -ForegroundColor Red
    }

    Write-Host "  Pause 5s..."
    Start-Sleep -Seconds 5
}

# ── Verification initiale ────────────────────────────────────────────────────
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   SUITE COMPLETE DE TESTS DE PERFORMANCE" -ForegroundColor Cyan
Write-Host "   Cible : $BASE_URL" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

if (-not (Check-Backend)) {
    Write-Host ""
    Write-Host "  ERREUR : Backend inaccessible sur $BASE_URL" -ForegroundColor Red
    Write-Host "  Lance d'abord : npm run dev" -ForegroundColor Yellow
    exit 1
}
Write-Host "  Backend OK" -ForegroundColor Green

# ── Lancement des tests ──────────────────────────────────────────────────────

Run-Test "01 - Smoke / Endpoints publics (1 a 20 VUs, ~2min)" `
         "01_public_endpoints.js"

Run-Test "02 - Auth login/signup (1 a 10 VUs, ~2min)" `
         "02_auth.js" `
         "--env TEST_EMAIL=$ADMIN_EMAIL --env TEST_PASSWORD=$ADMIN_PASS"

Run-Test "03 - Orders commandes (1 a 15 VUs, ~3min)" `
         "03_orders.js" `
         "--env TEST_ADMIN_EMAIL=$ADMIN_EMAIL --env TEST_ADMIN_PASSWORD=$ADMIN_PASS"

Run-Test "04 - Admin Dashboard KPIs (1 a 10 VUs, ~2min)" `
         "04_admin_dashboard.js" `
         "--env TEST_ADMIN_EMAIL=$ADMIN_EMAIL --env TEST_ADMIN_PASSWORD=$ADMIN_PASS"

Run-Test "05 - User Journey complet (0 a 20 VUs, ~3min)" `
         "05_user_journey.js"

Run-Test "06 - Stress test point de rupture (0 a 100 VUs, ~3min)" `
         "06_stress.js"

Run-Test "07 - Load 200 utilisateurs simultanes (~9min)" `
         "07_load_200_users.js" `
         "--env TEST_EMAIL=$ADMIN_EMAIL --env TEST_PASSWORD=$ADMIN_PASS"

Run-Test "08 - Spike promo flash pic 200 VUs en 10s (~4min)" `
         "08_spike_promo_flash.js"

Run-Test "09 - Endurance 50 VUs x 10 minutes" `
         "09_endurance.js"

# ── Rapport final ────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   RAPPORT FINAL" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

$pass = 0
$fail = 0
$skip = 0

foreach ($r in $results) {
    if ($r.status -eq "PASS") {
        Write-Host "  PASS  $($r.name)" -ForegroundColor Green
        $pass++
    } elseif ($r.status -eq "SKIP") {
        Write-Host "  SKIP  $($r.name)" -ForegroundColor Yellow
        $skip++
    } else {
        Write-Host "  FAIL  $($r.name)" -ForegroundColor Red
        $fail++
    }
}

Write-Host ""
Write-Host "  Tests reussis : $pass / $($results.Count)" -ForegroundColor White
Write-Host "  Tests echoues : $fail / $($results.Count)" -ForegroundColor White
if ($skip -gt 0) {
    Write-Host "  Tests ignores : $skip / $($results.Count)" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "  Rapports JSON : tests/performance/reports/" -ForegroundColor Gray
Write-Host ""

if ($fail -eq 0 -and $skip -eq 0) {
    Write-Host "  VERDICT : APPLICATION PRETE POUR 200+ UTILISATEURS SIMULTANES" -ForegroundColor Green
} elseif ($fail -le 2) {
    Write-Host "  VERDICT : OPTIMISATIONS MINEURES NECESSAIRES ($fail test(s) echoue(s))" -ForegroundColor Yellow
} else {
    Write-Host "  VERDICT : $fail TEST(S) ECHOUE(S) - OPTIMISATIONS REQUISES" -ForegroundColor Red
}
Write-Host ""
