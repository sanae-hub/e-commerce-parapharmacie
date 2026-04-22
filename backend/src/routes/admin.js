import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getIo } from '../io.js';
import { verifyAdmin, verifyAdminOnly } from '../middleware/auth.js';
import { sendWhatsAppOrderNotification, sendWhatsAppPromotion } from '../services/whatsappService.js';
import { sendOrderStatusUpdate, sendOrderInvoice } from '../services/emailService.js';

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ==================== LOGIN ADMIN ====================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || ['admin@parapharmacie.ma'];
    
    if (!adminEmails.includes(email)) {
      return res.status(403).json({ message: 'Accès administrateur non autorisé' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Accès administrateur non autorisé' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Connexion admin réussie',
      token,
      user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ==================== KPIs & STATISTIQUES ====================
router.get('/kpis', verifyAdmin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const ordersToday = await prisma.order.count({ where: { createdAt: { gte: today, lt: tomorrow } } });
    const dailyRevenue = await prisma.order.aggregate({ where: { createdAt: { gte: today, lt: tomorrow }, status: { not: 'CANCELLED' } }, _sum: { total: true } });
    const monthlyRevenue = await prisma.order.aggregate({ where: { createdAt: { gte: firstDayOfMonth, lt: firstDayOfNextMonth }, status: { not: 'CANCELLED' } }, _sum: { total: true } });
    const outOfStock = await prisma.product.count({ where: { stock: { lte: 0 } } });
    const lowStock = await prisma.product.count({ where: { stock: { gt: 0, lte: 10 } } });
    const slotsReservedToday = await prisma.order.count({ where: { timeSlotDate: { gte: today, lt: tomorrow }, status: { notIn: ['CANCELLED', 'COMPLETED'] } } });
    const pendingOrders = await prisma.order.count({ where: { status: 'RECEIVED' } });

    res.json({
      ordersToday,
      dailyRevenue: dailyRevenue._sum.total || 0,
      monthlyRevenue: monthlyRevenue._sum.total || 0,
      outOfStock,
      lowStock,
      slotsReservedToday,
      pendingOrders,
      expiringSoon: await prisma.product.count({ where: { expiryDate: { gt: new Date(), lte: new Date(new Date().setMonth(new Date().getMonth() + 3)) } } })
    });
  } catch (error) {
    console.error('KPIs error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/sales-chart', verifyAdmin, async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    const now = new Date();
    let startDate = new Date();
    let groupBy = 'day';

    if (period === '7d') startDate.setDate(now.getDate() - 7);
    else if (period === '30d') startDate.setDate(now.getDate() - 30);
    else if (period === '12m') { startDate.setMonth(now.getMonth() - 12); groupBy = 'month'; }

    const orders = await prisma.order.findMany({ where: { createdAt: { gte: startDate }, status: { not: 'CANCELLED' } }, select: { createdAt: true, total: true } });
    const salesData = {};
    orders.forEach(order => {
      let key = groupBy === 'day' ? order.createdAt.toISOString().split('T')[0] : `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (!salesData[key]) salesData[key] = { date: key, revenue: 0, orders: 0 };
      salesData[key].revenue += order.total;
      salesData[key].orders += 1;
    });
    res.json(Object.values(salesData).sort((a, b) => a.date.localeCompare(b.date)));
  } catch (error) {
    console.error('Sales chart error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/urgent-orders', verifyAdmin, async (req, res) => {
  try {
    const now = new Date();
    const todayUtcStart = new Date(now.toISOString().slice(0, 10) + 'T00:00:00.000Z');
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const candidates = await prisma.order.findMany({
      where: { timeSlotDate: { gte: todayUtcStart, lte: threeDaysLater }, timeSlotStart: { not: null }, status: { in: ['RECEIVED', 'PREPARING'] } },
      include: { user: { select: { firstName: true, lastName: true, phone: true, email: true } }, items: { include: { product: { select: { name: true, image: true } } } } },
      orderBy: [{ timeSlotDate: 'asc' }, { timeSlotStart: 'asc' }]
    });
    const timeframeHours = parseInt(req.query.hours) || 2;
    const timeframeMs = timeframeHours * 60 * 60 * 1000;
    const urgentOrders = candidates.map(order => {
      const dateStr = order.timeSlotDate.toISOString().slice(0, 10);
      const [h, m] = order.timeSlotStart.split(':').map(Number);
      const slotDatetime = new Date(`${dateStr}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00.000Z`);
      const slotDatetimeUTC = new Date(slotDatetime.getTime() - 60 * 60 * 1000);
      const diffMs = slotDatetimeUTC.getTime() - now.getTime();
      return { ...order, _diffMs: diffMs };
    }).filter(order => order._diffMs >= 0 && order._diffMs <= timeframeMs).map(({ _diffMs, ...order }) => ({ ...order, minutesUntilSlot: Math.floor(_diffMs / 60000) }));
    res.json(urgentOrders);
  } catch (error) {
    console.error('Urgent orders error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/recent-orders', verifyAdmin, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const orders = await prisma.order.findMany({ take: parseInt(limit), orderBy: { createdAt: 'desc' }, include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } }, items: { include: { product: { select: { name: true, image: true, id: true } } } } } });
    res.json(orders);
  } catch (error) {
    console.error('Recent orders error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/low-stock-products', verifyAdmin, async (req, res) => {
  try {
    const { threshold = 10 } = req.query;
    const products = await prisma.product.findMany({ where: { stock: { lte: parseInt(threshold) } }, select: { id: true, name: true, stock: true, image: true, price: true, brand: true }, orderBy: { stock: 'asc' } });
    res.json(products);
  } catch (error) {
    console.error('Low stock error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/expiring-products', verifyAdmin, async (req, res) => {
  try {
    const { months = 3 } = req.query;
    const now = new Date();
    const futureDate = new Date();
    futureDate.setMonth(now.getMonth() + parseInt(months));
    const products = await prisma.product.findMany({ where: { expiryDate: { gt: now, lte: futureDate } }, select: { id: true, name: true, stock: true, image: true, expiryDate: true, brand: true }, orderBy: { expiryDate: 'asc' } });
    res.json(products);
  } catch (error) {
    console.error('Expiring products error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/heatmap-slots', verifyAdmin, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    const orders = await prisma.order.findMany({ where: { timeSlotDate: { gte: startDate }, timeSlotStart: { not: null } }, select: { timeSlotStart: true, timeSlotDate: true } });
    const heatmap = {};
    const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    orders.forEach(order => { const key = `${daysOfWeek[new Date(order.timeSlotDate).getDay()]}-${order.timeSlotStart}`; heatmap[key] = (heatmap[key] || 0) + 1; });
    const heatmapData = [];
    for (let day = 1; day < 7; day++) {
      for (let hour = 9; hour < 19; hour++) {
        for (let minute of [0, 30]) {
          const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
          heatmapData.push({ day: daysOfWeek[day], time: timeStr, count: heatmap[`${daysOfWeek[day]}-${timeStr}`] || 0 });
        }
      }
    }
    res.json(heatmapData);
  } catch (error) {
    console.error('Heatmap error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ==================== COMMANDES ====================
router.get('/orders', verifyAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = status ? { status } : {};
    const allOrders = await prisma.order.findMany({
      where,
      include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } }, items: { include: { product: { select: { name: true, image: true, price: true } } } } },
      orderBy: { createdAt: 'desc' }
    });
    const sortedOrders = [...allOrders].sort((a, b) => {
      const aType = a.type || 'CLICK_COLLECT';
      const bType = b.type || 'CLICK_COLLECT';
      if (aType === 'CLICK_COLLECT' && bType !== 'CLICK_COLLECT') return -1;
      if (aType !== 'CLICK_COLLECT' && bType === 'CLICK_COLLECT') return 1;
      return a.createdAt - b.createdAt;
    });
    const paginatedOrders = sortedOrders.slice(skip, skip + parseInt(limit));
    res.json({ orders: paginatedOrders, pagination: { page: parseInt(page), limit: parseInt(limit), total: allOrders.length, totalPages: Math.ceil(allOrders.length / parseInt(limit)) } });
  } catch (error) {
    console.error('Orders list error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.put('/orders/:orderId/status', verifyAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const orderBefore = await prisma.order.findUnique({ where: { id: orderId }, include: { user: true, items: { include: { product: { select: { id: true, name: true, stock: true, stockAlert: true } } } } } });
    if (!orderBefore) return res.status(404).json({ message: 'Commande non trouvée' });
    const order = await prisma.order.update({ where: { id: orderId }, data: { status }, include: { user: true, items: { include: { product: true } } } });
    const io = getIo();
    if (status === 'PREPARING' && orderBefore.status === 'RECEIVED') {
      for (const item of orderBefore.items) {
        const newStock = Math.max(0, item.product.stock - item.quantity);
        await prisma.product.update({ where: { id: item.productId }, data: { stock: newStock } });
        await prisma.stockMovement.create({ data: { productId: item.productId, type: 'SALE', quantity: -item.quantity, reason: `Commande confirmée ${orderBefore.orderNumber}`, userId: req.userId } });
        if (io && newStock <= item.product.stockAlert) io.to('admin_room').emit('admin_stock_alert', { productId: item.productId, productName: item.product.name, stock: newStock, stockAlert: item.product.stockAlert, timestamp: new Date() });
      }
    }
    const STOCK_DEDUCTED_STATUSES = ['PREPARING', 'READY', 'COMPLETED'];
    const TERMINAL_STATUSES = ['CANCELLED', 'REFUNDED', 'RETURNED'];
    const stockWasPreviouslyDeducted = STOCK_DEDUCTED_STATUSES.includes(orderBefore.status);
    const isNowTerminal = TERMINAL_STATUSES.includes(status);
    const wasAlreadyTerminal = TERMINAL_STATUSES.includes(orderBefore.status);
    if (isNowTerminal && stockWasPreviouslyDeducted && !wasAlreadyTerminal) {
      for (const item of orderBefore.items) {
        const newStock = item.product.stock + item.quantity;
        await prisma.product.update({ where: { id: item.productId }, data: { stock: newStock } });
        await prisma.stockMovement.create({ data: { productId: item.productId, type: 'RETURN', quantity: item.quantity, reason: `${status === 'RETURNED' ? 'Retour produit' : 'Annulation'} commande ${orderBefore.orderNumber}`, userId: req.userId } });
      }
    }
    if (order.user?.whatsapp && order.user.notificationWhatsApp) {
      try { await sendWhatsAppOrderNotification(order.user.whatsapp, order, status); } catch (wsError) { console.error('Erreur envoi notification WhatsApp:', wsError); }
    }
    if (order.user?.email && order.user.notificationEmail !== false) {
      try { await sendOrderStatusUpdate(order.user.email, order, status); } catch (mailErr) { console.error('Erreur envoi email statut:', mailErr); }
    }
    if (status === 'COMPLETED' && orderBefore.status !== 'COMPLETED' && order.user?.email && order.user.notificationEmail !== false) {
      try { await sendOrderInvoice(order.user.email, order); } catch (invoiceErr) { console.error('Erreur envoi facture:', invoiceErr); }
    }
    res.json({ message: 'Statut mis à jour', order });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ==================== CODES PROMO ====================
router.get('/promo-codes', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, active } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = active !== undefined ? { active: active === 'true' } : {};
    const [promoCodes, total] = await Promise.all([prisma.promoCode.findMany({ where, include: { promoHistory: { select: { id: true } } }, orderBy: { createdAt: 'desc' }, skip, take: parseInt(limit) }), prisma.promoCode.count({ where })]);
    const withStats = promoCodes.map(promo => ({ ...promo, usageCount: promo.promoHistory.length, promoHistory: undefined }));
    res.json({ promoCodes: withStats, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    console.error('Promo codes list error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

router.post('/promo-codes', verifyAdmin, async (req, res) => {
  try {
    const { code, description, discountType, discountValue, applicableOn, productIds, categoryIds, minPurchaseAmount, maxDiscountAmount, usageLimit, expiryDate, active } = req.body;
    if (!code || !discountValue) return res.status(400).json({ message: 'Code et valeur de réduction requis' });
    const promoCode = await prisma.promoCode.create({ data: { code: code.toUpperCase(), description, discountType: discountType || 'percentage', discountValue: parseFloat(discountValue), applicableOn: applicableOn || 'global', productIds: productIds ? (Array.isArray(productIds) ? productIds : JSON.parse(productIds)) : [], categoryIds: categoryIds ? (Array.isArray(categoryIds) ? categoryIds : JSON.parse(categoryIds)) : [], minPurchaseAmount: minPurchaseAmount ? parseFloat(minPurchaseAmount) : 0, maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null, usageLimit: usageLimit ? parseInt(usageLimit) : null, expiryDate: expiryDate ? new Date(expiryDate) : null, active: active !== false } });
    const io = getIo();
    if (io) io.emit('notification', { type: 'PROMO_CODE', title: '🎉 Nouveau code promo !', message: `Utilisez le code ${promoCode.code} pour bénéficier de ${promoCode.discountType === 'percentage' ? `${promoCode.discountValue}% de réduction` : `${promoCode.discountValue} DH de réduction`}${promoCode.expiryDate ? ` jusqu'au ${new Date(promoCode.expiryDate).toLocaleDateString('fr-FR')}` : ''}`, code: promoCode.code, discountType: promoCode.discountType, discountValue: promoCode.discountValue, expiryDate: promoCode.expiryDate, timestamp: new Date() });
    res.status(201).json({ message: 'Code promo créé', promoCode });
  } catch (error) {
    console.error('Create promo code error:', error);
    if (error.code === 'P2002') return res.status(400).json({ message: 'Ce code promo existe déjà' });
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

router.get('/promo-codes/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const promoCode = await prisma.promoCode.findUnique({ where: { id }, include: { promoHistory: { include: { order: { select: { id: true, orderNumber: true, total: true, createdAt: true, user: { select: { id: true, email: true, firstName: true, lastName: true } } } } }, orderBy: { createdAt: 'desc' }, take: 100 } } });
    if (!promoCode) return res.status(404).json({ message: 'Code promo non trouvé' });
    res.json(promoCode);
  } catch (error) {
    console.error('Get promo code error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

router.put('/promo-codes/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { description, discountType, discountValue, applicableOn, productIds, categoryIds, minPurchaseAmount, maxDiscountAmount, usageLimit, expiryDate, active } = req.body;
    const promoCode = await prisma.promoCode.update({ where: { id }, data: { ...(description !== undefined && { description }), ...(discountType && { discountType }), ...(discountValue !== undefined && { discountValue: parseFloat(discountValue) }), ...(applicableOn && { applicableOn }), ...(productIds && { productIds: Array.isArray(productIds) ? productIds : JSON.parse(productIds) }), ...(categoryIds && { categoryIds: Array.isArray(categoryIds) ? categoryIds : JSON.parse(categoryIds) }), ...(minPurchaseAmount !== undefined && { minPurchaseAmount: parseFloat(minPurchaseAmount) }), ...(maxDiscountAmount !== undefined && { maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null }), ...(usageLimit !== undefined && { usageLimit: usageLimit ? parseInt(usageLimit) : null }), ...(expiryDate !== undefined && { expiryDate: expiryDate ? new Date(expiryDate) : null }), ...(active !== undefined && { active }) } });
    res.json({ message: 'Code promo mis à jour', promoCode });
  } catch (error) {
    console.error('Update promo code error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

router.delete('/promo-codes/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.promoCode.delete({ where: { id } });
    res.json({ message: 'Code promo supprimé' });
  } catch (error) {
    console.error('Delete promo code error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ==================== PROMOTIONS ====================
router.get('/promotions', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, active } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = active !== undefined ? { active: active === 'true' } : {};
    const [promotions, total] = await Promise.all([prisma.promotion.findMany({ where, include: { stats: true }, orderBy: { createdAt: 'desc' }, skip, take: parseInt(limit) }), prisma.promotion.count({ where })]);
    res.json({ promotions, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    console.error('Promotions list error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

router.post('/promotions', verifyAdmin, async (req, res) => {
  try {
    const { title, description, subtitle, bannerImage, discountType, discountValue, oldPrice, price, stock, rating, productId, productName, productImage, badge, badgeColor, bgColor, iconName, features, ctaText, active, order, startDate, endDate } = req.body;
    if (!title || !startDate || !endDate) return res.status(400).json({ message: 'Titre et dates requis' });
    const promotion = await prisma.promotion.create({ data: { title, description, subtitle, bannerImage, discountType: discountType || 'percentage', discountValue: parseFloat(discountValue), oldPrice: oldPrice ? parseFloat(oldPrice) : null, price: price ? parseFloat(price) : null, stock: stock ? parseInt(stock) : null, rating: rating ? parseFloat(rating) : null, productId, productName, productImage, badge, badgeColor, bgColor, iconName, features: features || [], ctaText: ctaText || 'Profiter maintenant', active: active !== false, order: order || 0, startDate: new Date(startDate), endDate: new Date(endDate) } });
    await prisma.promotionStats.create({ data: { promotionId: promotion.id } });
    if (promotion.active) {
      const subscribedUsers = await prisma.user.findMany({ where: { notificationWhatsApp: true, whatsapp: { not: '' } }, select: { whatsapp: true } });
      subscribedUsers.forEach(u => sendWhatsAppPromotion(u.whatsapp, promotion).catch(err => console.error(`Erreur envoi promo WhatsApp à ${u.whatsapp}:`, err)));
    }
    res.status(201).json({ message: 'Promotion créée', promotion });
  } catch (error) {
    console.error('Create promotion error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

router.get('/promotions/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const promotion = await prisma.promotion.findUnique({ where: { id }, include: { stats: true } });
    if (!promotion) return res.status(404).json({ message: 'Promotion non trouvée' });
    res.json(promotion);
  } catch (error) {
    console.error('Get promotion error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

router.put('/promotions/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, bannerImage, bannerText, discountType, discountValue, applicableOn, productIds, categoryIds, minPurchaseAmount, maxDiscountAmount, startDate, endDate, displayOnHomepage, order, active } = req.body;
    const promotion = await prisma.promotion.update({ where: { id }, data: { ...(title && { title }), ...(description !== undefined && { description }), ...(bannerImage !== undefined && { bannerImage }), ...(bannerText !== undefined && { bannerText }), ...(discountType && { discountType }), ...(discountValue !== undefined && { discountValue: parseFloat(discountValue) }), ...(applicableOn && { applicableOn }), ...(productIds && { productIds: Array.isArray(productIds) ? productIds : JSON.parse(productIds) }), ...(categoryIds && { categoryIds: Array.isArray(categoryIds) ? categoryIds : JSON.parse(categoryIds) }), ...(minPurchaseAmount !== undefined && { minPurchaseAmount: parseFloat(minPurchaseAmount) }), ...(maxDiscountAmount !== undefined && { maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null }), ...(startDate && { startDate: new Date(startDate) }), ...(endDate && { endDate: new Date(endDate) }), ...(displayOnHomepage !== undefined && { displayOnHomepage }), ...(order !== undefined && { order: parseInt(order) }), ...(active !== undefined && { active }) }, include: { stats: true } });
    res.json({ message: 'Promotion mise à jour', promotion });
  } catch (error) {
    console.error('Update promotion error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

router.delete('/promotions/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.promotionStats.deleteMany({ where: { promotionId: id } });
    await prisma.promotion.delete({ where: { id } });
    res.json({ message: 'Promotion supprimée' });
  } catch (error) {
    console.error('Delete promotion error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ==================== GESTION DES CRÉNEAUX UNIFIÉS (STORE & EMPLOYEE) ====================
router.get('/time-slots/config', verifyAdmin, async (req, res) => {
  try {
    const { all, type, employeeId } = req.query;
    const where = {};
    if (all !== 'true') where.active = true;
    if (type) where.type = type;
    if (employeeId) where.userId = employeeId;
    
    // If user is EMPLOYE, and no employeeId requested, default to their own
    if (req.userRole === 'EMPLOYE' && !employeeId && type === 'EMPLOYEE') {
      where.userId = req.userId;
    }

    const configs = await prisma.timeSlotConfig.findMany({ 
      where, 
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] 
    });
    res.json(configs);
  } catch (error) {
    console.error('Get time slot config error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

router.post('/time-slots/config', verifyAdmin, async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime, capacity, intervalMinutes, active } = req.body;
    if (dayOfWeek === undefined || !startTime || !endTime) {
      return res.status(400).json({ message: 'Jour, heure de début et heure de fin requis' });
    }
    
    if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
      return res.status(400).json({ message: 'Format d\'heure invalide. Utilisez HH:MM' });
    }
    
    if (startTime >= endTime) {
      return res.status(400).json({ message: 'L\'heure de début doit être antérieure à l\'heure de fin' });
    }
    
    const overlapping = await prisma.timeSlotConfig.findFirst({
      where: {
        dayOfWeek: parseInt(dayOfWeek),
        active: true,
        OR: [
          { startTime: { lt: endTime }, endTime: { gt: startTime } }
        ]
      }
    });
    
    if (overlapping) {
      return res.status(400).json({ message: 'Ce créneau chevauche un autre créneau existant sur ce jour' });
    }
    
    const config = await prisma.timeSlotConfig.create({ 
      data: { 
        dayOfWeek: parseInt(dayOfWeek), 
        startTime, 
        endTime, 
        capacity: capacity || 5, 
        intervalMinutes: intervalMinutes || 30, 
        active: active !== undefined ? active : true,
        type: req.body.type || 'STORE',
        userId: req.body.userId || (req.userRole === 'EMPLOYE' ? req.userId : null)
      } 
    });
    
    const io = getIo();
    if (io) io.to('admin_room').emit('time_slots_changed', { action: 'create', data: config });
    
    res.status(201).json({ message: 'Créneau créé', config });
  } catch (error) {
    console.error('Create time slot config error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Cette configuration existe déjà' });
    }
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

router.put('/time-slots/config/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, capacity, intervalMinutes, active } = req.body;
    
    const currentConfig = await prisma.timeSlotConfig.findUnique({ where: { id } });
    if (!currentConfig) {
      return res.status(404).json({ message: 'Configuration non trouvée' });
    }
    
    const newStartTime = startTime || currentConfig.startTime;
    const newEndTime = endTime || currentConfig.endTime;
    
    if (!/^\d{2}:\d{2}$/.test(newStartTime) || !/^\d{2}:\d{2}$/.test(newEndTime)) {
      return res.status(400).json({ message: 'Format d\'heure invalide. Utilisez HH:MM' });
    }
    
    if (newStartTime >= newEndTime) {
      return res.status(400).json({ message: 'L\'heure de début doit être antérieure à l\'heure de fin' });
    }
    
    const overlapping = await prisma.timeSlotConfig.findFirst({
      where: {
        id: { not: id },
        dayOfWeek: currentConfig.dayOfWeek,
        active: true,
        OR: [
          { startTime: { lt: newEndTime }, endTime: { gt: newStartTime } }
        ]
      }
    });
    
    if (overlapping) {
      return res.status(400).json({ message: 'Ce créneau chevauche un autre créneau existant sur ce jour' });
    }
    
    const config = await prisma.timeSlotConfig.update({ 
      where: { id }, 
      data: { 
        startTime: newStartTime, 
        endTime: newEndTime, 
        ...(capacity !== undefined && { capacity }), 
        ...(intervalMinutes !== undefined && { intervalMinutes }), 
        ...(active !== undefined && { active }),
        ...(req.body.type && { type: req.body.type }),
        ...(req.body.userId !== undefined && { userId: req.body.userId })
      } 
    });
    
    const io = getIo();
    if (io) io.to('admin_room').emit('time_slots_changed', { action: 'update', data: config });
    
    res.json({ message: 'Créneau modifié', config });
  } catch (error) {
    console.error('Update time slot config error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

router.delete('/time-slots/config/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.timeSlotConfig.delete({ where: { id } });
    
    const io = getIo();
    if (io) io.to('admin_room').emit('time_slots_changed', { action: 'delete', data: { id } });
    
    res.json({ message: 'Configuration supprimée' });
  } catch (error) {
    console.error('Delete time slot config error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ==================== CRÉNEAUX BLOQUÉS ====================
router.get('/time-slots/blocked', verifyAdminOnly, async (req, res) => {
  try {
    const blockedSlots = await prisma.blockedSlot.findMany({ where: { active: true }, orderBy: { date: 'asc' } });
    res.json(blockedSlots);
  } catch (error) {
    console.error('Get blocked slots error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

router.post('/time-slots/blocked', verifyAdminOnly, async (req, res) => {
  try {
    const { date, startTime, endTime, reason } = req.body;
    if (!date || !reason) {
      return res.status(400).json({ message: 'Date et raison requis' });
    }
    
    const blockedSlot = await prisma.blockedSlot.create({ 
      data: { 
        date: new Date(date + 'T00:00:00.000Z'), 
        startTime: startTime || null, 
        endTime: endTime || null, 
        reason, 
        active: true 
      } 
    });
    
    res.status(201).json(blockedSlot);
  } catch (error) {
    console.error('Create blocked slot error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Ce créneau est déjà bloqué' });
    }
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

router.delete('/time-slots/blocked/:id', verifyAdminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.blockedSlot.update({ where: { id }, data: { active: false } });
    res.json({ message: 'Créneau débloqué' });
  } catch (error) {
    console.error('Delete blocked slot error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ==================== CRÉNEAUX DISPONIBLES (PUBLIC) ====================
router.get('/time-slots/available', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'Date requise' });
    
    const targetDateStart = new Date(date + 'T00:00:00.000Z');
    const targetDateEnd = new Date(date + 'T23:59:59.999Z');
    const dayOfWeek = targetDateStart.getUTCDay();
    
    const configs = await prisma.timeSlotConfig.findMany({ 
      where: { dayOfWeek, active: true }, 
      orderBy: { startTime: 'asc' } 
    });
    
    const blockedSlots = await prisma.blockedSlot.findMany({ where: { active: true } });
    
    const existingOrders = await prisma.order.findMany({ 
      where: { 
        timeSlotDate: { gte: targetDateStart, lte: targetDateEnd }, 
        timeSlotStart: { not: null }, 
        status: { notIn: ['CANCELLED', 'COMPLETED'] } 
      }, 
      select: { timeSlotStart: true } 
    });
    
    const reservationsCount = {};
    existingOrders.forEach(o => {
      reservationsCount[o.timeSlotStart] = (reservationsCount[o.timeSlotStart] || 0) + 1;
    });
    
    const now = new Date();
    const moroccoTimeStr = now.toLocaleString('en-US', { timeZone: 'Africa/Casablanca' });
    const nowMorocco = new Date(moroccoTimeStr);
    const todayMorocco = nowMorocco.toISOString().slice(0, 10);
    const isToday = date === todayMorocco;
    const currentMoroccoMinutes = isToday ? nowMorocco.getUTCHours() * 60 + nowMorocco.getUTCMinutes() : 0;
    const nowMoroccoMinutes = isToday ? Math.ceil(currentMoroccoMinutes / 30) * 30 : 0;
    
    const toMinutes = (hhmm) => {
      const [h, m] = hhmm.split(':').map(Number);
      return h * 60 + m;
    };
    
    const toHHMM = (mins) => {
      return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
    };
    
    const availableSlots = [];
    for (const config of configs) {
      const startMin = toMinutes(config.startTime);
      const endMin = toMinutes(config.endTime);
      const step = config.intervalMinutes;
      
      for (let cur = startMin; cur < endMin; cur += step) {
        const timeStr = toHHMM(cur);
        const endStr = toHHMM(cur + step);
        
        if (isToday && cur < nowMoroccoMinutes) continue;
        
        const isBlocked = blockedSlots.some(b => { 
          const bDate = b.date.toISOString().slice(0, 10); 
          if (bDate !== date || !b.startTime) return false; 
          const bStart = toMinutes(b.startTime); 
          const bEnd = b.endTime ? toMinutes(b.endTime) : 24 * 60; 
          return cur >= bStart && cur < bEnd; 
        });
        
        if (isBlocked) continue;
        
        const reservations = reservationsCount[timeStr] || 0;
        availableSlots.push({ 
          time: timeStr, 
          endTime: endStr, 
          capacity: config.capacity, 
          reservations, 
          available: reservations < config.capacity 
        });
      }
    }
    
    res.json(availableSlots);
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

router.get('/time-slots/calendar', verifyAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    const orders = await prisma.order.findMany({ 
      where: { 
        timeSlotDate: { gte: start, lte: end }, 
        timeSlotStart: { not: null } 
      }, 
      select: { 
        id: true, 
        orderNumber: true, 
        timeSlotDate: true, 
        timeSlotStart: true, 
        timeSlotEnd: true, 
        total: true, 
        status: true, 
        user: { 
          select: { 
            id: true, 
            firstName: true, 
            lastName: true, 
            email: true, 
            phone: true 
          } 
        } 
      }, 
      orderBy: [{ timeSlotDate: 'asc' }, { timeSlotStart: 'asc' }] 
    });
    
    const calendarData = {};
    orders.forEach(order => { 
      const dateKey = order.timeSlotDate.toISOString().split('T')[0]; 
      if (!calendarData[dateKey]) calendarData[dateKey] = []; 
      calendarData[dateKey].push(order); 
    });
    
    res.json(calendarData);
  } catch (error) {
    console.error('Get calendar error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

router.get('/time-slots/today-reservations', verifyAdminOnly, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const orders = await prisma.order.findMany({ 
      where: { 
        timeSlotDate: today, 
        timeSlotStart: { not: null }, 
        status: { in: ['RECEIVED', 'PREPARING', 'READY'] } 
      }, 
      select: { 
        id: true, 
        orderNumber: true, 
        timeSlotStart: true, 
        timeSlotEnd: true, 
        total: true, 
        status: true, 
        createdAt: true, 
        user: { 
          select: { 
            firstName: true, 
            lastName: true, 
            email: true, 
            phone: true 
          } 
        }, 
        items: { 
          select: { 
            quantity: true, 
            price: true, 
            product: { 
              select: { name: true } 
            } 
          } 
        } 
      }, 
      orderBy: { timeSlotStart: 'asc' } 
    });
    
    res.json(orders);
  } catch (error) {
    console.error('Get today reservations error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ==================== UTILISATEURS ====================
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ];
    }
    
    if (role && role !== 'ALL') where.role = role;
    if (status && status !== 'ALL') where.isActive = status === 'ACTIVE';
    
    const orderByClause = sortBy === 'orderCount' 
      ? { orders: { _count: sortOrder } } 
      : { [sortBy]: sortOrder };
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({ 
        where, 
        select: { 
          id: true, 
          email: true, 
          firstName: true, 
          lastName: true, 
          phone: true, 
          role: true, 
          isActive: true, 
          createdAt: true, 
          updatedAt: true, 
          _count: { select: { orders: true } } 
        }, 
        orderBy: orderByClause, 
        skip, 
        take: parseInt(limit) 
      }),
      prisma.user.count({ where })
    ]);
    
    res.json({ 
      users, 
      pagination: { 
        page: parseInt(page), 
        limit: parseInt(limit), 
        total, 
        totalPages: Math.ceil(total / parseInt(limit)) 
      } 
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

router.get('/users/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({ 
      where: { id }, 
      select: { 
        id: true, 
        email: true, 
        firstName: true, 
        lastName: true, 
        phone: true, 
        address: true, 
        profileImage: true, 
        notificationEmail: true, 
        notificationSMS: true, 
        notificationPush: true, 
        role: true, 
        isActive: true, 
        cart: true, 
        createdAt: true, 
        updatedAt: true, 
        _count: { select: { orders: true, favorites: true } }, 
        orders: { 
          select: { 
            id: true, 
            orderNumber: true, 
            status: true, 
            total: true, 
            timeSlotDate: true, 
            timeSlotStart: true, 
            createdAt: true, 
            items: { 
              select: { 
                quantity: true, 
                price: true, 
                product: { select: { name: true } } 
              } 
            } 
          }, 
          orderBy: { createdAt: 'desc' }, 
          take: 10 
        } 
      } 
    });
    
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

router.put('/users/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, address, role, isActive, notificationEmail, notificationSMS, notificationPush } = req.body;
    
    const oldUser = await prisma.user.findUnique({ 
      where: { id }, 
      select: { 
        firstName: true, 
        lastName: true, 
        phone: true, 
        address: true, 
        role: true, 
        isActive: true, 
        notificationEmail: true, 
        notificationSMS: true, 
        notificationPush: true 
      } 
    });
    
    if (!oldUser) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    
    const updatedUser = await prisma.user.update({ 
      where: { id }, 
      data: { 
        ...(firstName !== undefined && { firstName }), 
        ...(lastName !== undefined && { lastName }), 
        ...(phone !== undefined && { phone }), 
        ...(address !== undefined && { address }), 
        ...(role !== undefined && { role }), 
        ...(isActive !== undefined && { isActive }), 
        ...(notificationEmail !== undefined && { notificationEmail }), 
        ...(notificationSMS !== undefined && { notificationSMS }), 
        ...(notificationPush !== undefined && { notificationPush }) 
      }, 
      select: { 
        id: true, 
        email: true, 
        firstName: true, 
        lastName: true, 
        phone: true, 
        role: true, 
        isActive: true, 
        updatedAt: true 
      } 
    });
    
    await prisma.auditLog.create({ 
      data: { 
        userId: req.userId, 
        action: 'UPDATE', 
        entityType: 'User', 
        entityId: id, 
        oldValues: oldUser, 
        newValues: { firstName, lastName, phone, address, role, isActive, notificationEmail, notificationSMS, notificationPush }, 
        ipAddress: req.ip, 
        userAgent: req.get('User-Agent'), 
        description: `Modification de l'utilisateur ${updatedUser.email}` 
      } 
    });
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

router.put('/users/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'Le statut doit être un booléen' });
    }
    
    const oldUser = await prisma.user.findUnique({ 
      where: { id }, 
      select: { isActive: true, email: true } 
    });
    
    if (!oldUser) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    
    const updatedUser = await prisma.user.update({ 
      where: { id }, 
      data: { isActive }, 
      select: { id: true, email: true, isActive: true, updatedAt: true } 
    });
    
    await prisma.auditLog.create({ 
      data: { 
        userId: req.userId, 
        action: isActive ? 'ACTIVATE' : 'DEACTIVATE', 
        entityType: 'User', 
        entityId: id, 
        oldValues: { isActive: oldUser.isActive }, 
        newValues: { isActive }, 
        ipAddress: req.ip, 
        userAgent: req.get('User-Agent'), 
        description: `${isActive ? 'Activation' : 'Désactivation'} du compte ${oldUser.email}` 
      } 
    });
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

router.delete('/users/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ 
      where: { id }, 
      select: { role: true, email: true } 
    });
    
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    
    if (user.role === 'ADMIN') {
      const adminCount = await prisma.user.count({ 
        where: { role: 'ADMIN', isActive: true, id: { not: id } } 
      });
      if (adminCount === 0) {
        return res.status(400).json({ message: 'Impossible de supprimer le dernier administrateur' });
      }
    }
    
    await prisma.user.update({ where: { id }, data: { isActive: false } });
    
    await prisma.auditLog.create({ 
      data: { 
        userId: req.userId, 
        action: 'DELETE', 
        entityType: 'User', 
        entityId: id, 
        oldValues: { isActive: true }, 
        newValues: { isActive: false }, 
        ipAddress: req.ip, 
        userAgent: req.get('User-Agent'), 
        description: `Suppression (désactivation) du compte ${user.email}` 
      } 
    });
    
    res.json({ message: 'Utilisateur désactivé' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ==================== EMPLOYÉS ====================
router.post('/employees', verifyAdmin, async (req, res) => {
  try {
    const { firstName, lastName, email, password, salary } = req.body;
    
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const employee = await prisma.user.create({ 
      data: { 
        firstName, 
        lastName, 
        email, 
        phone: '', 
        address: '', 
        password: hashedPassword, 
        role: 'EMPLOYE', 
        isActive: true, 
        ...(salary && { salary: parseFloat(salary) }) 
      }, 
      select: { 
        id: true, 
        firstName: true, 
        lastName: true, 
        email: true, 
        role: true, 
        salary: true, 
        isActive: true, 
        createdAt: true 
      } 
    });
    
    await prisma.auditLog.create({ 
      data: { 
        userId: req.userId, 
        action: 'CREATE', 
        entityType: 'User', 
        entityId: employee.id, 
        newValues: { role: 'EMPLOYE', email: employee.email }, 
        ipAddress: req.ip, 
        userAgent: req.get('User-Agent'), 
        description: `Création du compte employé: ${employee.email}` 
      } 
    });
    
    res.status(201).json({ message: 'Employé créé avec succès', employee });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

router.get('/employees', verifyAdmin, async (req, res) => {
  try {
    const employees = await prisma.user.findMany({ 
      where: { role: 'EMPLOYE' }, 
      select: { 
        id: true, 
        firstName: true, 
        lastName: true, 
        email: true, 
        salary: true, 
        isActive: true, 
        createdAt: true, 
        updatedAt: true 
      }, 
      orderBy: { createdAt: 'desc' } 
    });
    
    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

router.put('/employees/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, salary, isActive } = req.body;
    
    const employee = await prisma.user.findUnique({ 
      where: { id }, 
      select: { role: true, email: true } 
    });
    
    if (!employee || employee.role !== 'EMPLOYE') {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }
    
    const updatedEmployee = await prisma.user.update({ 
      where: { id }, 
      data: { 
        ...(firstName && { firstName }), 
        ...(lastName && { lastName }), 
        ...(salary !== undefined && { salary: salary ? parseFloat(salary) : null }), 
        ...(isActive !== undefined && { isActive }) 
      }, 
      select: { 
        id: true, 
        firstName: true, 
        lastName: true, 
        email: true, 
        salary: true, 
        isActive: true, 
        updatedAt: true 
      } 
    });
    
    await prisma.auditLog.create({ 
      data: { 
        userId: req.userId, 
        action: 'UPDATE', 
        entityType: 'User', 
        entityId: id, 
        newValues: { role: 'EMPLOYE', salary, isActive }, 
        ipAddress: req.ip, 
        userAgent: req.get('User-Agent'), 
        description: `Mise à jour du compte employé: ${employee.email}` 
      } 
    });
    
    res.json({ message: 'Employé mis à jour', employee: updatedEmployee });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

router.delete('/employees/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = await prisma.user.findUnique({ 
      where: { id }, 
      select: { role: true, email: true } 
    });
    
    if (!employee || employee.role !== 'EMPLOYE') {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }
    
    await prisma.user.update({ where: { id }, data: { isActive: false } });
    
    await prisma.auditLog.create({ 
      data: { 
        userId: req.userId, 
        action: 'DELETE', 
        entityType: 'User', 
        entityId: id, 
        oldValues: { isActive: true }, 
        newValues: { isActive: false }, 
        ipAddress: req.ip, 
        userAgent: req.get('User-Agent'), 
        description: `Désactivation du compte employé: ${employee.email}` 
      } 
    });
    
    res.json({ message: 'Employé désactivé' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});


// ==================== AUDIT LOGS ====================
router.get('/audit-logs', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, userId, action, entityType, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({ 
        where, 
        include: { 
          user: { 
            select: { id: true, email: true, firstName: true, lastName: true } 
          } 
        }, 
        orderBy: { createdAt: 'desc' }, 
        skip, 
        take: parseInt(limit) 
      }),
      prisma.auditLog.count({ where })
    ]);
    
    res.json({ 
      logs, 
      pagination: { 
        page: parseInt(page), 
        limit: parseInt(limit), 
        total, 
        totalPages: Math.ceil(total / parseInt(limit)) 
      } 
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

router.get('/audit-logs/stats', verifyAdmin, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const actionStats = await prisma.auditLog.groupBy({ 
      by: ['action'], 
      where: { createdAt: { gte: startDate } }, 
      _count: { action: true }, 
      orderBy: { _count: { action: 'desc' } } 
    });
    
    const entityStats = await prisma.auditLog.groupBy({ 
      by: ['entityType'], 
      where: { createdAt: { gte: startDate } }, 
      _count: { entityType: true }, 
      orderBy: { _count: { entityType: 'desc' } } 
    });
    
    const userStats = await prisma.auditLog.groupBy({ 
      by: ['userId'], 
      where: { createdAt: { gte: startDate } }, 
      _count: { userId: true }, 
      include: { 
        user: { select: { email: true, firstName: true, lastName: true } } 
      }, 
      orderBy: { _count: { userId: 'desc' } }, 
      take: 10 
    });
    
    res.json({ actionStats, entityStats, userStats, period: { days: parseInt(days), startDate } });
  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

export default router;