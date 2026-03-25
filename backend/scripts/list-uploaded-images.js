import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, 'uploaded-images.json');

// Vérifier si le fichier existe
if (!fs.existsSync(jsonPath)) {
  console.log('❌ Fichier uploaded-images.json non trouvé');
  console.log('💡 Lancez d\'abord le script upload-images-to-cloudinary.js');
  process.exit(1);
}

// Lire le fichier JSON
const images = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

console.log('📸 Images uploadées sur Cloudinary\n');
console.log('='.repeat(80));

images.forEach((img, index) => {
  console.log(`\n${index + 1}. ${img.filename}`);
  console.log(`   URL: ${img.url}`);
  console.log(`   Public ID: ${img.publicId}`);
});

console.log('\n' + '='.repeat(80));
console.log(`\n✅ Total: ${images.length} image(s)\n`);

// Générer un fichier CSV pour import facile
const csvPath = path.join(__dirname, 'uploaded-images.csv');
const csvContent = 'filename,url,publicId\n' + 
  images.map(img => `"${img.filename}","${img.url}","${img.publicId}"`).join('\n');

fs.writeFileSync(csvPath, csvContent);
console.log(`📄 Fichier CSV généré: ${csvPath}`);
console.log('💡 Vous pouvez l\'importer dans Excel ou votre base de données\n');
