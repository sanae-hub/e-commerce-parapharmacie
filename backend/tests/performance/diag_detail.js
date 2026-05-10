import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = { vus: 1, iterations: 10 };

export default function () {
  const BASE = __ENV.BASE_URL || 'http://127.0.0.1:5000';

  // Test chaque endpoint individuellement avec log détaillé
  const endpoints = [
    `${BASE}/api/health`,
    `${BASE}/api/products?page=1&limit=5`,
    `${BASE}/api/categories`,
    `${BASE}/api/promotions/active`,
  ];

  for (const url of endpoints) {
    const r = http.get(url, { timeout: '10s' });
    console.log(
      `[${r.status}] ${url} | ${r.timings.duration.toFixed(0)}ms | error="${r.error}" | body_len=${r.body ? r.body.length : 0}`
    );
    check(r, { 'status 200': (res) => res.status === 200 });
    sleep(0.2);
  }
}
