// backend/src/routes/categories.js
import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET - Récupérer toutes les catégories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: {
          include: { items: true },
          orderBy: { order: 'asc' }
        },
        _count: { select: { products: true } }
      },
      orderBy: { order: 'asc' }
    });
    
    res.json(categories);
  } catch (error) {
    console.error('Erreur récupération catégories:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET - Récupérer une catégorie par ID
router.get('/:id', async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: {
        products: true,
        subcategories: {
          include: { items: true }
        }
      }
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Erreur récupération catégorie:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;