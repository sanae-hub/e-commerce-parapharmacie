import cloudinary from '../src/config/cloudinary.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const FOLDER = 'parapharmacie'; // Dossier à scanner

async function getAllImages() {
  console.log('🔍 Récupération des images depuis Cloudinary...\n');

  try {
    // Récupérer toutes les ressources du dossier
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: FOLDER,
      max_results: 500, // Maximum par requête
      resource_type: 'image'
    });

    console.log(`✅ ${result.resources.length} image(s) trouvée(s)\n`);
    console.log('='.repeat(80));

    const images = result.resources.map((resource, index) => {
      console.log(`\n${index + 1}. ${resource.public_id}`);
      console.log(`   URL: ${resource.secure_url}`);
      console.log(`   Format: ${resource.format}`);
      console.log(`   Taille: ${resource.bytes} bytes`);
      console.log(`   Dimensions: ${resource.width}x${resource.height}`);
      console.log(`   Créé le: ${new Date(resource.created_at).toLocaleString('fr-FR')}`);

      return {
        publicId: resource.public_id,
        url: resource.secure_url,
        format: resource.format,
        bytes: resource.bytes,
        width: resource.width,
        height: resource.height,
        createdAt: resource.created_at
      };
    });

    console.log('\n' + '='.repeat(80));

    // Sauvegarder dans un fichier JSON
    const outputPath = path.join(__dirname, 'cloudinary-images.json');
    fs.writeFileSync(outputPath, JSON.stringify(images, null, 2));
    console.log(`\n📄 Sauvegardé dans: ${outputPath}`);

    // Générer un fichier CSV
    const csvPath = path.join(__dirname, 'cloudinary-images.csv');
    const csvContent = 'publicId,url,format,bytes,width,height,createdAt\n' + 
      images.map(img => 
        `"${img.publicId}","${img.url}","${img.format}",${img.bytes},${img.width},${img.height},"${img.createdAt}"`
      ).join('\n');
    
    fs.writeFileSync(csvPath, csvContent);
    console.log(`📄 CSV généré: ${csvPath}`);

    // Générer un fichier SQL pour import direct
    const sqlPath = path.join(__dirname, 'cloudinary-images.sql');
    const sqlContent = images.map((img, index) => {
      const filename = img.publicId.split('/').pop();
      return `-- Image ${index + 1}: ${filename}\nUPDATE products SET image = '${img.url}' WHERE name LIKE '%${filename}%';`;
    }).join('\n\n');
    
    fs.writeFileSync(sqlPath, sqlContent);
    console.log(`📄 SQL généré: ${sqlPath}`);

    console.log('\n✅ Terminé !\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    
    if (error.message.includes('Invalid')) {
      console.log('\n💡 Vérifiez vos identifiants Cloudinary dans backend/.env');
    }
  }
}

getAllImages();
