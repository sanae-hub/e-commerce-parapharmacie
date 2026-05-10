import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = { vus: 1, iterations: 3 };

export function setup() {
  const BASE = __ENV.BASE_URL;
  const headers = { 'Content-Type': 'application/json' };

  // Login client
  const loginRes = http.post(`${BASE}/api/auth/login`,
    JSON.stringify({ email: 'client@test.com', password: 'Test1234!' }), { headers });
  console.log(`[SETUP] client login status=${loginRes.status} err="${loginRes.error}"`);
  const clientToken = loginRes.status === 200 ? JSON.parse(loginRes.body).token : null;

  // Login admin
  const adminRes = http.post(`${BASE}/api/admin/login`,
    JSON.stringify({ email: 'admin@parapharmacie.ma', password: 'Admin1234!' }), { headers });
  console.log(`[SETUP] admin login status=${adminRes.status} err="${adminRes.error}"`);
  const adminToken = adminRes.status === 200 ? JSON.parse(adminRes.body).token : null;

  // Récupérer un produit
  const prodRes = http.get(`${BASE}/api/products?limit=1&active=true`);
  const product = prodRes.status === 200 ? JSON.parse(prodRes.body).products?.[0] : null;
  console.log(`[SETUP] product=${product?.name} id=${product?.id}`);

  return { clientToken, adminToken, product };
}

export default function (data) {
  const BASE = __ENV.BASE_URL;
  const { clientToken, adminToken, product } = data;

  if (!clientToken) { console.error('PAS DE TOKEN CLIENT'); sleep(1); return; }
  if (!product)     { console.error('PAS DE PRODUIT');      sleep(1); return; }

  const authH = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${clientToken}` };

  // 1. Créer commande
  const t0 = Date.now();
  const r1 = http.post(`${BASE}/api/orders/create`,
    JSON.stringify({
      items: [{ id: product.id, name: product.name, price: product.price, quantity: 1 }],
      total: product.price,
      paymentMethod: 'cash',
    }),
    { headers: authH, timeout: '30s' }
  );
  console.log(`[1] create order status=${r1.status} dur=${r1.timings.duration.toFixed(0)}ms err="${r1.error}" body="${String(r1.body).substring(0,120)}"`);
  const orderId = r1.status === 201 ? JSON.parse(r1.body)?.order?.id : null;
  check(r1, { 'create 201': r => r.status === 201, 'create <1500ms': r => r.timings.duration < 1500 });
  sleep(0.5);

  // 2. Mes commandes
  const r2 = http.get(`${BASE}/api/orders/my-orders`, { headers: authH });
  console.log(`[2] my-orders      status=${r2.status} dur=${r2.timings.duration.toFixed(0)}ms`);
  check(r2, { 'my-orders 200': r => r.status === 200 });
  sleep(0.5);

  // 3. Détail commande
  if (orderId) {
    const r3 = http.get(`${BASE}/api/orders/${orderId}`, { headers: authH });
    console.log(`[3] order detail   status=${r3.status} dur=${r3.timings.duration.toFixed(0)}ms`);
    check(r3, { 'detail 200': r => r.status === 200 });
    sleep(0.5);
  }

  // 4. Annuler
  if (orderId) {
    const r4 = http.put(`${BASE}/api/orders/${orderId}/cancel`, null, { headers: authH });
    console.log(`[4] cancel         status=${r4.status} dur=${r4.timings.duration.toFixed(0)}ms`);
    check(r4, { 'cancel 200': r => r.status === 200 });
  }

  sleep(1);
}
