import http from 'k6/http';
import { check } from 'k6';

export const options = { vus: 1, iterations: 3 };

export default function() {
  const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:5000';
  const r = http.get(`${BASE_URL}/api/health`);
  console.log('status:', r.status, '| duration:', r.timings.duration, 'ms | error:', r.error);
  check(r, { 'status 200': (res) => res.status === 200 });
}
