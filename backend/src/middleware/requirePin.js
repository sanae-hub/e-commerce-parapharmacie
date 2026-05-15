import { authenticateToken } from './auth.js';
import prisma from '../prismaClient.js';
import bcrypt from 'bcrypt';

// Middleware to require PIN for critical operations
// - If user role is ADMIN, bypass PIN requirement
// - Otherwise, expect pin in body.pin or header 'x-pin'
export const requirePin = async (req, res, next) => {
  try {
    // Ensure authenticated
    await new Promise((resolve, reject) => {
      try {
        authenticateToken(req, res, (err) => {
          if (err) return reject(err);
          resolve();
        });
      } catch (e) { resolve(); }
    });

    // If admin, skip PIN
    if (req.userRole === 'ADMIN') return next();

    const pin = req.body?.pin || req.headers['x-pin'];
    if (!pin) return res.status(400).json({ message: 'PIN requis pour cette opération' });

    const employeeId = req.userId;
    const employee = await prisma.employee.findUnique({ where: { id: employeeId }, select: { pin: true } });
    if (!employee || !employee.pin) return res.status(400).json({ message: 'Aucun PIN configuré pour cet employé' });

    const isValid = await bcrypt.compare(String(pin), employee.pin);
    if (!isValid) return res.status(401).json({ message: 'Code PIN incorrect' });

    // Enregistrer l'utilisation du PIN dans le journal d'audit
    await prisma.auditLog.create({
      data: {
        userId: employeeId,
        userType: 'EMPLOYEE',
        employeeId,
        action: 'PIN_VERIFY',
        entityType: req.body.entityType || 'CriticalOperation',
        entityId: req.params?.id || null,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        description: `Vérification du code PIN réussie pour l'utilisateur ${employeeId}`
      }
    });

    next();
  } catch (error) {
    console.error('requirePin error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
