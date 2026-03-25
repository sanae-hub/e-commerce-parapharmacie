// frontend/src/context/WebSocketContext.jsx
import { createContext, useContext, useEffect, useState, useRef } from 'react';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('Pas de token trouvé, WebSocket désactivé');
      return;
    }

    // Tentative de connexion WebSocket
    const connectWebSocket = () => {
      try {
        const socketUrl = 'ws://localhost:5000';
        const socket = new WebSocket(`${socketUrl}?token=${token}`);
        
        socket.onopen = () => {
          console.log('✅ WebSocket connecté');
          setIsConnected(true);
          
          // Authentifier
          socket.send(JSON.stringify({
            type: 'authenticate',
            token: token
          }));
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            switch (data.type) {
              case 'notification':
                addNotification({
                  title: data.title,
                  message: data.message,
                  type: data.type,
                  data: data
                });
                break;
                
              case 'order_status_changed':
                addNotification({
                  title: 'Statut de commande',
                  message: `Votre commande ${data.orderNumber} est maintenant ${data.status}`,
                  type: 'order',
                  data: data
                });
                break;
                
              default:
                break;
            }
          } catch (error) {
            console.error('Erreur parsing WebSocket message:', error);
          }
        };

        socket.onclose = () => {
          console.log('❌ WebSocket déconnecté');
          setIsConnected(false);
        };

        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        socketRef.current = socket;
      } catch (error) {
        console.error('Erreur de connexion WebSocket:', error);
        setIsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) {
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

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  const value = {
    isConnected,
    notifications,
    addNotification,
    removeNotification,
    requestNotificationPermission
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};