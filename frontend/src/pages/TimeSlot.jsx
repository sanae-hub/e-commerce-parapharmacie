import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { ArrowLeft, Calendar, Clock, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'

const TimeSlot = () => {
  const navigate = useNavigate()
  const { cartItems } = useCart()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [timeSlots, setTimeSlots] = useState([])
  const [showConfirmAnimation, setShowConfirmAnimation] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Vous devez être connecté pour accéder à cette page')
      navigate('/login')
      return
    }
    if (cartItems.length === 0) {
      navigate('/cart')
      return
    }
    // Sélectionner automatiquement aujourd'hui
    setSelectedDate(new Date())
  }, [cartItems, navigate])

  useEffect(() => {
    if (selectedDate) {
      generateTimeSlots(selectedDate)
    }
  }, [selectedDate])

  // Générer les jours du mois pour le calendrier
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Jours vides avant le début du mois
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Jours du mois
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      date.setHours(0, 0, 0, 0)
      
      // Désactiver les dates passées
      const isPast = date < today
      const isClosed = date.getDay() === 0 // Dimanche fermé
      
      days.push({
        date,
        day,
        isPast,
        isClosed,
        isToday: date.toDateString() === today.toDateString()
      })
    }

    return days
  }

  const generateTimeSlots = (date) => {
    const slots = []
    const dayOfWeek = date.getDay()
    const isToday = date.toDateString() === new Date().toDateString()
    const currentHour = new Date().getHours()
    const currentMinutes = new Date().getMinutes()

    // Horaires d'ouverture (9h-19h)
    const openingHour = 9
    const closingHour = 19

    // Pause déjeuner (12h30-14h)
    const lunchStart = 12.5
    const lunchEnd = 14

    // Dimanche fermé
    if (dayOfWeek === 0) {
      setTimeSlots([])
      return
    }

    // Générer créneaux de 30 minutes
    for (let hour = openingHour; hour < closingHour; hour++) {
      for (let minutes = 0; minutes < 60; minutes += 30) {
        const slotTime = hour + minutes / 60

        // Ignorer pause déjeuner
        if (slotTime >= lunchStart && slotTime < lunchEnd) continue

        // Si aujourd'hui, ignorer créneaux passés (+ 2h de préparation)
        if (isToday) {
          const minTime = currentHour + currentMinutes / 60 + 2
          if (slotTime <= minTime) continue
        }

        const timeString = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        const endHour = minutes === 30 ? hour + 1 : hour
        const endMinutes = minutes === 30 ? 0 : 30
        const endTimeString = `${endHour.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`

        // Simuler disponibilité avec capacité max de 5 places
        const maxCapacity = 5
        const bookedCapacity = Math.floor(Math.random() * 6) // 0-5 réservations
        const availableCapacity = maxCapacity - bookedCapacity
        const available = availableCapacity > 0
        const occupancyRate = (bookedCapacity / maxCapacity) * 100

        // Déterminer le statut selon le taux d'occupation
        let status = 'available' // vert
        if (!available) {
          status = 'full' // rouge
        } else if (occupancyRate >= 80) {
          status = 'almost-full' // orange
        }

        slots.push({
          id: `${date.toISOString()}-${timeString}`,
          time: timeString,
          endTime: endTimeString,
          available,
          capacity: availableCapacity,
          status,
          occupancyRate
        })
      }
    }

    setTimeSlots(slots)
  }

  // Compter les créneaux disponibles pour la journée
  const getAvailableSlotsCount = () => {
    return timeSlots.filter(slot => slot.available).length
  }

  // Navigation du calendrier
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const formatMonthYear = (date) => {
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const handleContinue = () => {
    if (selectedDate && selectedSlot) {
      // Animation de validation
      setShowConfirmAnimation(true)
      
      setTimeout(() => {
        const slotData = {
          date: selectedDate.toISOString(),
          slot: selectedSlot,
        }
        localStorage.setItem('selectedTimeSlot', JSON.stringify(slotData))
        navigate('/checkout/confirmation')
      }, 1000)
    }
  }

  const calendarDays = generateCalendarDays()
  const availableSlotsCount = getAvailableSlotsCount()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/checkout')}
          className="flex items-center gap-2 text-sky-700 font-semibold mb-6 hover:text-sky-800"
        >
          <ArrowLeft size={20} />
          Retour
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Calendar size={28} className="text-sky-700" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Choisir un créneau</h1>
              <p className="text-gray-600">Sélectionnez la date et l'heure de retrait</p>
            </div>
          </div>

          {/* Calendrier mensuel compact */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Calendrier</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} className="text-gray-600" />
                </button>
                <span className="text-sm font-medium text-gray-700 min-w-[140px] text-center">
                  {formatMonthYear(currentMonth)}
                </span>
                <button
                  onClick={goToNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Jours de la semaine */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Grille du calendrier */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((dayInfo, index) => {
                if (!dayInfo) {
                  return <div key={`empty-${index}`} className="aspect-square" />
                }

                const { date, day, isPast, isClosed, isToday } = dayInfo
                const isSelected = selectedDate?.toDateString() === date.toDateString()
                const isDisabled = isPast || isClosed

                return (
                  <button
                    key={index}
                    onClick={() => !isDisabled && setSelectedDate(date)}
                    disabled={isDisabled}
                    className={`aspect-square p-2 rounded-lg border-2 transition-all duration-200 ${
                      isDisabled
                        ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                        : isSelected
                        ? 'border-sky-700 bg-sky-50 shadow-md'
                        : 'border-gray-200 hover:border-sky-300 hover:bg-sky-50'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className={`text-sm font-semibold ${
                        isSelected ? 'text-sky-700' : isDisabled ? 'text-gray-400' : 'text-gray-900'
                      }`}>
                        {day}
                      </span>
                      {isToday && !isSelected && (
                        <span className="text-[10px] text-green-600 font-medium mt-0.5">Auj.</span>
                      )}
                      {isClosed && (
                        <span className="text-[10px] text-red-600 font-medium mt-0.5">Fermé</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Créneaux horaires avec code couleur */}
          {selectedDate && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock size={20} className="text-sky-700" />
                  <h3 className="font-semibold text-gray-900">Créneaux horaires</h3>
                </div>
                {/* Compteur en temps réel */}
                {timeSlots.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-700">
                      {availableSlotsCount} créneau{availableSlotsCount > 1 ? 'x' : ''} disponible{availableSlotsCount > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* Légende des couleurs */}
              <div className="flex flex-wrap gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-xs text-gray-600">Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span className="text-xs text-gray-600">&gt; 80% capacité</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-xs text-gray-600">Complet</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded"></div>
                  <span className="text-xs text-gray-600">Fermé</span>
                </div>
              </div>

              {timeSlots.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Clock size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">Pharmacie fermée ce jour</p>
                  <p className="text-sm text-gray-400 mt-1">Veuillez sélectionner une autre date</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {timeSlots.map((slot) => {
                    const isSelected = selectedSlot?.id === slot.id
                    
                    // Déterminer les couleurs selon le statut
                    let borderColor = 'border-gray-200'
                    let bgColor = 'bg-white'
                    let textColor = 'text-gray-900'
                    let badgeColor = 'bg-green-100 text-green-700'
                    
                    if (slot.status === 'full') {
                      borderColor = 'border-red-200'
                      bgColor = 'bg-red-50'
                      textColor = 'text-gray-400'
                      badgeColor = 'bg-red-100 text-red-700'
                    } else if (slot.status === 'almost-full') {
                      borderColor = 'border-orange-200'
                      bgColor = 'bg-orange-50'
                      badgeColor = 'bg-orange-100 text-orange-700'
                    }
                    
                    if (isSelected) {
                      borderColor = 'border-sky-700'
                      bgColor = 'bg-sky-50'
                      textColor = 'text-sky-700'
                    }

                    return (
                      <button
                        key={slot.id}
                        onClick={() => slot.available && setSelectedSlot(slot)}
                        disabled={!slot.available}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          !slot.available
                            ? `${borderColor} ${bgColor} cursor-not-allowed opacity-60`
                            : isSelected
                            ? `${borderColor} ${bgColor} shadow-lg scale-105`
                            : `${borderColor} hover:border-sky-300 hover:shadow-md`
                        }`}
                      >
                        <div className="text-center">
                          <p className={`text-lg font-bold ${isSelected ? textColor : 'text-gray-900'}`}>
                            {slot.time}
                          </p>
                          <p className="text-xs text-gray-500 mb-2">{slot.endTime}</p>
                          {slot.available ? (
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}>
                              {slot.capacity} place{slot.capacity > 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              Complet
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Informations */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">ℹ️ Information :</span> Votre commande sera prête au créneau sélectionné. 
              Vous recevrez un rappel 2 heures avant.
            </p>
          </div>

          {/* Bouton de confirmation avec animation */}
          <button
            onClick={handleContinue}
            disabled={!selectedDate || !selectedSlot || showConfirmAnimation}
            className={`w-full mt-6 py-4 font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              showConfirmAnimation
                ? 'bg-green-500 text-white scale-105'
                : !selectedDate || !selectedSlot
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-sky-700 hover:bg-sky-800 text-white hover:scale-105 shadow-lg'
            }`}
          >
            {showConfirmAnimation ? (
              <>
                <CheckCircle size={24} className="animate-bounce" />
                <span>Créneau confirmé !</span>
              </>
            ) : (
              <>
                <Calendar size={20} />
                <span>Confirmer le créneau</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TimeSlot
