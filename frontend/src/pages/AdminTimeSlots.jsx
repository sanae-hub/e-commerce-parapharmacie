import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, Calendar, Plus, Edit, Trash2, X, Check, AlertTriangle,
  Download, Eye, Settings, Ban
} from 'lucide-react';
import adminApi from '../api/adminAxios';

const AdminTimeSlots = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('config'); // config, blocked, calendar

  // Configuration des créneaux
  const [timeSlotConfigs, setTimeSlotConfigs] = useState([]);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [configForm, setConfigForm] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '18:00',
    capacity: 1,
    intervalMinutes: 30,
    active: true
  });

  // Créneaux bloqués
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [blockedForm, setBlockedForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    reason: ''
  });

  // Vue calendrier
  const [calendarData, setCalendarData] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Export PDF
  const [todayReservations, setTodayReservations] = useState([]);

  const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  useEffect(() => {
    checkAuth();
    fetchAllData();
  }, []);

  const checkAuth = () => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }
    adminApi.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchTimeSlotConfigs(),
        fetchBlockedSlots(),
        fetchCalendarData(),
        fetchTodayReservations()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 403 || error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSlotConfigs = async () => {
    const { data } = await adminApi.get('/time-slots/config');
    setTimeSlotConfigs(data);
  };

  const fetchBlockedSlots = async () => {
    const { data } = await adminApi.get('/time-slots/blocked');
    setBlockedSlots(data);
  };

  const fetchCalendarData = async () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 14);

    const { data } = await adminApi.get('/time-slots/calendar', {
      params: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      }
    });
    setCalendarData(data);
  };

  const fetchTodayReservations = async () => {
    const { data } = await adminApi.get('/time-slots/today-reservations');
    setTodayReservations(data);
  };

  const fetchAvailableSlots = async (date) => {
    const { data } = await adminApi.get('/time-slots/available', {
      params: { date }
    });
    setAvailableSlots(data);
  };

  // Gestion de la configuration
  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingConfig) {
        await adminApi.put(`/time-slots/config/${editingConfig.id}`, configForm);
      } else {
        await adminApi.post('/time-slots/config', configForm);
      }
      setShowConfigModal(false);
      setEditingConfig(null);
      resetConfigForm();
      fetchTimeSlotConfigs();
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleEditConfig = (config) => {
    setEditingConfig(config);
    setConfigForm({
      dayOfWeek: config.dayOfWeek,
      startTime: config.startTime,
      endTime: config.endTime,
      capacity: config.capacity,
      intervalMinutes: config.intervalMinutes,
      active: config.active
    });
    setShowConfigModal(true);
  };

  const handleDeleteConfig = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette configuration ?')) return;
    try {
      await adminApi.delete(`/time-slots/config/${id}`);
      fetchTimeSlotConfigs();
    } catch (error) {
      console.error('Error deleting config:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const resetConfigForm = () => {
    setConfigForm({
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '18:00',
      capacity: 1,
      intervalMinutes: 30,
      active: true
    });
  };

  // Gestion des créneaux bloqués
  const handleBlockedSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.post('/time-slots/blocked', blockedForm);
      setShowBlockedModal(false);
      resetBlockedForm();
      fetchBlockedSlots();
      fetchCalendarData();
    } catch (error) {
      console.error('Error blocking slot:', error);
      alert('Erreur lors du blocage');
    }
  };

  const handleUnblockSlot = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir débloquer ce créneau ?')) return;
    try {
      await adminApi.delete(`/time-slots/blocked/${id}`);
      fetchBlockedSlots();
      fetchCalendarData();
    } catch (error) {
      console.error('Error unblocking slot:', error);
      alert('Erreur lors du déblocage');
    }
  };

  const resetBlockedForm = () => {
    setBlockedForm({
      date: '',
      startTime: '',
      endTime: '',
      reason: ''
    });
  };

  // Export PDF
  const handleExportPDF = () => {
    // Créer un contenu HTML pour le PDF
    const htmlContent = `
      <html>
        <head>
          <title>Réservations du ${new Date().toLocaleDateString('fr-FR')}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .status { padding: 4px 8px; border-radius: 4px; }
            .status.RECEIVED { background-color: #fff3cd; color: #856404; }
            .status.PREPARING { background-color: #cce5ff; color: #004085; }
            .status.READY { background-color: #d4edda; color: #155724; }
          </style>
        </head>
        <body>
          <h1>Réservations Click & Collect - ${new Date().toLocaleDateString('fr-FR')}</h1>
          <table>
            <thead>
              <tr>
                <th>N° Commande</th>
                <th>Client</th>
                <th>Créneau</th>
                <th>Statut</th>
                <th>Montant</th>
                <th>Articles</th>
              </tr>
            </thead>
            <tbody>
              ${todayReservations.map(order => `
                <tr>
                  <td>${order.orderNumber}</td>
                  <td>${order.user.firstName} ${order.user.lastName}<br/>${order.user.email}</td>
                  <td>${order.timeSlotStart} - ${order.timeSlotEnd}</td>
                  <td><span class="status ${order.status}">${order.status}</span></td>
                  <td>${order.total.toFixed(2)} €</td>
                  <td>${order.items.map(item => `${item.quantity}x ${item.product.name}`).join('<br/>')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Ouvrir dans une nouvelle fenêtre pour impression
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Créneaux Click & Collect</h1>
              <p className="text-gray-600">Configuration et gestion des horaires de retrait</p>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'config', label: 'Configuration', icon: Settings },
              { id: 'blocked', label: 'Créneaux bloqués', icon: Ban },
              { id: 'calendar', label: 'Calendrier', icon: Calendar },
              { id: 'export', label: 'Export du jour', icon: Download }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-1 py-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Configuration Tab */}
        {activeTab === 'config' && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Configuration des horaires</h2>
              <button
                onClick={() => setShowConfigModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une configuration
              </button>
            </div>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jour</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horaires</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacité</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intervalle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {timeSlotConfigs.map((config) => (
                    <tr key={config.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {daysOfWeek[config.dayOfWeek]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {config.startTime} - {config.endTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {config.capacity} commande(s)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {config.intervalMinutes} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          config.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {config.active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditConfig(config)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteConfig(config.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Blocked Slots Tab */}
        {activeTab === 'blocked' && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Créneaux bloqués</h2>
              <button
                onClick={() => setShowBlockedModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <Ban className="w-4 h-4 mr-2" />
                Bloquer un créneau
              </button>
            </div>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horaires</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Raison</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {blockedSlots.map((slot) => (
                    <tr key={slot.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(slot.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {slot.startTime ? `${slot.startTime} - ${slot.endTime || '23:59'}` : 'Journée entière'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {slot.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleUnblockSlot(slot.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Débloquer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Calendrier des réservations</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sélecteur de date */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-md font-medium text-gray-900 mb-4">Sélectionner une date</h3>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Créneaux disponibles */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-md font-medium text-gray-900 mb-4">
                  Créneaux disponibles le {new Date(selectedDate).toLocaleDateString('fr-FR')}
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableSlots.map((slot, index) => (
                    <div key={index} className={`p-3 rounded-md border ${
                      slot.available ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{slot.time} - {slot.endTime}</span>
                        <span className={`text-sm px-2 py-1 rounded ${
                          slot.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {slot.reservations}/{slot.capacity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Réservations de la semaine */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-md font-medium text-gray-900 mb-4">Réservations de la semaine</h3>
              <div className="space-y-4">
                {Object.entries(calendarData).map(([date, orders]) => (
                  <div key={date} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h4>
                    <div className="space-y-2">
                      {orders.map((order) => (
                        <div key={order.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                          <div>
                            <span className="font-medium">{order.orderNumber}</span>
                            <span className="text-gray-600 ml-2">
                              {order.user.firstName} {order.user.lastName}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{order.timeSlotStart} - {order.timeSlotEnd}</div>
                            <div className="text-sm text-gray-600">{order.total.toFixed(2)} €</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Réservations du {new Date().toLocaleDateString('fr-FR')}
              </h2>
              <button
                onClick={handleExportPDF}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter en PDF
              </button>
            </div>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Commande</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Créneau</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {todayReservations.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.user.firstName} {order.user.lastName}<br/>
                        <span className="text-xs">{order.user.email}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.timeSlotStart} - {order.timeSlotEnd}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'RECEIVED' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'PREPARING' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'READY' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.total.toFixed(2)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Configuration */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingConfig ? 'Modifier la configuration' : 'Nouvelle configuration'}
                </h3>
                <button
                  onClick={() => {
                    setShowConfigModal(false);
                    setEditingConfig(null);
                    resetConfigForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleConfigSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Jour de la semaine</label>
                  <select
                    value={configForm.dayOfWeek}
                    onChange={(e) => setConfigForm({...configForm, dayOfWeek: parseInt(e.target.value)})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {daysOfWeek.map((day, index) => (
                      <option key={index} value={index}>{day}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Heure de début</label>
                    <input
                      type="time"
                      value={configForm.startTime}
                      onChange={(e) => setConfigForm({...configForm, startTime: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Heure de fin</label>
                    <input
                      type="time"
                      value={configForm.endTime}
                      onChange={(e) => setConfigForm({...configForm, endTime: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Capacité (commandes simultanées)</label>
                    <input
                      type="number"
                      min="1"
                      value={configForm.capacity}
                      onChange={(e) => setConfigForm({...configForm, capacity: parseInt(e.target.value)})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Intervalle (minutes)</label>
                    <input
                      type="number"
                      min="15"
                      step="15"
                      value={configForm.intervalMinutes}
                      onChange={(e) => setConfigForm({...configForm, intervalMinutes: parseInt(e.target.value)})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={configForm.active}
                    onChange={(e) => setConfigForm({...configForm, active: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                    Actif
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfigModal(false);
                      setEditingConfig(null);
                      resetConfigForm();
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {editingConfig ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Blocage */}
      {showBlockedModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Bloquer un créneau</h3>
                <button
                  onClick={() => {
                    setShowBlockedModal(false);
                    resetBlockedForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleBlockedSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    value={blockedForm.date}
                    onChange={(e) => setBlockedForm({...blockedForm, date: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Heure de début (optionnel)</label>
                    <input
                      type="time"
                      value={blockedForm.startTime}
                      onChange={(e) => setBlockedForm({...blockedForm, startTime: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Heure de fin (optionnel)</label>
                    <input
                      type="time"
                      value={blockedForm.endTime}
                      onChange={(e) => setBlockedForm({...blockedForm, endTime: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Raison du blocage</label>
                  <textarea
                    value={blockedForm.reason}
                    onChange={(e) => setBlockedForm({...blockedForm, reason: e.target.value})}
                    placeholder="Jour férié, fermeture exceptionnelle, etc."
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBlockedModal(false);
                      resetBlockedForm();
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Bloquer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTimeSlots;