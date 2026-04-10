import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Calendar, Plus, Trash2, X, Ban } from 'lucide-react';
import adminApi from '../api/adminAxios';
import AdminBackButton from '../components/AdminBackButton';

const DAYS_ALL = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const DAYS_DOW = [0, 1, 2, 3, 4, 5, 6]; // Corresponding day of week numbers
const DEFAULT_INTERVAL = 60;
const DEFAULT_CAPACITY = 5;

// Helper to get ordered days starting from current day (Morocco timezone)
// If past 18:00, starts from tomorrow instead
const getOrderedDays = () => {
  const now = new Date();
  const options = { timeZone: 'Africa/Casablanca' };
  const moroccoStr = now.toLocaleString('en-US', options);
  const moroccoDate = new Date(moroccoStr);
  let moroccoDay = moroccoDate.getDay();
  const currentHour = moroccoDate.getHours();
  const currentMinute = moroccoDate.getMinutes();
  
  // If past 18:00, start from tomorrow
  if (currentHour >= 18) {
    moroccoDay = (moroccoDay + 1) % 7;
  }
  
  const orderedDays = [];
  const orderedDows = [];
  
  for (let i = 0; i < 7; i++) {
    const dayIndex = (moroccoDay + i) % 7;
    orderedDays.push(DAYS_ALL[dayIndex]);
    orderedDows.push(DAYS_DOW[dayIndex]);
  }
  
  // Get current time in Morocco as minutes since midnight
  const currentTimeMinutes = currentHour * 60 + currentMinute;
  
  return { 
    orderedDays, 
    orderedDows, 
    currentDow: moroccoDay,
    currentTimeMinutes,
    currentHour,
    currentMinute
  };
};

// Helper to convert time string (HH:MM) to minutes since midnight
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper to get minimum time for today (current time rounded up to next 30 min)
const getMinTimeForToday = (currentTimeMinutes) => {
  // Round up to next 30 minutes
  const rounded = Math.ceil(currentTimeMinutes / 30) * 30;
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const AdminTimeSlots = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('days');
  const [{ orderedDays, orderedDows, currentDow, currentTimeMinutes }, setDayOrder] = useState(getOrderedDays());

  // Per-day configs (multiple entries per dayOfWeek for multiple time periods)
  const [configs, setConfigs] = useState([]);
  // Blocked slots
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockForm, setBlockForm] = useState({ date: '', startTime: '', endTime: '', reason: '' });
  // Today reservations
  const [todayReservations, setTodayReservations] = useState([]);
  
  // Edit modal for a day's hours - now supports multiple periods
  const [editDay, setEditDay] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) adminApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchAll();
    // Update day order on mount and every minute to stay synchronized
    setDayOrder(getOrderedDays());
    const interval = setInterval(() => {
      setDayOrder(getOrderedDays());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchConfigs(), fetchBlocked(), fetchTodayReservations()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchConfigs = async () => {
    try {
      // Fetch ALL configs (including inactive) to correctly show disabled days
      const { data } = await adminApi.get('/time-slots/config?all=true');
      setConfigs(data);
    } catch { setConfigs([]); }
  };

  const fetchBlocked = async () => {
    try {
      const { data } = await adminApi.get('/time-slots/blocked');
      setBlockedSlots(data);
    } catch { setBlockedSlots([]); }
  };

  const fetchTodayReservations = async () => {
    try {
      const { data } = await adminApi.get('/time-slots/today-reservations');
      setTodayReservations(data);
    } catch { setTodayReservations([]); }
  };

  useEffect(() => {
    // Refresh data when tab changes
    if (activeTab === 'blocked') {
      fetchBlocked();
    } else if (activeTab === 'export') {
      fetchTodayReservations();
    }
  }, [activeTab]);

  // Get configs for a given dayOfWeek (returns array of configs)
  const getConfigsForDay = (dow) => configs.filter(c => c.dayOfWeek === dow);

  // Check if a day has any active config
  const isDayActive = (dow) => {
    const dayConfigs = getConfigsForDay(dow);
    return dayConfigs.length > 0 && dayConfigs.some(c => c.active);
  };

  // Toggle a day: if has active config → deactivate all; if inactive → activate all
  // Sunday (dow=0) is always disabled
  const toggleDay = async (dow) => {
    // Sunday is always disabled
    if (dow === 0) {
      alert('Le dimanche est toujours fermé.');
      return;
    }
    const dayConfigs = getConfigsForDay(dow);
    const hasActive = dayConfigs.some(c => c.active);
    
    try {
      if (dayConfigs.length === 0) {
        // Create default config for this day (08:00 - 20:00)
        await adminApi.post('/time-slots/config', {
          dayOfWeek: dow, startTime: '08:00', endTime: '20:00',
          capacity: DEFAULT_CAPACITY, intervalMinutes: DEFAULT_INTERVAL, active: true
        });
      } else {
        // Toggle all configs for this day
        for (const cfg of dayConfigs) {
          await adminApi.put(`/time-slots/config/${cfg.id}`, { active: !hasActive });
        }
      }
      fetchConfigs();
    } catch { alert('Erreur lors de la mise à jour'); }
  };

  // Open edit modal for a day's hours
  const openEditDay = (dow) => {
    const dayConfigs = getConfigsForDay(dow);
    let periods;
    
    if (dayConfigs.length > 0) {
      periods = dayConfigs.map(c => ({ 
        id: c.id, 
        startTime: c.startTime, 
        endTime: c.endTime, 
        intervalMinutes: c.intervalMinutes || DEFAULT_INTERVAL, 
        capacity: c.capacity || DEFAULT_CAPACITY 
      }));
    } else {
      // For today, set minimum start time to current time (rounded up)
      const isToday = dow === currentDow;
      const minStartTime = isToday ? getMinTimeForToday(currentTimeMinutes) : '08:00';
      periods = [{ 
        id: null, 
        startTime: minStartTime, 
        endTime: '20:00', 
        intervalMinutes: DEFAULT_INTERVAL, 
        capacity: DEFAULT_CAPACITY 
      }];
    }
    
    setEditDay({
      dayOfWeek: dow,
      periods: periods,
      isToday: dow === currentDow
    });
  };

  // Add a new period to edit modal
  const addPeriod = () => {
    // Set default start time based on last period's end time if available
    const lastPeriod = editDay.periods[editDay.periods.length - 1];
    const defaultStart = lastPeriod ? lastPeriod.endTime : '08:00';
    setEditDay({
      ...editDay,
      periods: [...editDay.periods, { id: null, startTime: defaultStart, endTime: '20:00', intervalMinutes: DEFAULT_INTERVAL, capacity: DEFAULT_CAPACITY }]
    });
  };

  // Remove a period from edit modal
  const removePeriod = (index) => {
    if (editDay.periods.length > 1) {
      const newPeriods = editDay.periods.filter((_, i) => i !== index);
      setEditDay({ ...editDay, periods: newPeriods });
    }
  };

  // Update a period in edit modal
  const updatePeriod = (index, field, value) => {
    const newPeriods = [...editDay.periods];
    newPeriods[index] = { ...newPeriods[index], [field]: value };
    setEditDay({ ...editDay, periods: newPeriods });
  };

  const saveEditDay = async (e) => {
    e.preventDefault();
    try {
      // Delete configs that are no longer in the form
      const currentIds = editDay.periods.filter(p => p.id).map(p => p.id);
      const dayConfigs = getConfigsForDay(editDay.dayOfWeek);
      for (const cfg of dayConfigs) {
        if (!currentIds.includes(cfg.id)) {
          await adminApi.delete(`/time-slots/config/${cfg.id}`);
        }
      }
      
      // Create or update periods
      for (const period of editDay.periods) {
        if (period.id) {
          await adminApi.put(`/time-slots/config/${period.id}`, {
            startTime: period.startTime, endTime: period.endTime,
            intervalMinutes: period.intervalMinutes, capacity: period.capacity
          });
        } else {
          await adminApi.post('/time-slots/config', {
            dayOfWeek: editDay.dayOfWeek, startTime: period.startTime,
            endTime: period.endTime, intervalMinutes: period.intervalMinutes,
            capacity: period.capacity, active: true
          });
        }
      }
      setEditDay(null);
      fetchConfigs();
    } catch { alert('Erreur lors de la sauvegarde'); }
  };

  // Block a slot
  const handleBlockSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.post('/time-slots/blocked', blockForm);
      setShowBlockModal(false);
      setBlockForm({ date: '', startTime: '', endTime: '', reason: '' });
      fetchBlocked();
    } catch { alert('Erreur lors du blocage'); }
  };

  const handleUnblock = async (id) => {
    if (!confirm('Débloquer ce créneau ?')) return;
    try {
      await adminApi.delete(`/time-slots/blocked/${id}`);
      fetchBlocked();
    } catch { alert('Erreur lors du déblocage'); }
  };

  const handleExportPDF = () => {
    const html = `<html><head><title>Réservations du ${new Date().toLocaleDateString('fr-FR')}</title>
    <style>body{font-family:Arial;margin:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px}th{background:#f2f2f2}</style></head>
    <body><h1>Réservations - ${new Date().toLocaleDateString('fr-FR')}</h1>
    <table><thead><tr><th>N° Commande</th><th>Client</th><th>Créneau</th><th>Statut</th><th>Montant</th></tr></thead>
    <tbody>${todayReservations.map(o => `<tr><td>${o.orderNumber}</td><td>${o.user.firstName} ${o.user.lastName}</td><td>${o.timeSlotStart} - ${o.timeSlotEnd}</td><td>${o.status}</td><td>${o.total.toFixed(2)} DH</td></tr>`).join('')}</tbody></table></body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    w.print();
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-sky-700 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminBackButton />
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Gestion des créneaux</h1>
              <p className="text-xs text-gray-500">Configurez les horaires d\'ouverture par jour</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
          {[
            { id: 'days', label: 'Jours & Horaires', icon: Calendar },
            { id: 'blocked', label: 'Créneaux bloqués', icon: Ban },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'bg-white text-sky-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}>
              <tab.icon size={15} />{tab.label}
            </button>
          ))}
        </div>

        {/* TAB: Jours & Horaires */}
        {activeTab === 'days' && (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              Configurez les horaires d\'ouverture pour chaque jour. Vous pouvez ajouter plusieurs plages horaires par jour (ex: matin et après-midi).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {orderedDays.map((dayName, idx) => {
                const dow = orderedDows[idx];
                const dayConfigs = getConfigsForDay(dow);
                const isActive = dow !== 0 && isDayActive(dow);
                
                // Format periods for display
                const periods = dayConfigs.filter(c => c.active).map(c => `${c.startTime} – ${c.endTime}`);

                return (
                  <div key={dow} className={`bg-white rounded-xl border-2 p-4 transition-all ${
                    isActive ? 'border-green-200' : 'border-gray-200 opacity-60'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`font-semibold ${dow === 0 ? 'text-gray-400' : 'text-gray-900'}`}>{dayName}</span>
                      <button
                        onClick={() => toggleDay(dow)}
                        disabled={dow === 0}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          isActive ? 'bg-green-500' : 'bg-gray-300'
                        } ${dow === 0 ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          isActive ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    {isActive && (
                      <>
                        <div className="text-sm text-gray-600 space-y-1 mb-3">
                          {periods.map((period, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <Clock size={13} className="text-sky-600" />
                              <span>{period}</span>
                            </div>
                          ))}
                          {periods.length === 0 && (
                            <div className="text-xs text-gray-400">Aucun horaire configuré</div>
                          )}
                        </div>
                        <button
                          onClick={() => openEditDay(dow)}
                          className="w-full text-xs text-sky-700 border border-sky-200 rounded-lg py-1.5 hover:bg-sky-50 transition-colors flex items-center justify-center gap-1"
                        >
                          Modifier les horaires
                        </button>
                      </>
                    )}
                    {!isActive && (
                      <p className="text-xs text-gray-400 mt-1">Jour désactivé</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: Créneaux bloqués */}
        {activeTab === 'blocked' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">Bloquez un jour entier ou une plage horaire spécifique.</p>
              <button onClick={() => setShowBlockModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">
                <Ban size={15} /> Bloquer un créneau
              </button>
            </div>

            {blockedSlots.length === 0 ? (
              <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100">
                <Ban size={36} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Aucun créneau bloqué</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Date', 'Horaires', 'Raison', 'Action'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {blockedSlots.map(slot => (
                      <tr key={slot.id}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {new Date(slot.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {slot.startTime ? `${slot.startTime} – ${slot.endTime || '23:59'}` : 'Journée entière'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{slot.reason}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleUnblock(slot.id)}
                            className="text-xs text-green-600 hover:text-green-800 font-medium">
                            Débloquer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Edit day hours with multiple periods */}
      {editDay && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Horaires — {DAYS_ALL[editDay.dayOfWeek]}</h3>
              <button onClick={() => setEditDay(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={saveEditDay} className="space-y-4">
              <div className="space-y-4">
                {editDay.periods.map((period, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-semibold text-gray-600 uppercase">Plage {index + 1}</span>
                      {editDay.periods.length > 1 && (
                        <button type="button" onClick={() => removePeriod(index)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Début</label>
                        {editDay.isToday && index === 0 && (
                          <p className="text-xs text-orange-600 mb-1">
                            ⚠️ Heure min: {getMinTimeForToday(currentTimeMinutes)} (heure actuelle arrondie)
                          </p>
                        )}
                        <input type="time" value={period.startTime}
                          onChange={e => updatePeriod(index, 'startTime', e.target.value)}
                          min={editDay.isToday && index === 0 ? getMinTimeForToday(currentTimeMinutes) : undefined}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-sky-500" required />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Fin</label>
                        <input type="time" value={period.endTime}
                          onChange={e => updatePeriod(index, 'endTime', e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-sky-500" required />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Intervalle (min)</label>
                        <select value={period.intervalMinutes}
                          onChange={e => updatePeriod(index, 'intervalMinutes', parseInt(e.target.value))}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-sky-500">
                          {[15, 30, 45, 60, 90, 120].map(v => <option key={v} value={v}>{v} min</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Capacité</label>
                        <input type="number" min="1" max="50" value={period.capacity}
                          onChange={e => updatePeriod(index, 'capacity', parseInt(e.target.value) || 1)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-sky-500" required />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button type="button" onClick={addPeriod}
                className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg text-sm hover:border-sky-500 hover:text-sky-600 transition-colors flex items-center justify-center gap-1">
                <Plus size={15} /> Ajouter une plage horaire
              </button>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditDay(null)}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                  Annuler
                </button>
                <button type="submit"
                  className="flex-1 py-2 bg-sky-700 text-white rounded-lg text-sm hover:bg-sky-800">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Block slot */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Bloquer un créneau</h3>
              <button onClick={() => setShowBlockModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleBlockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={blockForm.date}
                  onChange={e => setBlockForm({ ...blockForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-sky-500" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Début (optionnel)</label>
                  <input type="time" value={blockForm.startTime}
                    onChange={e => setBlockForm({ ...blockForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-sky-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Fin (optionnel)</label>
                  <input type="time" value={blockForm.endTime}
                    onChange={e => setBlockForm({ ...blockForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-sky-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Raison</label>
                <textarea value={blockForm.reason}
                  onChange={e => setBlockForm({ ...blockForm, reason: e.target.value })}
                  placeholder="Jour férié, absence livreur..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-sky-500 resize-none" required />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowBlockModal(false)}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                  Annuler
                </button>
                <button type="submit"
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                  Bloquer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTimeSlots;