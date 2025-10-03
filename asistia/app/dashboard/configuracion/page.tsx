"use client";
import React, { useState } from 'react';

export default function Configuracion() {
  const [schoolName, setSchoolName] = useState('Escuela Primaria');
  const [professorName, setProfessorName] = useState('Juan Pérez');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const saveSettings = () => {
    alert('Configuración guardada (simulado)');
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-blue-900">Configuración</h1>

      <label className="block mb-5">
        <span className="block font-semibold mb-2 text-blue-800">Nombre de la institución</span>
        <input
          type="text"
          className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
        />
      </label>

      <label className="block mb-5">
        <span className="block font-semibold mb-2 text-blue-800">Nombre del profesor</span>
        <input
          type="text"
          className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={professorName}
          onChange={(e) => setProfessorName(e.target.value)}
        />
      </label>

      <label className="flex items-center space-x-3 mb-8 text-blue-800">
        <input
          type="checkbox"
          checked={notificationsEnabled}
          onChange={(e) => setNotificationsEnabled(e.target.checked)}
          className="w-5 h-5 cursor-pointer"
        />
        <span>Habilitar notificaciones</span>
      </label>

      <button
        onClick={saveSettings}
        className="bg-blue-700 text-white px-6 py-3 rounded shadow hover:bg-blue-800 transition"
      >
        Guardar configuración
      </button>
    </div>
  );
}
