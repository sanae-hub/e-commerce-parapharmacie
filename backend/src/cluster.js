// backend/src/cluster.js
import cluster from 'cluster';
import os from 'os';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`[Cluster] Primary ${process.pid} — démarrage de ${numCPUs} workers`);

  // En ESM, cluster.fork() a besoin du fichier d'entrée explicite
  cluster.setupPrimary({ exec: path.join(__dirname, 'server.js') });

  for (let i = 0; i < numCPUs; i++) cluster.fork();

  cluster.on('exit', (worker, code, signal) => {
    console.warn(`[Cluster] Worker ${worker.process.pid} mort (code=${code}, signal=${signal}) — redémarrage`);
    cluster.fork();
  });
} else {
  console.log(`[Cluster] Worker ${process.pid} démarré`);
  import('./server.js');
}
