import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiClock, FiCalendar, FiTrendingUp, FiFilter, FiDownload, FiTrash2, FiHome } = FiIcons;

const Dashboard = ({ shifts }) => {
  const [filterDate, setFilterDate] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [showMealCapacityModal, setShowMealCapacityModal] = useState(false);
  const [activeTab, setActiveTab] = useState('shifts');

  // Capacity management (would be stored in a database in a real app)
  const [shiftsCapacity, setShiftsCapacity] = useState({
    'shift1': { capacity: 5, current: 2 },
    'shift2': { capacity: 5, current: 3 },
    'shift3': { capacity: 5, current: 1 },
    'shift4': { capacity: 5, current: 0 },
    'weekend1': { capacity: 5, current: 2 },
    'weekend2': { capacity: 5, current: 3 },
    'weekend3': { capacity: 5, current: 1 },
  });

  // Meal capacity management
  const [mealCapacity, setMealCapacity] = useState({
    'meal1': { capacity: 4, current: 2 },
    'meal2': { capacity: 4, current: 3 },
    'meal3': { capacity: 4, current: 1 },
    'meal4': { capacity: 4, current: 0 },
    'meal5': { capacity: 4, current: 2 },
  });

  // Room occupancy
  const [roomOccupancy, setRoomOccupancy] = useState({
    'room1': 1,
    'room2': 1,
    'room3': 0,
    'room4': 2,
  });

  const getStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayShifts = shifts.filter(shift => shift.date === today);
    
    return {
      totalEmployees: new Set(shifts.map(s => s.email)).size,
      todayShifts: todayShifts.length,
      totalShifts: shifts.length,
      activeShifts: todayShifts.length
    };
  };

  const getFilteredShifts = () => {
    return shifts.filter(shift => {
      const matchesDate = !filterDate || shift.date === filterDate;
      const matchesEmployee = !filterEmployee || 
        shift.employeeName.toLowerCase().includes(filterEmployee.toLowerCase()) ||
        shift.email.toLowerCase().includes(filterEmployee.toLowerCase());
      
      return matchesDate && matchesEmployee;
    });
  };

  const exportToCSV = () => {
    const filteredShifts = getFilteredShifts();
    const headers = ['Fecha', 'Empleado', 'Email', 'Entrada', 'Turno', 'Comida'];
    const csvContent = [
      headers.join(','),
      ...filteredShifts.map(shift => [
        shift.date,
        shift.employeeName,
        shift.email,
        shift.entryTime,
        getShiftTime(shift.selectedShift),
        getMealTime(shift.mealTime)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `turnos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getShiftTime = (shiftId) => {
    const shifts = {
      'shift1': '09:00 - 11:00',
      'shift2': '11:00 - 13:00',
      'shift3': '13:00 - 15:30',
      'shift4': '15:30 - 18:00',
      'weekend1': '10:00 - 12:30',
      'weekend2': '12:30 - 15:00',
      'weekend3': '15:00 - 17:00'
    };
    return shifts[shiftId] || 'N/A';
  };

  const getMealTime = (mealId) => {
    const meals = {
      'meal1': '12:30 - 13:00',
      'meal2': '13:00 - 13:30',
      'meal3': '13:30 - 14:00',
      'meal4': '14:30 - 15:00',
      'meal5': '15:00 - 15:30'
    };
    return meals[mealId] || 'N/A';
  };

  const getRoomId = (mealId) => {
    const roomMapping = {
      'meal1': 'room1',
      'meal2': 'room2',
      'meal3': 'room3',
      'meal4': 'room4',
      'meal5': 'room1'
    };
    return roomMapping[mealId] || '';
  };

  const stats = getStats();
  const filteredShifts = getFilteredShifts();

  const statCards = [
    { title: 'Total Empleados', value: stats.totalEmployees, icon: FiUsers, color: 'blue' },
    { title: 'Turnos Hoy', value: stats.todayShifts, icon: FiClock, color: 'green' },
    { title: 'Total Turnos', value: stats.totalShifts, icon: FiCalendar, color: 'purple' },
    { title: 'Turnos Activos', value: stats.activeShifts, icon: FiTrendingUp, color: 'orange' }
  ];

  const updateShiftCapacity = (shiftId, newCapacity) => {
    setShiftsCapacity(prev => ({
      ...prev,
      [shiftId]: {
        ...prev[shiftId],
        capacity: parseInt(newCapacity, 10)
      }
    }));
  };

  const updateMealCapacity = (mealId, newCapacity) => {
    setMealCapacity(prev => ({
      ...prev,
      [mealId]: {
        ...prev[mealId],
        capacity: parseInt(newCapacity, 10)
      }
    }));
  };

  const updateRoomOccupancy = (roomId, newCount) => {
    setRoomOccupancy(prev => ({
      ...prev,
      [roomId]: parseInt(newCount, 10)
    }));
  };

  // Calculate max meal capacity based on room occupancy
  const calculateMealCapacity = (mealId) => {
    const roomId = getRoomId(mealId);
    if (!roomId) return 4; // Default max capacity
    
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

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            className="bg-white rounded-xl shadow-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                <SafeIcon icon={stat.icon} className={`text-2xl text-${stat.color}-600`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs for Shifts and Meal Times */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('shifts')}
            className={`flex-1 py-4 px-6 text-center font-medium ${
              activeTab === 'shifts'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <SafeIcon icon={FiClock} className="inline mr-2" />
            Gestión de Turnos
          </button>
          <button
            onClick={() => setActiveTab('meals')}
            className={`flex-1 py-4 px-6 text-center font-medium ${
              activeTab === 'meals'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <SafeIcon icon={FiUsers} className="inline mr-2" />
            Horarios de Comida
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex-1 py-4 px-6 text-center font-medium ${
              activeTab === 'rooms'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <SafeIcon icon={FiHome} className="inline mr-2" />
            Estado de Salas
          </button>
        </div>

        <div className="p-6">
          {/* Shifts Tab Content */}
          {activeTab === 'shifts' && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Gestión de Capacidad de Turnos
                </h2>
                <button
                  onClick={() => setShowCapacityModal(true)}
                  className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <SafeIcon icon={FiUsers} />
                  <span>Editar Capacidad</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(shiftsCapacity).map(([shiftId, data]) => (
                  <div key={shiftId} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{getShiftTime(shiftId)}</span>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        {data.current}/{data.capacity}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          data.current >= data.capacity ? 'bg-red-500' :
                          data.current >= data.capacity * 0.8 ? 'bg-orange-500' : 'bg-green-500'
                        }`} 
                        style={{ width: `${Math.min(100, (data.current / data.capacity) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meal Times Tab Content */}
          {activeTab === 'meals' && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Gestión de Horarios de Comida
                </h2>
                <button
                  onClick={() => setShowMealCapacityModal(true)}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <SafeIcon icon={FiUsers} />
                  <span>Editar Capacidad</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(mealCapacity).map(([mealId, data]) => {
                  const maxCapacity = calculateMealCapacity(mealId);
                  const roomId = getRoomId(mealId);
                  
                  return (
                    <div key={mealId} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{getMealTime(mealId)}</span>
                        <div className="flex items-center">
                          {roomId && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full mr-2">
                              {roomId}
                            </span>
                          )}
                          <span className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            {data.current}/{maxCapacity}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            data.current >= maxCapacity ? 'bg-red-500' :
                            data.current >= maxCapacity * 0.8 ? 'bg-orange-500' : 'bg-green-500'
                          }`} 
                          style={{ width: `${Math.min(100, (data.current / maxCapacity) * 100)}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Capacidad base: {data.capacity} | Capacidad ajustada: {maxCapacity}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Reglas de capacidad:</h3>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li>Capacidad máxima estándar: 4 guías por horario de comida</li>
                  <li>La capacidad se reduce si hay salas sin personal</li>
                  <li>Prioridad: Los turnos tempranos tienen acceso a todos los horarios de comida</li>
                  <li>Los turnos que comienzan a las 11:00 solo pueden acceder a horarios desde las 13:00</li>
                </ul>
              </div>
            </div>
          )}

          {/* Rooms Tab Content */}
          {activeTab === 'rooms' && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Estado de Ocupación de Salas
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(roomOccupancy).map(([roomId, count]) => (
                  <div key={roomId} className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">{roomId}</h3>
                      <span 
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          count === 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {count === 0 ? 'Sin personal' : `${count} persona${count > 1 ? 's' : ''}`}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>0</span>
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4+</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${count === 0 ? 'bg-red-500' : 'bg-green-500'}`} 
                          style={{ width: `${Math.min(100, count * 25)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {count === 0 ? (
                          <span className="text-red-600 font-medium">Se requiere al menos 1 persona en esta sala</span>
                        ) : (
                          <span>Horarios de comida asignados a esta sala:</span>
                        )}
                      </div>
                      <div>
                        <button
                          onClick={() => updateRoomOccupancy(roomId, Math.max(0, count - 1))}
                          className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded-l-md"
                        >
                          -
                        </button>
                        <button
                          onClick={() => updateRoomOccupancy(roomId, count + 1)}
                          className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded-r-md"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500">
                      {Object.entries(mealCapacity)
                        .filter(([mealId]) => getRoomId(mealId) === roomId)
                        .map(([mealId]) => (
                          <span key={mealId} className="inline-block bg-gray-100 rounded px-2 py-1 mr-1 mb-1">
                            {getMealTime(mealId)}
                          </span>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">Importante:</h3>
                <p className="text-sm text-yellow-700">
                  La capacidad máxima de los horarios de comida se ajusta automáticamente para garantizar que haya al menos 1 persona en cada sala en todo momento. Si una sala no tiene personal, la capacidad máxima de los horarios de comida se reduce.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filtros y Exportar */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Registro de Turnos
          </h2>
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiDownload} />
            <span>Exportar CSV</span>
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <SafeIcon icon={FiFilter} className="inline mr-1" />
              Filtrar por Fecha
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Empleado
            </label>
            <input
              type="text"
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              placeholder="Nombre o email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterDate('');
                setFilterEmployee('');
              }}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>

        {/* Tabla de turnos */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entrada
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Turno
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comida
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sala
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredShifts.map((shift, index) => (
                <motion.tr
                  key={shift.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {shift.employeeName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {shift.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(shift.date).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {shift.entryTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getShiftTime(shift.selectedShift)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getMealTime(shift.mealTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getRoomId(shift.mealTime) || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    <button
                      className="text-red-500 hover:text-red-700"
                      title="Eliminar registro"
                    >
                      <SafeIcon icon={FiTrash2} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredShifts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No se encontraron turnos registrados
            </div>
          )}
        </div>
      </div>

      {/* Modal de capacidad de turnos */}
      {showCapacityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-lg p-6 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-bold mb-4">Configurar Capacidad de Turnos</h3>
            
            <div className="space-y-4 mb-6">
              {Object.entries(shiftsCapacity).map(([shiftId, data]) => (
                <div key={shiftId} className="flex items-center justify-between">
                  <label className="font-medium">{getShiftTime(shiftId)}</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={data.capacity}
                    onChange={(e) => updateShiftCapacity(shiftId, e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded"
                  />
                </div>
              ))}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCapacityModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowCapacityModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
              >
                Guardar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de capacidad de horarios de comida */}
      {showMealCapacityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-lg p-6 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-bold mb-4">Configurar Capacidad de Horarios de Comida</h3>
            
            <div className="space-y-4 mb-6">
              {Object.entries(mealCapacity).map(([mealId, data]) => {
                const maxCapacity = calculateMealCapacity(mealId);
                const roomId = getRoomId(mealId);
                
                return (
                  <div key={mealId} className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium">{getMealTime(mealId)}</label>
                        {roomId && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            {roomId}
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={data.capacity}
                        onChange={(e) => updateMealCapacity(mealId, e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded"
                      />
                    </div>
                    {data.capacity !== maxCapacity && (
                      <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                        Capacidad ajustada a {maxCapacity} por distribución de salas
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700 mb-6">
              <p className="font-medium">Nota:</p>
              <p>La capacidad real puede ser reducida para garantizar que haya al menos 1 persona en cada sala.</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowMealCapacityModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowMealCapacityModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
              >
                Guardar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Dashboard;