// frontend/src/context/AdminWebSocketContext.jsx
import { createContext, useContext, useEffect, useState, useRef } from 'react';

const AdminWebSocketContext = createContext();

export const useAdminWebSocket = () => {
  const context = useContext(AdminWebSocketContext);
  if (!context) {
    throw new Error('useAdminWebSocket must be used within AdminWebSocketProvider');
  }
  return context;
};

export const AdminWebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState({
    newOrders: 0,
    pendingOrders: 0,
    lowStock: 0
  });
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    
    console.log('🔍 AdminWebSocket - Vérification token:', {
      hasToken: !!adminToken,
      hasUser: !!adminUser,
      tokenPreview: adminToken ? adminToken.substring(0, 50) + '...' : 'aucun'
    });
    
    if (!adminToken || !adminUser) {
      console.log('❌ AdminWebSocket - Pas de token admin, WebSocket désactivé');
      return;
    }

    const connectWebSocket = () => {
      try {
        // Connexion WebSocket SANS token dans l'URL
        const socketUrl = 'ws://localhost:5000';
        console.log('🔌 AdminWebSocket - Connexion à:', socketUrl);
        const socket = new WebSocket(socketUrl);
        
        socket.onopen = () => {
          console.log('✅ AdminWebSocket - Connexion WebSocket établie');
          
          // Envoyer le token après connexion
          const authMessage = {
            type: 'admin_authenticate',
            token: adminToken
          };
          console.log('📤 AdminWebSocket - Envoi authentification:', authMessage.type);
          socket.send(JSON.stringify(authMessage));
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📥 AdminWebSocket - Message reçu:', data.type);
            
            // Gérer la réponse d'authentification
            if (data.type === 'admin_authenticated') {
              if (data.success) {
                console.log('✅ AdminWebSocket - Authentifié avec succès');
                setIsConnected(true);
                reconnectAttempts.current = 0;
              } else {
                console.error('❌ AdminWebSocket - Échec authentification:', data.error);
                setIsConnected(false);
              }
              return;
            }
            
            switch (data.type) {
              case 'admin_new_order':
                console.log('📦 Nouvelle commande reçue:', data.orderNumber);
                setStats(prev => ({
                  ...prev,
                  newOrders: (prev.newOrders || 0) + 1,
                  pendingOrders: (prev.pendingOrders || 0) + 1
                }));
                addNotification({
                  title: 'Nouvelle commande',
                  message: `Commande ${data.orderNumber} reçue`,
                  type: 'order',
                  data: data
                });
                break;
                
              case 'admin_order_status_changed':
                console.log('🔄 Statut commande changé:', data.orderNumber, '->', data.status);
                addNotification({
                  title: 'Statut commande modifié',
                  message: `Commande ${data.orderNumber} : ${data.status}`,
                  type: 'status',
                  data: data
                });
                break;
                
              case 'admin_low_stock_alert':
                console.log('⚠️ Alerte stock faible:', data.count);
                setStats(prev => ({
                  ...prev,
                  lowStock: data.count
                }));
                addNotification({
                  title: 'Alerte stock',
                  message: `${data.count} produit(s) en stock faible`,
                  type: 'alert',
                  data: data
                });
                break;
                
              default:
                console.log('📨 Message non traité:', data.type);
            }
          } catch (error) {
            console.error('❌ AdminWebSocket - Erreur parsing message:', error);
          }
        };

        socket.onclose = (event) => {
          console.log('❌ AdminWebSocket - Déconnecté, code:', event.code, 'raison:', event.reason);
          setIsConnected(false);
          
          if (reconnectAttempts.current < maxReconnectAttempts) {
            reconnectAttempts.current++;
            console.log(`🔄 AdminWebSocket - Reconnexion ${reconnectAttempts.current}/${maxReconnectAttempts} dans 3s...`);
            setTimeout(connectWebSocket, 3000);
          } else {
            console.log('❌ AdminWebSocket - Maximum de reconnexions atteint');
          }
        };

        socket.onerror = (error) => {
          console.error('❌ AdminWebSocket - Erreur WebSocket:', error);
        };

        socketRef.current = socket;
      } catch (error) {
        console.error('❌ AdminWebSocket - Erreur création WebSocket:', error);
        setIsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) {
        console.log('🔌 AdminWebSocket - Fermeture de la connexion');
        socketRef.current.close();
      }
    };
  }, []);

  const addNotification = (notification) => {
    setNotifications(prev => [
      {
        ...notification,
        id: Date.now(),
        timestamp: new Date()
      },
      ...prev
    ].slice(0, 50));
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = {
    isConnected,
    stats,
    notifications,
    addNotification,
    removeNotification,
    clearNotifications
  };

  return (
    <AdminWebSocketContext.Provider value={value}>
      {children}
    </AdminWebSocketContext.Provider>
  );
};