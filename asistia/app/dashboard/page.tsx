"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2'; // npm i react-chartjs-2 chart.js

type DashboardData = {
  presentCount: number;
  absentCount: number;
  lateCount: number;
  recentAlerts: number;
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:4000/api/dashboard')
      .then(res => setData(res.data))
      .catch(() => alert('Error cargando dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6">Cargando datos...</p>;
  if (!data) return <p className="p-6">No hay datos</p>;

  const chartData = {
    labels: ['Presentes', 'Ausentes', 'Tarde'],
    datasets: [
      {
        label: 'Alumnos',
        data: [data.presentCount, data.absentCount, data.lateCount],
        backgroundColor: ['#2563EB', '#3B82F6', '#60A5FA'],
      },
    ],
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8 text-blue-900">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-blue-600 rounded-lg shadow-lg p-6 text-white flex flex-col justify-center">
          <p className="text-lg font-semibold">Alumnos Presentes</p>
          <p className="text-4xl font-bold mt-2">{data.presentCount}</p>
        </div>
        <div className="bg-blue-400 rounded-lg shadow-lg p-6 text-white flex flex-col justify-center">
          <p className="text-lg font-semibold">Alumnos Ausentes</p>
          <p className="text-4xl font-bold mt-2">{data.absentCount}</p>
        </div>
        <div className="bg-blue-500 rounded-lg shadow-lg p-6 text-white flex flex-col justify-center">
          <p className="text-lg font-semibold">Llegadas Tarde</p>
          <p className="text-4xl font-bold mt-2">{data.lateCount}</p>
        </div>
        <div className="bg-blue-700 rounded-lg shadow-lg p-6 text-white flex flex-col justify-center">
          <p className="text-lg font-semibold">Alertas Recientes</p>
          <p className="text-4xl font-bold mt-2">{data.recentAlerts}</p>
        </div>
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-blue-800">Resumen de asistencia (última semana)</h2>
        <div className="w-full max-w-3xl h-64 bg-blue-50 rounded-lg flex items-center justify-center">
          <Bar data={chartData} />
        </div>
      </section>
    </div>
  );
}
