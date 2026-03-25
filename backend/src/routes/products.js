// backend/src/routes/products.js
import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// GET - Récupérer tous les produits avec pagination
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      search, 
      page = 1, 
      limit = 12  // ← 12 produits par page
    } = req.query
    
    const where = {}
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    if (category) {
      where.category = { name: category }
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // Récupérer les produits avec pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          brandModel: true,
          productImages: {
            orderBy: { order: 'asc' },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.product.count({ where })
    ])
    
    // Retourner avec pagination
    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total,
        hasMore: skip + products.length < total
      }
    })
  } catch (error) {
    console.error('Erreur récupération produits:', error)
    res.status(500).json({ 
      products: [],
      pagination: { currentPage: 1, totalPages: 1, total: 0, hasMore: false },
      message: 'Erreur serveur' 
    })
  }
})

// GET - Récupérer un produit par ID
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        brandModel: true,
        productImages: {
          orderBy: { order: 'asc' }
        },
        productVariants: true
      }
    })
    
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' })
    }
    
    res.json(product)
  } catch (error) {
    console.error('Erreur récupération produit:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// POST - Créer un produit (admin seulement)
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      usage,
      composition,
      benefits,
      price,
      oldPrice,
      image,
      brand,
      brandId,
      sku,
      stock,
      stockAlert,
      categoryId,
      type,
      images,
      variants,
      active
    } = req.body
    
    const product = await prisma.product.create({
      data: {
        name,
        description,
        usage,
        composition,
        benefits: benefits ? (Array.isArray(benefits) ? benefits : JSON.parse(benefits)) : [],
        price: parseFloat(price),
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        image,
        brand,
        brandId,
        sku,
        stock: parseInt(stock) || 0,
        stockAlert: parseInt(stockAlert) || 10,
        categoryId,
        type,
        images: images ? (Array.isArray(images) ? images : JSON.parse(images)) : [],
        variants: variants ? (Array.isArray(variants) ? variants : JSON.parse(variants)) : [],
        active: active !== undefined ? active : true
      },
      include: {
        category: true,
        brandModel: true
      }
    })
    
    res.status(201).json(product)
  } catch (error) {
    console.error('Erreur création produit:', error)
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
})

// PUT - Mettre à jour un produit (admin seulement)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const {
      name,
      description,
      usage,
      composition,
      benefits,
      price,
      oldPrice,
      image,
      brand,
      brandId,
      sku,
      rating,
      reviews,
      stock,
      stockAlert,
      categoryId,
      type,
      images,
      variants,
      active
    } = req.body
    
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        usage,
        composition,
        benefits: benefits ? (Array.isArray(benefits) ? benefits : JSON.parse(benefits)) : undefined,
        price: parseFloat(price),
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        image,
        brand,
        brandId,
        sku,
        rating: rating ? parseFloat(rating) : undefined,
        reviews: reviews ? parseInt(reviews) : undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        stockAlert: stockAlert !== undefined ? parseInt(stockAlert) : undefined,
        categoryId,
        type,
        images: images ? (Array.isArray(images) ? images : JSON.parse(images)) : undefined,
        variants: variants ? (Array.isArray(variants) ? variants : JSON.parse(variants)) : undefined,
        active
      },
      include: {
        category: true,
        brandModel: true
      }
    })
    
    res.json(product)
  } catch (error) {
    console.error('Erreur mise à jour produit:', error)
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
})
// backend/src/routes/products.js
// REMPLACEZ la route DELETE par celle-ci :

// DELETE - Supprimer un produit (admin seulement)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    console.log('🔍 Tentative de suppression du produit:', id)
    
    // Vérifier si le produit existe
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: true,
        favorites: true,
        productImages: true,
        productVariants: true,
        stockMovements: true
      }
    })
    
    if (!product) {
      console.log('❌ Produit non trouvé:', id)
      return res.status(404).json({ message: 'Produit non trouvé' })
    }
    
    console.log('✅ Produit trouvé:', product.name)
    console.log(`📊 Relations trouvées: 
      - orderItems: ${product.orderItems.length}
      - favorites: ${product.favorites.length}
      - productImages: ${product.productImages.length}
      - productVariants: ${product.productVariants.length}
      - stockMovements: ${product.stockMovements.length}`)
    
    // 1. Supprimer les OrderItems
    if (product.orderItems.length > 0) {
      await prisma.orderItem.deleteMany({
        where: { productId: id }
      })
      console.log('✅ OrderItems supprimés')
    }
    
    // 2. Supprimer les Favorites
    if (product.favorites.length > 0) {
      await prisma.favorite.deleteMany({
        where: { productId: id }
      })
      console.log('✅ Favoris supprimés')
    }
    
    // 3. Supprimer les ProductImages
    if (product.productImages.length > 0) {
      await prisma.productImage.deleteMany({
        where: { productId: id }
      })
      console.log('✅ ProductImages supprimés')
    }
    
    // 4. Supprimer les ProductVariants et leurs StockMovements associés
    if (product.productVariants.length > 0) {
      for (const variant of product.productVariants) {
        // Supprimer les stockMovements liés à ce variant
        await prisma.stockMovement.deleteMany({
          where: { variantId: variant.id }
        })
      }
      await prisma.productVariant.deleteMany({
        where: { productId: id }
      })
      console.log('✅ ProductVariants supprimés')
    }
    
    // 5. Supprimer les StockMovements directs (sans variant)
    if (product.stockMovements.length > 0) {
      await prisma.stockMovement.deleteMany({
        where: { productId: id }
      })
      console.log('✅ StockMovements supprimés')
    }
    
    // 6. Enfin, supprimer le produit
    await prisma.product.delete({
      where: { id }
    })
    
    console.log('✅ Produit supprimé avec succès')
    res.json({ message: 'Produit supprimé avec succès' })
    
  } catch (error) {
    console.error('❌ Erreur suppression produit:', error)
    
    // Afficher plus de détails sur l'erreur
    if (error.code === 'P2003') {
      console.log('⚠️ Contrainte de clé étrangère violée')
      console.log('   Table concernée:', error.meta?.field_name || 'inconnue')
    }
    
    res.status(500).json({ 
      message: 'Erreur lors de la suppression du produit', 
      error: error.message,
      code: error.code
    })
  }
})

// PATCH - Mettre à jour le stock
router.patch('/:id/stock', async (req, res) => {
  try {
    const { id } = req.params
    const { quantity, type, reason } = req.body
    
    const product = await prisma.product.update({
      where: { id },
      data: {
        stock: {
          increment: type === 'add' ? quantity : -quantity
        }
      }
    })
    
    await prisma.stockMovement.create({
      data: {
        productId: id,
        type: type === 'add' ? 'ADD' : 'REMOVE',
        quantity,
        reason,
        userId: req.userId
      }
    })
    
    res.json(product)
  } catch (error) {
    console.error('Erreur mise à jour stock:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

export default router