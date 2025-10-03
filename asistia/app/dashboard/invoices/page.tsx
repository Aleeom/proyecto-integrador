
"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';

type Report = {
  id: number;
  studentName: string;
  date: string;
  status: string;
};

export default function Reportes() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchReports = () => {
    const params: any = {};
    if (filterDate) params.date = filterDate;
    if (filterStatus) params.status = filterStatus;

    setLoading(true);
    axios.get<Report[]>('http://localhost:4000/api/reports', { params })
      .then(res => setReports(res.data))
      .catch(() => alert('Error cargando reportes'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-blue-900">Reportes de asistencia</h1>

      <div className="flex flex-wrap gap-4 mb-8 items-center">
        <input
          type="date"
          className="border border-blue-300 rounded px-3 py-2"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <select
          className="border border-blue-300 rounded px-3 py-2"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="PRESENT">Presente</option>
          <option value="ABSENT">Ausente</option>
          <option value="LATE">Tarde</option>
        </select>
        <button
          className="bg-blue-700 text-white px-5 py-2 rounded hover:bg-blue-800 transition"
          onClick={fetchReports}
        >
          Filtrar
        </button>
      </div>

      {loading ? (
        <p>Cargando reportes...</p>
      ) : reports.length === 0 ? (
        <p className="text-blue-500 italic">No hay datos que mostrar.</p>
      ) : (
        <table className="w-full border-collapse border border-blue-200 rounded-lg overflow-hidden">
          <thead className="bg-blue-100 text-blue-900 font-semibold">
            <tr>
              <th className="p-3 border border-blue-300">Alumno</th>
              <th className="p-3 border border-blue-300">Fecha</th>
              <th className="p-3 border border-blue-300">Estado</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(({ id, studentName, date, status }) => (
              <tr key={id} className="hover:bg-blue-50 transition-colors">
                <td className="p-3 border border-blue-300">{studentName}</td>
                <td className="p-3 border border-blue-300">{date}</td>
                <td className="p-3 border border-blue-300">{status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
