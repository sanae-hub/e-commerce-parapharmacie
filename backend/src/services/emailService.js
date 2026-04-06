/**
 * Service d'envoi d'emails avec Nodemailer
 * Gère toutes les notifications par email pour les commandes et les utilisateurs
 */

import nodemailer from 'nodemailer';

// Configuration du transporteur Nodemailer
let transporter = null;

/**
 * Initialise le transporteur Nodemailer
 * Doit être appelé au démarrage de l'application
 */
export function initializeTransporter() {
  const { EMAIL_USER, EMAIL_PASSWORD, SMTP_HOST, SMTP_PORT, SMTP_SECURE } = process.env;

  if (SMTP_HOST && SMTP_PORT) {
    // Configuration SMTP personnalisée
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT),
      secure: SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
    });
  } else if (EMAIL_USER && EMAIL_PASSWORD) {
    // Configuration Gmail par défaut
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
    });
  }

  return transporter;
}

/**
 * Vérifie si le transporteur est configuré
 */
export function isEmailConfigured() {
  return transporter !== null;
}

/**
 * Récupère le transporteur (pour les tests ou usage direct)
 */
export function getTransporter() {
  return transporter;
}

// Templates d'emails
const emailTemplates = {
  /**
   * Template pour la confirmation de commande
   */
  orderConfirmation: (user, order) => `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .order-info h3 { color: #667eea; margin-top: 0; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-weight: 600; color: #555; }
        .info-value { color: #333; }
        .total { font-size: 18px; font-weight: bold; color: #667eea; }
        .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
        .badge { display: inline-block; background: #667eea; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
        .items-list { margin: 15px 0; }
        .item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .item-name { flex: 1; }
        .item-qty { color: #888; margin: 0 10px; }
        .item-price { font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎉 Commande confirmée !</h1>
        <p>Votre commande a été enregistrée avec succès</p>
      </div>
      <div class="content">
        <p>Bonjour ${user.firstName},</p>
        <p>Nous vous remercions pour votre commande. Voici le récapitulatif :</p>
        
        <div class="order-info">
          <h3>📋 Détails de la commande</h3>
          <div class="info-row">
            <span class="info-label">Numéro de commande</span>
            <span class="info-value"><span class="badge">${order.orderNumber}</span></span>
          </div>
          <div class="info-row">
            <span class="info-label">Date</span>
            <span class="info-value">${new Date(order.createdAt).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          ${order.type === 'CLICK_COLLECT' ? `
          <div class="info-row">
            <span class="info-label">Type</span>
            <span class="info-value">Click & Collect</span>
          </div>
          ${order.timeSlotDate ? `
          <div class="info-row">
            <span class="info-label">Créneau de retrait</span>
            <span class="info-value">${new Date(order.timeSlotDate).toLocaleDateString('fr-FR')} de ${order.timeSlotStart} à ${order.timeSlotEnd}</span>
          </div>
          ` : ''}
          ` : `
          <div class="info-row">
            <span class="info-label">Type</span>
            <span class="info-value">Livraison</span>
          </div>
          ${order.deliveryAddress ? `
          <div class="info-row">
            <span class="info-label">Adresse de livraison</span>
            <span class="info-value">${order.deliveryAddress}</span>
          </div>
          ` : ''}
          `}
          <div class="info-row">
            <span class="info-label">Statut</span>
            <span class="info-value"><span class="badge">${getStatusText(order.status)}</span></span>
          </div>
          <div class="info-row">
            <span class="info-label">Total</span>
            <span class="total">${order.total.toFixed(2)} DA</span>
          </div>
        </div>

        ${order.items && order.items.length > 0 ? `
        <div class="order-info">
          <h3>📦 Articles commandés</h3>
          <div class="items-list">
            ${order.items.map(item => `
              <div class="item">
                <span class="item-name">${item.product?.name || 'Produit'}</span>
                <span class="item-qty">x${item.quantity}</span>
                <span class="item-price">${(item.price * item.quantity).toFixed(2)} DA</span>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <div class="order-info">
          <h3>ℹ️ Informations importantes</h3>
          ${order.type === 'CLICK_COLLECT' ? `
          <p>📍 <strong>Lieu de retrait :</strong> Pharmacie ParaClick, 123 Avenue de la République, Alger</p>
          <p>⏰ Veuillez vous présenter pendant votre créneau horaire</p>
          <p>💳 Paiement au comptoir lors du retrait</p>
          ` : `
          <p>📦 Votre commande sera livrée à l'adresse indiquée</p>
          <p>💳 Paiement à la livraison</p>
          `}
        </div>

        <p>Vous recevrez un email lorsque votre commande changera de statut.</p>
        <p>Cordialement,<br><strong>L'équipe ParaClick</strong></p>
      </div>
      <div class="footer">
        <p>ParaClick Pharmacie - Votre santé, notre priorité</p>
        <p>Pour toute question, contactez-nous à contact@paraclick.ma</p>
      </div>
    </body>
    </html>
  `,

  /**
   * Template pour les changements de statut
   */
  orderStatusUpdate: (user, order, status) => {
    const statusInfo = getStatusInfo(status);
    return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${statusInfo.color}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .status-badge { display: inline-block; background: ${statusInfo.color}; color: white; padding: 8px 20px; border-radius: 25px; font-size: 16px; font-weight: bold; margin: 10px 0; }
        .order-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-weight: 600; color: #555; }
        .info-value { color: #333; }
        .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
        .progress { display: flex; justify-content: space-between; margin: 20px 0; position: relative; }
        .progress::before { content: ''; position: absolute; top: 15px; left: 0; right: 0; height: 3px; background: #e0e0e0; z-index: 0; }
        .progress-step { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; }
        .step-circle { width: 30px; height: 30px; border-radius: 50%; background: #e0e0e0; display: flex; align-items: center; justify-content: center; font-size: 14px; color: white; }
        .step-circle.active { background: ${statusInfo.color}; }
        .step-circle.completed { background: #4CAF50; }
        .step-label { font-size: 11px; margin-top: 5px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${statusInfo.icon} ${statusInfo.title}</h1>
      </div>
      <div class="content">
        <p>Bonjour ${user.firstName},</p>
        <p>Le statut de votre commande a été mis à jour :</p>
        
        <div style="text-align: center;">
          <span class="status-badge">${statusInfo.text}</span>
        </div>

        <div class="progress">
          <div class="progress-step">
            <div class="step-circle ${['RECEIVED','PREPARING','READY','COMPLETED','CANCELLED'].includes('RECEIVED') ? 'completed' : ''}">✓</div>
            <span class="step-label">Reçue</span>
          </div>
          <div class="progress-step">
            <div class="step-circle ${['PREPARING','READY','COMPLETED'].includes(status) ? 'completed' : status === 'PREPARING' ? 'active' : ''}">✓</div>
            <span class="step-label">En préparation</span>
          </div>
          <div class="progress-step">
            <div class="step-circle ${['READY','COMPLETED'].includes(status) ? 'completed' : status === 'READY' ? 'active' : ''}">✓</div>
            <span class="step-label">Prête</span>
          </div>
          <div class="progress-step">
            <div class="step-circle ${status === 'COMPLETED' ? 'completed' : ''}">✓</div>
            <span class="step-label">Récupérée</span>
          </div>
        </div>

        <div class="order-info">
          <h3>📋 Détails de la commande</h3>
          <div class="info-row">
            <span class="info-label">Numéro de commande</span>
            <span class="info-value">${order.orderNumber}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Montant</span>
            <span class="info-value"><strong>${order.total.toFixed(2)} DA</strong></span>
          </div>
          ${order.timeSlotDate ? `
          <div class="info-row">
            <span class="info-label">Créneau de retrait</span>
            <span class="info-value">${new Date(order.timeSlotDate).toLocaleDateString('fr-FR')} de ${order.timeSlotStart} à ${order.timeSlotEnd}</span>
          </div>
          ` : ''}
        </div>

        ${status === 'READY' ? `
        <div class="order-info" style="background: #e8f5e9; border-left: 4px solid #4CAF50;">
          <h3>🎉 Votre commande est prête !</h3>
          <p>Vous pouvez maintenant passer en pharmacie pour récupérer votre commande.</p>
          <p>📍 <strong>Adresse :</strong> Pharmacie ParaClick, 123 Avenue de la République, Alger</p>
          <p>⏰ <strong>Horaires :</strong> Dimanche - Jeudi, 8h00 - 20h00</p>
          <p>N'oubliez pas votre pièce d'identité et votre numéro de commande.</p>
        </div>
        ` : ''}

        ${status === 'CANCELLED' ? `
        <div class="order-info" style="background: #ffebee; border-left: 4px solid #f44336;">
          <h3>❌ Commande annulée</h3>
          <p>Votre commande a été annulée. Si vous avez déjà effectué un paiement, le remboursement sera traité sous 3-5 jours ouvrables.</p>
        </div>
        ` : ''}

        <p>Pour toute question, n'hésitez pas à nous contacter.</p>
        <p>Cordialement,<br><strong>L'équipe ParaClick</strong></p>
      </div>
      <div class="footer">
        <p>ParaClick Pharmacie - Votre santé, notre priorité</p>
        <p>Pour toute question, contactez-nous à contact@paraclick.ma</p>
      </div>
    </body>
    </html>
  `},

  /**
   * Template pour la bienvenue
   */
  welcome: (user) => `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: #f9f9f9; padding: 40px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>👋 Bienvenue chez ParaClick !</h1>
      </div>
      <div class="content">
        <p>Bonjour ${user.firstName},</p>
        <p>Nous sommes ravis de vous accueillir sur notre plateforme de pharmacie en ligne.</p>
        <p>Vous pouvez dès à présent :</p>
        <ul>
          <li>🛒 Commander vos produits de parapharmacie</li>
          <li>⏰ Réserver un créneau Click & Collect</li>
          <li>📦 Suivre vos commandes en temps réel</li>
          <li>🎉 Bénéficier de nos offres exclusives</li>
        </ul>
        <div style="text-align: center;">
          <a href="http://localhost:3000/products" class="button">Commencer mes achats</a>
        </div>
        <p>À très bientôt !</p>
        <p><strong>L'équipe ParaClick</strong></p>
      </div>
      <div class="footer">
        <p>ParaClick Pharmacie - Votre santé, notre priorité</p>
      </div>
    </body>
    </html>
  `,

  /**
   * Template pour la réinitialisation de mot de passe
   */
  passwordReset: (user, resetLink) => `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ff9800; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #ff9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
        .warning { background: #fff3e0; padding: 15px; border-radius: 8px; border-left: 4px solid #ff9800; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🔐 Réinitialisation de mot de passe</h1>
      </div>
      <div class="content">
        <p>Bonjour ${user.firstName},</p>
        <p>Nous avons reçu une demande de réinitialisation de votre mot de passe.</p>
        <div style="text-align: center;">
          <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
        </div>
        <div class="warning">
          <strong>⚠️ Important :</strong>
          <ul>
            <li>Ce lien expire dans 15 minutes</li>
            <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
            <li>Votre mot de passe actuel restera inchangé</li>
          </ul>
        </div>
        <p>Cordialement,<br><strong>L'équipe ParaClick</strong></p>
      </div>
      <div class="footer">
        <p>ParaClick Pharmacie - Votre santé, notre priorité</p>
      </div>
    </body>
    </html>
  `
};

/**
 * Informations sur les statuts de commande
 */
function getStatusInfo(status) {
  const statusMap = {
    RECEIVED: {
      text: 'Commande reçue',
      title: 'Nous avons reçu votre commande',
      icon: '✅',
      color: '#2196F3'
    },
    PREPARING: {
      text: 'En préparation',
      title: 'Votre commande est en préparation',
      icon: '⏳',
      color: '#FF9800'
    },
    READY: {
      text: 'Prête à être retirée',
      title: 'Votre commande est prête !',
      icon: '🎉',
      color: '#4CAF50'
    },
    COMPLETED: {
      text: 'Commande récupérée',
      title: 'Merci pour votre visite !',
      icon: '✨',
      color: '#9C27B0'
    },
    CANCELLED: {
      text: 'Commande annulée',
      title: 'Votre commande a été annulée',
      icon: '❌',
      color: '#f44336'
    },
    REFUNDED: {
      text: 'Remboursée',
      title: 'Votre commande a été remboursée',
      icon: '💰',
      color: '#607D8B'
    }
  };
  return statusMap[status] || statusMap.RECEIVED;
}

function getStatusText(status) {
  const statusMap = {
    RECEIVED: 'Reçue',
    PREPARING: 'En préparation',
    READY: 'Prête',
    COMPLETED: 'Récupérée',
    CANCELLED: 'Annulée',
    REFUNDED: 'Remboursée'
  };
  return statusMap[status] || status;
}

/**
 * Envoie un email
 * @param {Object} options - Options d'envoi
 * @param {string} options.to - Email du destinataire
 * @param {string} options.subject - Sujet de l'email
 * @param {string} options.html - Contenu HTML de l'email
 * @param {string} options.text - Version texte (optionnelle)
 */
export async function sendEmail({ to, subject, html, text }) {
  if (!transporter) {
    console.warn('Transporteur email non configuré. Email non envoyé.');
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: `"ParaClick Pharmacie" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || subject, // Fallback to subject if no text version
    });

    console.log(`Email envoyé à ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return false;
  }
}

/**
 * Envoie une notification de statut de commande
 */
export async function sendOrderStatusNotification(user, order, status) {
  if (!user.notificationEmail) {
    console.log(`L'utilisateur ${user.email} a désactivé les notifications email`);
    return false;
  }

  const statusInfo = getStatusInfo(status);
  const html = emailTemplates.orderStatusUpdate(user, order, status);

  return sendEmail({
    to: user.email,
    subject: `${statusInfo.icon} ${statusInfo.subject || statusInfo.text} - Commande ${order.orderNumber}`,
    html,
  });
}

/**
 * Envoie une confirmation de commande
 */
export async function sendOrderConfirmation(user, order) {
  if (!user.notificationEmail) {
    console.log(`L'utilisateur ${user.email} a désactivé les notifications email`);
    return false;
  }

  const html = emailTemplates.orderConfirmation(user, order);

  return sendEmail({
    to: user.email,
    subject: `🎉 Confirmation de commande - ${order.orderNumber}`,
    html,
  });
}

/**
 * Envoie un email de bienvenue
 */
export async function sendWelcomeEmail(user) {
  if (!user.notificationEmail) {
    return false;
  }

  const html = emailTemplates.welcome(user);

  return sendEmail({
    to: user.email,
    subject: '👋 Bienvenue chez ParaClick !',
    html,
  });
}

/**
 * Envoie un email de réinitialisation de mot de passe
 */
export async function sendPasswordResetEmail(user, resetLink) {
  const html = emailTemplates.passwordReset(user, resetLink);

  return sendEmail({
    to: user.email,
    subject: '🔐 Réinitialisation de votre mot de passe ParaClick',
    html,
  });
}

/**
 * Envoie un email de rappel de créneau (2h avant)
 */
export async function sendSlotReminder(user, order) {
  if (!user.notificationEmail) {
    return false;
  }

  const slotDate = new Date(order.timeSlotDate);
  const formattedDate = slotDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #FF9800; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .highlight { background: #FFF3E0; padding: 15px; border-radius: 8px; border-left: 4px solid #FF9800; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>⏰ Rappel de retrait</h1>
      </div>
      <div class="content">
        <p>Bonjour ${user.firstName},</p>
        <div class="highlight">
          <p><strong>Rappel :</strong> Votre commande sera prête dans environ 2 heures.</p>
        </div>
        <div class="info-box">
          <h3>📋 Détails du retrait</h3>
          <p><strong>Commande :</strong> ${order.orderNumber}</p>
          <p><strong>Date :</strong> ${formattedDate}</p>
          <p><strong>Créneau :</strong> ${order.timeSlotStart} - ${order.timeSlotEnd}</p>
          <p><strong>Lieu :</strong> Pharmacie ParaClick, 123 Avenue de la République, Alger</p>
        </div>
        <p>Pensez à apporter :</p>
        <ul>
          <li>Votre pièce d'identité</li>
          <li>Votre numéro de commande</li>
          <li>Le moyen de paiement</li>
        </ul>
        <p>À bientôt !</p>
        <p><strong>L'équipe ParaClick</strong></p>
      </div>
      <div class="footer">
        <p>ParaClick Pharmacie - Votre santé, notre priorité</p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: `⏰ Rappel : Votre commande ${order.orderNumber} dans 2 heures`,
    html,
  });
}

// Export des templates pour usage externe si nécessaire
export { emailTemplates };