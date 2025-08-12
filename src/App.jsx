import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './components/Header';
import ShiftForm from './components/ShiftForm';
import Dashboard from './components/Dashboard';
import Calendar from './components/Calendar';
import GoogleSheetsIntegration from './components/GoogleSheetsIntegration';
import './App.css';

// Firebase imports
import { db } from './common/firebase';
import { collection, addDoc, getDocs, onSnapshot } from "firebase/firestore";

function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [shifts, setShifts] = useState([]);

  // Leer datos en tiempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "shifts"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setShifts(data);
    });

    return () => unsubscribe();
  }, []);

  // Actualizar hora cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const addShift = async (shiftData) => {
    try {
      await addDoc(collection(db, "shifts"), {
        ...shiftData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error añadiendo turno:", error);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header currentTime={currentTime} />
        
        <motion.main 
          className="container mx-auto px-4 py-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Routes>
            <Route 
              path="/" 
              element={<ShiftForm currentTime={currentTime} onSubmit={addShift} />} 
            />
            <Route path="/dashboard" element={<Dashboard shifts={shifts} />} />
            <Route path="/calendar" element={<Calendar shifts={shifts} />} />
            <Route path="/google-integration" element={<GoogleSheetsIntegration shifts={shifts} />} />
          </Routes>
        </motion.main>
      </div>
    </Router>
  );
}

export default App;
