import express from 'express';
import { uploadProfile, uploadProduct } from '../middleware/upload.js';
import { authenticateToken } from '../middleware/auth.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

// Upload image de profil
router.post('/profile', authenticateToken, uploadProfile.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }
    res.json({ 
      url: req.file.path,
      publicId: req.file.filename
    });
  } catch (error) {
    console.error('Erreur upload profil:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload' });
  }
});

// Upload image de produit
router.post('/product', authenticateToken, uploadProduct.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }
    res.json({ 
      url: req.file.path,
      publicId: req.file.filename
    });
  } catch (error) {
    console.error('Erreur upload produit:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload' });
  }
});

// Upload multiple images de produits
router.post('/products/multiple', authenticateToken, uploadProduct.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }
    const images = req.files.map(file => ({
      url: file.path,
      publicId: file.filename
    }));
    res.json({ images });
  } catch (error) {
    console.error('Erreur upload multiple:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload' });
  }
});

// Supprimer une image de Cloudinary
router.delete('/delete/:publicId', authenticateToken, async (req, res) => {
  try {
    const publicId = req.params.publicId.replace(/-/g, '/');
    await cloudinary.uploader.destroy(publicId);
    res.json({ message: 'Image supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

export default router;
