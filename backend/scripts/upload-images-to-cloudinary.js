import cloudinary from '../src/config/cloudinary.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const IMAGES_FOLDER = path.join(__dirname, '../images'); // Dossier contenant vos images
const CLOUDINARY_FOLDER = 'parapharmacie/products'; // Dossier Cloudinary de destination

// Fonction pour uploader une image
async function uploadImage(imagePath, folder) {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' }
      ]
    });

    console.log(`✅ Uploadé: ${path.basename(imagePath)}`);
    console.log(`   URL: ${result.secure_url}`);
    console.log(`   Public ID: ${result.public_id}`);
    
    return {
      filename: path.basename(imagePath),
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error(`❌ Erreur pour ${path.basename(imagePath)}:`, error.message);
    return null;
  }
}

// Fonction principale
async function uploadAllImages() {
  console.log('🚀 Début de l\'upload vers Cloudinary...\n');

  // Vérifier si le dossier existe
  if (!fs.existsSync(IMAGES_FOLDER)) {
    console.error(`❌ Le dossier ${IMAGES_FOLDER} n'existe pas`);
    console.log('📁 Créez le dossier "images" à la racine du projet backend');
    console.log('📁 Placez-y vos images à uploader');
    return;
  }

  // Lire tous les fichiers du dossier
  const files = fs.readdirSync(IMAGES_FOLDER);
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
  });

  if (imageFiles.length === 0) {
    console.log('⚠️  Aucune image trouvée dans le dossier');
    return;
  }

  console.log(`📸 ${imageFiles.length} image(s) trouvée(s)\n`);

  // Uploader chaque image
  const results = [];
  for (const file of imageFiles) {
    const imagePath = path.join(IMAGES_FOLDER, file);
    const result = await uploadImage(imagePath, CLOUDINARY_FOLDER);
    if (result) {
      results.push(result);
    }
    // Pause de 500ms entre chaque upload pour éviter les rate limits
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Résumé
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Upload terminé: ${results.length}/${imageFiles.length} images uploadées`);
  console.log('='.repeat(60));

  // Sauvegarder les URLs dans un fichier JSON
  const outputPath = path.join(__dirname, 'uploaded-images.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 URLs sauvegardées dans: ${outputPath}`);
}

// Exécuter le script
uploadAllImages().catch(console.error);
