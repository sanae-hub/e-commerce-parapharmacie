// diag_smoke.js — reproduit le test 01 avec logs détaillés
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = { vus: 1, iterations: 3 };

export function setup() {
  const res = http.get(`${__ENV.BASE_URL}/api/products?limit=5`);
  console.log(`[SETUP] products status=${res.status} body_len=${res.body?.length}`);
  if (res.status !== 200) {
    console.error(`[SETUP] ECHEC — status=${res.status} error="${res.error}" body="${res.body}"`);
    return { productId: null, categoryId: null };
  }
  const body = JSON.parse(res.body);
  const products = body.products || [];
  console.log(`[SETUP] ${products.length} produits trouvés`);
  return {
    productId:  products[0]?.id   || null,
    categoryId: products[0]?.categoryId || null,
  };
}

export default function (data) {
  const BASE = __ENV.BASE_URL;
  const { productId, categoryId } = data;

  // 1. Liste produits
  const r1 = http.get(`${BASE}/api/products?page=1&limit=20`);
  console.log(`[1] products list  status=${r1.status} dur=${r1.timings.duration.toFixed(0)}ms err="${r1.error}"`);
  check(r1, {
    'products 200':      r => r.status === 200,
    'products has body': r => { try { return JSON.parse(r.body).products !== undefined; } catch { return false; } },
    'products <500ms':   r => r.timings.duration < 500,
  });
  sleep(0.3);

  // 2. Filtre catégorie
  if (categoryId) {
    const r2 = http.get(`${BASE}/api/products?categoryId=${categoryId}&limit=10`);
    console.log(`[2] by category    status=${r2.status} dur=${r2.timings.duration.toFixed(0)}ms err="${r2.error}"`);
    check(r2, { 'category 200': r => r.status === 200 });
    sleep(0.2);
  }

  // 3. Recherche
  const r3 = http.get(`${BASE}/api/products?search=creme&limit=10`);
  console.log(`[3] search         status=${r3.status} dur=${r3.timings.duration.toFixed(0)}ms err="${r3.error}"`);
  check(r3, { 'search 200': r => r.status === 200 });
  sleep(0.2);

  // 4. Détail produit
  if (productId) {
    const r4 = http.get(`${BASE}/api/products/${productId}`);
    console.log(`[4] product detail status=${r4.status} dur=${r4.timings.duration.toFixed(0)}ms err="${r4.error}"`);
    const bodyId = (() => { try { return JSON.parse(r4.body).id; } catch { return null; } })();
    console.log(`    body.id=${bodyId} expected=${productId} match=${bodyId === productId}`);
    check(r4, {
      'detail 200':    r => r.status === 200,
      'detail has id': r => { try { return JSON.parse(r.body).id === productId; } catch { return false; } },
    });
    sleep(0.3);
  }

  // 5. Catégories
  const r5 = http.get(`${BASE}/api/categories`);
  console.log(`[5] categories     status=${r5.status} dur=${r5.timings.duration.toFixed(0)}ms err="${r5.error}"`);
  check(r5, { 'categories 200': r => r.status === 200 });
  sleep(0.3);

  // 6. Promotions
  const r6 = http.get(`${BASE}/api/promotions/active`);
  console.log(`[6] promotions     status=${r6.status} dur=${r6.timings.duration.toFixed(0)}ms err="${r6.error}"`);
  check(r6, { 'promotions 200': r => r.status === 200 });
  sleep(0.3);
}
