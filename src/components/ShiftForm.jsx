import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUser, FiMail, FiClock, FiCalendar, FiCheck, FiAlertCircle, FiUsers } = FiIcons;

const ShiftForm = ({ currentTime, onSubmit }) => {
  const [formData, setFormData] = useState({
    employeeName: '',
    email: '',
    entryTime: '',
    selectedShift: '',
    mealTime: ''
  });
  const [availableShifts, setAvailableShifts] = useState([]);
  const [availableMealTimes, setAvailableMealTimes] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Simulated capacity data (would be fetched from backend in a real application)
  const [shiftsCapacity, setShiftsCapacity] = useState({
    'shift1': { capacity: 5, current: 2 },
    'shift2': { capacity: 5, current: 3 },
    'shift3': { capacity: 5, current: 1 },
    'shift4': { capacity: 5, current: 0 },
    'weekend1': { capacity: 5, current: 2 },
    'weekend2': { capacity: 5, current: 3 },
    'weekend3': { capacity: 5, current: 1 },
  });

  // Meal times capacity
  const [mealCapacity, setMealCapacity] = useState({
    'meal1': { capacity: 4, current: 2 },
    'meal2': { capacity: 4, current: 3 },
    'meal3': { capacity: 4, current: 1 },
    'meal4': { capacity: 4, current: 0 },
    'meal5': { capacity: 4, current: 2 },
  });

  // Room occupancy (simulation of at least 1 person per room)
  const [roomOccupancy, setRoomOccupancy] = useState({
    'room1': 1, // At least one person in room 1
    'room2': 1, // At least one person in room 2
    'room3': 0, // No one in room 3
    'room4': 2, // Two people in room 4
  });

  // Horarios base
  const weekdayShifts = [
    { id: 'shift1', time: '09:00 - 11:00', start: 9, end: 11 },
    { id: 'shift2', time: '11:00 - 13:00', start: 11, end: 13 },
    { id: 'shift3', time: '13:00 - 15:30', start: 13, end: 15.5 },
    { id: 'shift4', time: '15:30 - 18:00', start: 15.5, end: 18 }
  ];

  const weekendShifts = [
    { id: 'weekend1', time: '10:00 - 12:30', start: 10, end: 12.5 },
    { id: 'weekend2', time: '12:30 - 15:00', start: 12.5, end: 15 },
    { id: 'weekend3', time: '15:00 - 17:00', start: 15, end: 17 }
  ];

  const mealTimes = [
    { id: 'meal1', time: '12:30 - 13:00', start: 12.5, end: 13, roomId: 'room1' },
    { id: 'meal2', time: '13:00 - 13:30', start: 13, end: 13.5, roomId: 'room2' },
    { id: 'meal3', time: '13:30 - 14:00', start: 13.5, end: 14, roomId: 'room3' },
    { id: 'meal4', time: '14:30 - 15:00', start: 14.5, end: 15, roomId: 'room4' },
    { id: 'meal5', time: '15:00 - 15:30', start: 15, end: 15.5, roomId: 'room1' }
  ];

  useEffect(() => {
    const entryTime = formData.entryTime || getCurrentTimeString();
    setFormData(prev => ({ ...prev, entryTime }));
    updateAvailableShifts(entryTime);
  }, [currentTime]);

  useEffect(() => {
    if (formData.selectedShift && formData.entryTime) {
      updateAvailableMealTimes();
    }
  }, [formData.selectedShift, formData.entryTime]);

  const getCurrentTimeString = () => {
    return currentTime.toTimeString().slice(0, 5);
  };

  const timeToDecimal = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours + minutes / 60;
  };

  const isWeekend = () => {
    const day = currentTime.getDay();
    return day === 0 || day === 6;
  };

  const updateAvailableShifts = (entryTime) => {
    const entryDecimal = timeToDecimal(entryTime);
    const shifts = isWeekend() ? weekendShifts : weekdayShifts;
    
    // Updated logic: Allow selection of current shift and upcoming shifts
    const available = shifts.filter(shift => {
      // Can select if entry time is before shift end time
      // This allows selecting a shift even if it has already started
      return entryDecimal <= shift.end;
    });
    
    setAvailableShifts(available);
    
    if (available.length > 0 && !available.find(s => s.id === formData.selectedShift)) {
      setFormData(prev => ({ ...prev, selectedShift: '', mealTime: '' }));
    }
  };

  const updateAvailableMealTimes = () => {
    const selectedShiftData = [...weekdayShifts, ...weekendShifts].find(
      s => s.id === formData.selectedShift
    );

    if (!selectedShiftData) return;

    // Get meal times based on the selected shift
    // This is updated to allow early shift workers to access all meal times
    // But later shift workers can only access meal times during or after their shift
    const available = mealTimes.filter(meal => {
      // For early shifts (starting before 11:00), all meal times are available
      if (selectedShiftData.start < 11) {
        return true;
      }
      
      // For mid-day shifts (11:00-13:00), only meal times from 13:00 onwards are available
      if (selectedShiftData.start < 13) {
        return meal.start >= 13;
      }
      
      // For afternoon shifts, only meal times during their shift are available
      return meal.start >= selectedShiftData.start && meal.end <= selectedShiftData.end;
    });

    setAvailableMealTimes(available);
    
    if (available.length > 0 && !available.find(m => m.id === formData.mealTime)) {
      setFormData(prev => ({ ...prev, mealTime: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const shiftData = {
      ...formData,
      date: currentTime.toISOString().split('T')[0],
      dayOfWeek: currentTime.toLocaleDateString('es-ES', { weekday: 'long' }),
      actualEntryTime: getCurrentTimeString()
    };

    // Update capacity count for shift (in a real app, this would be handled by the backend)
    setShiftsCapacity(prev => {
      const shiftId = formData.selectedShift;
      return {
        ...prev,
        [shiftId]: {
          ...prev[shiftId],
          current: prev[shiftId].current + 1
        }
      };
    });

    // Update capacity count for meal time
    setMealCapacity(prev => {
      const mealId = formData.mealTime;
      return {
        ...prev,
        [mealId]: {
          ...prev[mealId],
          current: prev[mealId].current + 1
        }
      };
    });

    // Update room occupancy
    const selectedMeal = mealTimes.find(m => m.id === formData.mealTime);
    if (selectedMeal) {
      setRoomOccupancy(prev => ({
        ...prev,
        [selectedMeal.roomId]: prev[selectedMeal.roomId] + 1
      }));
    }

    onSubmit(shiftData);
    setIsSubmitted(true);
    
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        employeeName: '',
        email: '',
        entryTime: getCurrentTimeString(),
        selectedShift: '',
        mealTime: ''
      });
    }, 3000);
  };

  const isFormValid = () => {
    return formData.employeeName && 
           formData.email && 
           formData.selectedShift && 
           formData.mealTime;
  };

  const getShiftStatusLabel = (shiftId) => {
    const capacity = shiftsCapacity[shiftId];
    if (!capacity) return '';
    
    if (capacity.current >= capacity.capacity) {
      return <span className="ml-2 text-red-600 text-xs font-medium">Lleno</span>;
    } else if (capacity.current >= capacity.capacity * 0.8) {
      return <span className="ml-2 text-orange-600 text-xs font-medium">Casi lleno</span>;
    } else {
      return <span className="ml-2 text-green-600 text-xs font-medium">Disponible</span>;
    }
  };

  const getMealStatusLabel = (mealId) => {
    const capacity = mealCapacity[mealId];
    if (!capacity) return '';
    
    if (capacity.current >= capacity.capacity) {
      return <span className="ml-2 text-red-600 text-xs font-medium">Lleno</span>;
    } else if (capacity.current >= capacity.capacity * 0.8) {
      return <span className="ml-2 text-orange-600 text-xs font-medium">Casi lleno</span>;
    } else {
      return <span className="ml-2 text-green-600 text-xs font-medium">Disponible</span>;
    }
  };

  const isShiftFull = (shiftId) => {
    const capacity = shiftsCapacity[shiftId];
    return capacity && capacity.current >= capacity.capacity;
  };

  const isMealFull = (mealId) => {
    const capacity = mealCapacity[mealId];
    return capacity && capacity.current >= capacity.capacity;
  };

  // Calculate max meal capacity based on room occupancy
  const calculateMealCapacity = (mealId) => {
    const meal = mealTimes.find(m => m.id === mealId);
    if (!meal) return 4; // Default max capacity
    
    // Count how many rooms have at least one person
    const roomsWithPeople = Object.values(roomOccupancy).filter(count => count > 0).length;
    const totalRooms = Object.keys(roomOccupancy).length;
    
    // If all rooms have at least one person, max capacity is 4
    if (roomsWithPeople === totalRooms) {
      return 4;
    }
    
    // Otherwise, reduce capacity based on how many rooms need coverage
    const roomsNeedingCoverage = totalRooms - roomsWithPeople;
    return Math.max(1, 4 - roomsNeedingCoverage);
  };

  const getCurrentShift = () => {
    const entryDecimal = timeToDecimal(formData.entryTime);
    const shifts = isWeekend() ? weekendShifts : weekdayShifts;
    
    return shifts.find(shift => entryDecimal >= shift.start && entryDecimal < shift.end);
  };

  const currentShift = getCurrentShift();

  if (isSubmitted) {
    return (
      <motion.div 
        className="max-w-md mx-auto mt-12"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <SafeIcon icon={FiCheck} className="text-4xl text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-800 mb-2">
            ¡Turno Registrado!
          </h3>
          <p className="text-green-600">
            Tu horario ha sido guardado correctamente
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Registro de Turno
          </h2>
          <p className="text-gray-600">
            Completa el formulario para registrar tu horario de trabajo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del empleado */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiUser} className="inline mr-2" />
                Nombre del Empleado
              </label>
              <input
                type="text"
                value={formData.employeeName}
                onChange={(e) => setFormData(prev => ({ ...prev, employeeName: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Ingresa tu nombre completo"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiMail} className="inline mr-2" />
                Correo Electrónico
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="tu.email@empresa.com"
                required
              />
            </div>
          </div>

          {/* Hora de entrada detectada */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <SafeIcon icon={FiClock} className="inline mr-2" />
              Hora de Entrada (Detectada Automáticamente)
            </label>
            <div className="bg-gray-50 px-4 py-3 rounded-lg border">
              <span className="text-lg font-semibold text-gray-800">
                {formData.entryTime}
              </span>
              <span className="ml-2 text-sm text-gray-600">
                ({currentTime.toLocaleDateString('es-ES', { weekday: 'long' })})
              </span>
              
              {currentShift && (
                <div className="mt-2 text-sm bg-blue-50 text-blue-800 p-2 rounded-md">
                  Estás dentro del horario: <strong>{currentShift.time}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Selección de turno */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                <SafeIcon icon={FiCalendar} className="inline mr-2" />
                Turno Disponible
              </label>
              <div className="flex items-center text-sm text-gray-600">
                <SafeIcon icon={FiUsers} className="mr-1" />
                Ocupación
              </div>
            </div>
            
            {availableShifts.length > 0 ? (
              <div className="grid gap-3">
                {availableShifts.map((shift) => {
                  const isFull = isShiftFull(shift.id);
                  const capacity = shiftsCapacity[shift.id];
                  const isCurrentlyActive = currentShift && currentShift.id === shift.id;
                  
                  return (
                    <label
                      key={shift.id}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                        isFull ? 'opacity-50 cursor-not-allowed' : ''
                      } ${
                        formData.selectedShift === shift.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : isCurrentlyActive
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-300 hover:border-indigo-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="shift"
                        value={shift.id}
                        checked={formData.selectedShift === shift.id}
                        onChange={(e) => setFormData(prev => ({ ...prev, selectedShift: e.target.value }))}
                        className="mr-3"
                        disabled={isFull}
                      />
                      <span className={`font-medium flex-grow ${isCurrentlyActive ? 'text-blue-700' : ''}`}>
                        {shift.time}
                        {isCurrentlyActive && <span className="ml-2 text-xs font-medium bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">Actual</span>}
                      </span>
                      
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              capacity.current >= capacity.capacity ? 'bg-red-500' :
                              capacity.current >= capacity.capacity * 0.8 ? 'bg-orange-500' : 'bg-green-500'
                            }`} 
                            style={{ width: `${Math.min(100, (capacity.current / capacity.capacity) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs text-gray-600">
                          {capacity.current}/{capacity.capacity}
                        </span>
                        {getShiftStatusLabel(shift.id)}
                      </div>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <SafeIcon icon={FiAlertCircle} className="inline text-yellow-600 mr-2" />
                <span className="text-yellow-800">
                  No hay turnos disponibles para esta hora de entrada
                </span>
              </div>
            )}
          </div>

          {/* Horario de comida */}
          {formData.selectedShift && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Horario de Comida
                </label>
                <div className="flex items-center text-sm text-gray-600">
                  <SafeIcon icon={FiUsers} className="mr-1" />
                  Ocupación
                </div>
              </div>
              
              {availableMealTimes.length > 0 ? (
                <div className="grid gap-3">
                  {availableMealTimes.map((meal) => {
                    const capacity = mealCapacity[meal.id];
                    const maxCapacity = calculateMealCapacity(meal.id);
                    const isFull = capacity && capacity.current >= maxCapacity;
                    const roomInfo = meal.roomId ? ` (${meal.roomId})` : '';
                    
                    return (
                      <label
                        key={meal.id}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                          isFull ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                          formData.mealTime === meal.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300 hover:border-green-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="mealTime"
                          value={meal.id}
                          checked={formData.mealTime === meal.id}
                          onChange={(e) => setFormData(prev => ({ ...prev, mealTime: e.target.value }))}
                          className="mr-3"
                          disabled={isFull}
                        />
                        <span className="font-medium flex-grow">
                          {meal.time}{roomInfo}
                        </span>
                        
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                capacity.current >= maxCapacity ? 'bg-red-500' :
                                capacity.current >= maxCapacity * 0.8 ? 'bg-orange-500' : 'bg-green-500'
                              }`} 
                              style={{ width: `${Math.min(100, (capacity.current / maxCapacity) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-xs text-gray-600">
                            {capacity.current}/{maxCapacity}
                          </span>
                          {getMealStatusLabel(meal.id)}
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <SafeIcon icon={FiAlertCircle} className="inline text-yellow-600 mr-2" />
                  <span className="text-yellow-800">
                    No hay horarios de comida disponibles para este turno
                  </span>
                </div>
              )}
              
              {/* Información sobre prioridad de horarios */}
              <div className="mt-3 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <p className="font-medium text-blue-800 mb-1">Información sobre horarios de comida:</p>
                <ul className="list-disc pl-5 text-blue-700">
                  <li>Los empleados del turno de 9:00 - 11:00 tienen acceso a todos los horarios de comida.</li>
                  <li>Los empleados del turno de 11:00 - 13:00 solo pueden acceder a horarios desde las 13:00.</li>
                  <li>Los empleados de turnos posteriores solo pueden acceder a horarios durante su turno.</li>
                  <li>Se necesita al menos 1 persona en cada sala en todo momento.</li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* Status de salas */}
          {formData.selectedShift && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-gray-50 p-4 rounded-lg border border-gray-200"
            >
              <h3 className="font-medium text-gray-800 mb-3">Estado de ocupación de salas:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(roomOccupancy).map(([roomId, count]) => (
                  <div key={roomId} className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{roomId}</span>
                      <span 
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          count === 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {count === 0 ? 'Vacía' : `${count} persona${count > 1 ? 's' : ''}`}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${count === 0 ? 'bg-red-500' : 'bg-green-500'}`} 
                        style={{ width: `${Math.min(100, count * 25)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-500 italic">
                Nota: La capacidad máxima de horarios de comida se ajusta para garantizar que haya al menos 1 persona en cada sala.
              </p>
            </motion.div>
          )}

          {/* Botón de envío */}
          <motion.button
            type="submit"
            disabled={!isFormValid()}
            className={`w-full py-4 px-6 rounded-lg font-semibold transition-all ${
              isFormValid()
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            whileHover={isFormValid() ? { scale: 1.02 } : {}}
            whileTap={isFormValid() ? { scale: 0.98 } : {}}
          >
            Registrar Turno
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default ShiftForm;