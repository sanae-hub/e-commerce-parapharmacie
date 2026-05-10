import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = { vus: 1, iterations: 1 };

export default function () {
  const BASE = __ENV.BASE_URL || 'http://127.0.0.1:5000';

  const tests = [
    // Endpoints du smoke test 01
    { url: `${BASE}/api/products?page=1&limit=20`,        name: 'products list' },
    { url: `${BASE}/api/categories`,                       name: 'categories' },
    { url: `${BASE}/api/promotions/active`,                name: 'promotions active' },
    { url: `${BASE}/api/products?search=creme&limit=10`,   name: 'products search' },
  ];

  // Récupérer un vrai productId
  const listRes = http.get(`${BASE}/api/products?limit=5`);
  let productId = null;
  let categoryId = null;
  try {
    const body = JSON.parse(listRes.body);
    productId  = body.products?.[0]?.id;
    categoryId = body.products?.[0]?.categoryId;
  } catch(e) {}

  if (productId) {
    tests.push({ url: `${BASE}/api/products/${productId}`,                    name: 'product detail' });
    tests.push({ url: `${BASE}/api/products?categoryId=${categoryId}&limit=10`, name: 'products by category' });
  }

  console.log('\n=== DIAGNOSTIC DÉTAILLÉ ===');
  for (const t of tests) {
    const r = http.get(t.url, { timeout: '15s' });
    const ok = r.status === 200;
    console.log(
      `[${ok ? 'OK' : 'FAIL'}] ${t.name.padEnd(25)} | status=${r.status} | ${r.timings.duration.toFixed(0)}ms | error="${r.error}" | body_start="${String(r.body).substring(0,80).replace(/\n/g,'')}"`,
    );
    sleep(0.1);
  }
  console.log('=== FIN DIAGNOSTIC ===\n');
}
