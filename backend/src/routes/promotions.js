import express from 'express'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const router = express.Router()
const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware pour vérifier si l'utilisateur est admin
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token manquant' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Accès refusé. Droits administrateur requis.' });
    }

    req.userId = user.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide' });
  }
};

// GET /api/promotions - Récupérer toutes les promotions avec pagination et filtrage
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, active } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const now = new Date();

    // Construire la clause where
    const where = {
      startDate: { lte: now },
      endDate: { gte: now }
    };
    if (active !== undefined) {
      where.active = active === 'true';
    }

    // Compter le total
    const total = await prisma.promotion.count({ where });

    // Récupérer les promotions
    const promotions = await prisma.promotion.findMany({
      where,
      include: { stats: true },
      skip,
      take: limitNum,
      orderBy: { order: 'asc' }
    });

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      promotions,
      pagination: {
        total,
        totalPages,
        currentPage: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des promotions:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/promotions/active - Récupérer les promotions actives et affichées sur l'accueil
router.get('/active', async (req, res) => {
  try {
    const now = new Date()

    const promotions = await prisma.promotion.findMany({
      where: {
        active: true,
        displayOnHomepage: true,
        startDate: { lte: now },
        endDate: { gte: now }
      },
      include: { stats: true },
      orderBy: { order: 'asc' }
    })

    res.json(promotions)
  } catch (error) {
    console.error('Erreur lors de la récupération des promotions actives:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// POST /api/promotions/:id/view - Enregistrer une vue de promotion
router.post('/:id/view', async (req, res) => {
  try {
    const { id } = req.params

    const stats = await prisma.promotionStats.update({
      where: { promotionId: id },
      data: { impressions: { increment: 1 } }
    })

    res.json(stats)
  } catch (error) {
    console.error('Erreur lors de la mise à jour des statistiques:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// POST /api/promotions/:id/click - Enregistrer un clic sur une promotion
router.post('/:id/click', async (req, res) => {
  try {
    const { id } = req.params

    const stats = await prisma.promotionStats.update({
      where: { promotionId: id },
      data: { clicks: { increment: 1 } }
    })

    res.json(stats)
  } catch (error) {
    console.error('Erreur lors de la mise à jour des statistiques:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router
