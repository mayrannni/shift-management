import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiClock, FiCalendar, FiBarChart3, FiHome, FiDatabase } = FiIcons;

const Header = ({ currentTime }) => {
  const location = useLocation();

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const navItems = [
    { path: '/', label: 'Registro', icon: FiHome },
    { path: '/dashboard', label: 'Dashboard', icon: FiBarChart3 },
    { path: '/calendar', label: 'Calendario', icon: FiCalendar },
    { path: '/google-integration', label: 'Google Sheets', icon: FiDatabase }
  ];

  return (
    <motion.header 
      className="bg-white shadow-lg border-b border-gray-200"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <SafeIcon icon={FiClock} className="text-2xl text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-800">
                Control de Turnos
              </h1>
            </motion.div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-800">
                {formatTime(currentTime)}
              </div>
              <div className="text-sm text-gray-600">
                {formatDate(currentTime)}
              </div>
            </div>
          </div>
        </div>

        <nav className="mt-4 overflow-x-auto">
          <div className="flex space-x-1 min-w-max">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <SafeIcon icon={item.icon} className="text-lg" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;