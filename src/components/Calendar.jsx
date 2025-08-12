import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiChevronLeft, FiChevronRight, FiClock, FiUser } = FiIcons;

const Calendar = ({ shifts }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getShiftsForDate = (date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return shifts.filter(shift => shift.date === dateString);
  };

  const getShiftTime = (shiftId) => {
    const shiftTimes = {
      'shift1': '09:00 - 11:00',
      'shift2': '11:00 - 13:00',
      'shift3': '13:00 - 15:30',
      'shift4': '15:30 - 18:00',
      'weekend1': '10:00 - 12:30',
      'weekend2': '12:30 - 15:00',
      'weekend3': '15:00 - 17:00'
    };
    return shiftTimes[shiftId] || 'N/A';
  };

  const getMealTime = (mealId) => {
    const mealTimes = {
      'meal1': '12:30 - 13:00',
      'meal2': '13:00 - 13:30',
      'meal3': '13:30 - 14:00',
      'meal4': '14:30 - 15:00',
      'meal5': '15:00 - 15:30'
    };
    return mealTimes[mealId] || 'N/A';
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const selectedDateShifts = selectedDate ? getShiftsForDate(selectedDate) : [];

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Header del calendario */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <SafeIcon icon={FiChevronLeft} className="text-xl" />
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <SafeIcon icon={FiChevronRight} className="text-xl" />
            </button>
          </div>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Días del calendario */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const dayShifts = getShiftsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);

            return (
              <motion.button
                key={index}
                onClick={() => setSelectedDate(day)}
                className={`relative p-3 rounded-lg transition-all ${
                  !isCurrentMonth
                    ? 'text-gray-300'
                    : isSelected
                    ? 'bg-indigo-600 text-white'
                    : isTodayDate
                    ? 'bg-indigo-100 text-indigo-800 border-2 border-indigo-300'
                    : dayShifts.length > 0
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'hover:bg-gray-100'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-sm font-medium">
                  {format(day, 'd')}
                </span>
                {dayShifts.length > 0 && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-current rounded-full opacity-60" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Detalles de la fecha seleccionada */}
      {selectedDate && (
        <motion.div
          className="bg-white rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Turnos para {format(selectedDate, 'dd \'de\' MMMM \'de\' yyyy', { locale: es })}
          </h3>

          {selectedDateShifts.length > 0 ? (
            <div className="space-y-4">
              {selectedDateShifts.map((shift, index) => (
                <motion.div
                  key={shift.id}
                  className="border border-gray-200 rounded-lg p-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={FiUser} className="text-indigo-600" />
                      <span className="font-semibold text-gray-800">
                        {shift.employeeName}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {shift.email}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={FiClock} className="text-green-600" />
                      <div>
                        <div className="font-medium">Entrada:</div>
                        <div className="text-gray-600">{shift.entryTime}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={FiClock} className="text-blue-600" />
                      <div>
                        <div className="font-medium">Turno:</div>
                        <div className="text-gray-600">{getShiftTime(shift.selectedShift)}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={FiClock} className="text-orange-600" />
                      <div>
                        <div className="font-medium">Comida:</div>
                        <div className="text-gray-600">{getMealTime(shift.mealTime)}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No hay turnos registrados para esta fecha
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Calendar;