// backend/src/utils/bcryptQueue.js
// Limite le nombre de bcrypt simultanés pour éviter de saturer le CPU
import bcrypt from 'bcrypt';

const MAX_CONCURRENT = 4; // max 4 bcrypt en parallèle
let running = 0;
const queue = [];

function next() {
  if (queue.length === 0 || running >= MAX_CONCURRENT) return;
  running++;
  const { fn, resolve, reject } = queue.shift();
  fn().then(r => { running--; resolve(r); next(); })
     .catch(e => { running--; reject(e); next(); });
}

function enqueue(fn) {
  return new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject });
    next();
  });
}

export const hash    = (data, rounds) => enqueue(() => bcrypt.hash(data, rounds));
export const compare = (data, hash)   => enqueue(() => bcrypt.compare(data, hash));
