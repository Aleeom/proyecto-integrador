"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

type Student = {
  id: number;
  name: string;
  status: "PRESENT" | "ABSENT" | "LATE" | null;
};

export default function Asistencia() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get<Student[]>("http://localhost:4000/api/attendance/today")
      .then((res) => setStudents(res.data))
      .catch(() => alert("Error cargando lista de asistencia"))
      .finally(() => setLoading(false));
  }, []);

  const markStatus = (id: number, status: Student["status"]) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

 const saveAttendance = () => {
  axios
    .post("http://localhost:4000/api/attendance/saveManual", students)
    .then(() => alert("Asistencia guardada"))
    .catch(() => alert("Error al guardar asistencia"));
};


  if (loading) return <p className="p-6">Cargando alumnos...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-blue-900">Tomar asistencia</h1>

      <table className="w-full border-collapse border border-blue-200 rounded-lg overflow-hidden">
        <thead className="bg-blue-100 text-blue-900 font-semibold">
          <tr>
            <th className="p-3 border border-blue-300">Alumno</th>
            <th className="p-3 border border-blue-300">Presente</th>
            <th className="p-3 border border-blue-300">Tarde</th>
            <th className="p-3 border border-blue-300">Ausente</th>
          </tr>
        </thead>
        <tbody>
          {students.map(({ id, name, status }) => (
            <tr key={id} className="hover:bg-blue-50 transition-colors">
              <td className="p-3 border border-blue-300">{name}</td>
              {["PRESENT", "LATE", "ABSENT"].map((s) => (
                <td key={s} className="p-3 border border-blue-300 text-center">
                  <input
                    type="radio"
                    name={`status-${id}`}
                    checked={status === s}
                    onChange={() => markStatus(id, s as Student["status"])}
                    className="cursor-pointer"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <button
        className="mt-8 bg-blue-700 text-white px-6 py-3 rounded shadow hover:bg-blue-800 transition"
        onClick={saveAttendance}
      >
        Guardar asistencia
      </button>
    </div>
  );
}
