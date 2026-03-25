import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();

async function updateDatabaseWithCloudinaryUrls() {
  console.log('🔄 Mise à jour de la base de données avec les URLs Cloudinary...\n');

  try {
    // Lire le fichier JSON généré par le script d'upload
    const jsonPath = path.join(__dirname, 'uploaded-images.json');
    
    if (!fs.existsSync(jsonPath)) {
      console.log('❌ Fichier uploaded-images.json non trouvé');
      console.log('💡 Lancez d\'abord le script upload-images-to-cloudinary.js');
      return;
    }

    const images = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    console.log(`📸 ${images.length} image(s) trouvée(s) dans le fichier JSON\n`);

    let updated = 0;
    let notFound = 0;

    for (const img of images) {
      // Extraire le nom du produit depuis le nom du fichier
      // Ex: "creme-hydratante.jpg" ou "produit-123.jpg"
      const filename = img.filename.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '');
      
      // Méthode 1 : Chercher par ID si le nom contient un nombre
      const productId = filename.match(/\d+/)?.[0];
      
      if (productId) {
        const product = await prisma.product.findUnique({
          where: { id: productId }
        });

        if (product) {
          await prisma.product.update({
            where: { id: productId },
            data: { image: img.url }
          });
          console.log(`✅ Produit ${productId} mis à jour: ${product.name}`);
          updated++;
          continue;
        }
      }

      // Méthode 2 : Chercher par nom (recherche approximative)
      const searchTerm = filename.replace(/-/g, ' ').toLowerCase();
      const products = await prisma.product.findMany({
        where: {
          name: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        }
      });

      if (products.length > 0) {
        // Prendre le premier résultat
        await prisma.product.update({
          where: { id: products[0].id },
          data: { image: img.url }
        });
        console.log(`✅ Produit "${products[0].name}" mis à jour (recherche par nom)`);
        updated++;
      } else {
        console.log(`⚠️  Aucun produit trouvé pour: ${img.filename}`);
        notFound++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Mise à jour terminée:`);
    console.log(`   - ${updated} produit(s) mis à jour`);
    console.log(`   - ${notFound} image(s) non associée(s)`);
    console.log('='.repeat(60));

    if (notFound > 0) {
      console.log('\n💡 Pour les images non associées:');
      console.log('   1. Vérifiez les noms de fichiers');
      console.log('   2. Ou mettez à jour manuellement via Prisma Studio');
      console.log('   3. Commande: npx prisma studio');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateDatabaseWithCloudinaryUrls();
