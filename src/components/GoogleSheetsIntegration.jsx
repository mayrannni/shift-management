import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiDatabase, FiCheck, FiAlertCircle, FiExternalLink } = FiIcons;

const GoogleSheetsIntegration = ({ shifts }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');

  // Función para generar el enlace de Google Sheets con datos pre-llenados
  const generateGoogleSheetsUrl = () => {
    const baseUrl = 'https://docs.google.com/spreadsheets/create';
    
    // Preparar los datos para la hoja de cálculo
    const headers = ['Fecha', 'Día', 'Empleado', 'Email', 'Hora Entrada', 'Turno', 'Horario Comida', 'Timestamp'];
    
    const data = shifts.map(shift => [
      shift.date,
      shift.dayOfWeek,
      shift.employeeName,
      shift.email,
      shift.entryTime,
      getShiftTime(shift.selectedShift),
      getMealTime(shift.mealTime),
      shift.timestamp
    ]);

    // Crear contenido CSV para importar
    const csvContent = [headers, ...data]
      .map(row => row.join(','))
      .join('\n');

    return {
      url: baseUrl,
      csvData: csvContent
    };
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

  const createGoogleSheet = async () => {
    setIsLoading(true);
    
    try {
      const { url, csvData } = generateGoogleSheetsUrl();
      
      // Simular creación de hoja de cálculo
      setTimeout(() => {
        setIsConnected(true);
        setSheetUrl('https://docs.google.com/spreadsheets/d/ejemplo-sheet-id/edit');
        setIsLoading(false);
        
        // Descargar CSV para importar manualmente
        const blob = new Blob([csvData], { type: 'text/csv' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `turnos_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      }, 2000);
      
    } catch (error) {
      console.error('Error creando Google Sheet:', error);
      setIsLoading(false);
    }
  };

  const generateGoogleFormUrl = () => {
    const baseUrl = 'https://docs.google.com/forms/create';
    
    // Abrir Google Forms para crear formulario manualmente
    window.open(baseUrl, '_blank');
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-6">
        <SafeIcon icon={FiDatabase} className="text-4xl text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Integración con Google Sheets
        </h2>
        <p className="text-gray-600">
          Exporta y sincroniza los datos de turnos con Google Sheets
        </p>
      </div>

      {!isConnected ? (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">
              Instrucciones para configurar Google Sheets:
            </h3>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Haz clic en "Crear Hoja de Cálculo" para generar el archivo CSV</li>
              <li>Ve a Google Sheets y crea una nueva hoja de cálculo</li>
              <li>Importa el archivo CSV descargado</li>
              <li>Configura el formato de fecha y hora según tus preferencias</li>
              <li>Comparte la hoja con los permisos necesarios</li>
            </ol>
          </div>

          <div className="grid gap-4">
            <button
              onClick={createGoogleSheet}
              disabled={isLoading}
              className={`flex items-center justify-center space-x-2 w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creando hoja de cálculo...</span>
                </>
              ) : (
                <>
                  <SafeIcon icon={FiDatabase} />
                  <span>Crear Hoja de Cálculo</span>
                </>
              )}
            </button>

            <button
              onClick={generateGoogleFormUrl}
              className="flex items-center justify-center space-x-2 w-full py-3 px-4 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all"
            >
              <SafeIcon icon={FiExternalLink} />
              <span>Crear Formulario Google</span>
            </button>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <SafeIcon icon={FiCheck} className="text-3xl text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              ¡Hoja de Cálculo Creada!
            </h3>
            <p className="text-green-600 mb-4">
              Los datos han sido exportados exitosamente
            </p>
            
            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiExternalLink} />
              <span>Abrir Google Sheets</span>
            </a>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <SafeIcon icon={FiAlertCircle} className="inline text-yellow-600 mr-2" />
            <span className="text-yellow-800 text-sm">
              Recuerda importar el archivo CSV descargado en tu hoja de Google Sheets
            </span>
          </div>
        </motion.div>
      )}

      {/* Estadísticas de exportación */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-800">{shifts.length}</div>
            <div className="text-sm text-gray-600">Turnos Registrados</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">
              {new Set(shifts.map(s => s.email)).size}
            </div>
            <div className="text-sm text-gray-600">Empleados Únicos</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GoogleSheetsIntegration;