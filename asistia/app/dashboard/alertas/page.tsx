"use client";
import React, { useEffect, useState } from "react";

type Llegada = {
  id: number;
  studentName: string;
  arrivalTime: string | null;
  status: "PRESENT" | "LATE" | "ABSENT";
  mensajeEnviado?: boolean;
};

export default function RegistrosLlegada() {
  const [registros, setRegistros] = useState<Llegada[]>([]);
  const [idLoading, setIdLoading] = useState<number | "salida" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  const fetchRegistros = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/attendance/today");
      if (!res.ok) throw new Error("Error al cargar los registros");
      const data = await res.json();

      setRegistros(
        data.map((alumno: any) => ({
          id: alumno.id,
          studentName: alumno.name,
          arrivalTime: alumno.arrivalTime || null,
          status: alumno.status as "PRESENT" | "LATE" | "ABSENT",
          mensajeEnviado: false,
        }))
      );
    } catch (e: any) {
      setError(e.message || "Error desconocido");
    }
  };

  fetchRegistros();
}, []);

  const formatFechaHora = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString([], {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const marcarLlegada = async (id: number) => {
    setIdLoading(id);
    setError(null);

    const alumno = registros.find((r) => r.id === id);
    if (!alumno) {
      setError("Alumno no encontrado");
      setIdLoading(null);
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/llegada", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alumnoId: id }),
      });
      if (!res.ok) throw new Error("Error al registrar llegada");

      const horaActual = new Date().toISOString();

      setRegistros((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: "PRESENT", arrivalTime: horaActual, mensajeEnviado: true }
            : r
        )
      );
    } catch (e: any) {
      setError(e.message || "Error desconocido");
    } finally {
      setIdLoading(null);
    }
  };

  const marcarSalidasGlobal = async () => {
    setIdLoading("salida");
    setError(null);

    const alumnosParaSalida = registros.filter(
      (r) => r.status === "PRESENT" || r.status === "LATE"
    );

    try {
      await Promise.all(
        alumnosParaSalida.map((alumno) =>
          fetch("http://localhost:4000/salida", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ alumnoId: alumno.id }),
          })
        )
      );

      const horaActual = new Date().toISOString();
      setRegistros((prev) =>
        prev.map((r) =>
          r.status === "PRESENT" || r.status === "LATE"
            ? { ...r, arrivalTime: horaActual, mensajeEnviado: true }
            : r
        )
      );
    } catch (e: any) {
      setError(e.message || "Error desconocido al registrar salidas");
    } finally {
      setIdLoading(null);
    }
  };

  const getColorForStatus = (status: Llegada["status"]) => {
    switch (status) {
      case "PRESENT":
        return "text-green-600";
      case "LATE":
        return "text-yellow-600";
      case "ABSENT":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-blue-900">Registros de llegada</h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <table className="w-full border-collapse border border-blue-300 rounded-lg overflow-hidden">
        <thead className="bg-blue-100 text-blue-900 font-semibold">
          <tr>
            <th className="p-3 border border-blue-300">Alumno</th>
            <th className="p-3 border border-blue-300">Hora de llegada</th>
            <th className="p-3 border border-blue-300">Estado</th>
            <th className="p-3 border border-blue-300">Acción</th>
          </tr>
        </thead>
        <tbody>
          {registros.map(({ id, studentName, arrivalTime, status, mensajeEnviado }) => (
            <tr key={id} className="hover:bg-blue-50 transition-colors">
              <td className="p-3 border border-blue-300">{studentName}</td>
              <td className="p-3 border border-blue-300">{formatFechaHora(arrivalTime)}</td>
              <td className={`p-3 border border-blue-300 font-semibold ${getColorForStatus(status)}`}>
                {status}
              </td>
              <td className="p-3 border border-blue-300 text-center">
                {!mensajeEnviado ? (
                  <button
                    onClick={() => marcarLlegada(id)}
                    disabled={idLoading === id || idLoading === "salida"}
                    className="bg-blue-700 text-white px-3 py-1 rounded hover:bg-blue-800 transition disabled:opacity-50"
                  >
                    {idLoading === id ? "Registrando..." : "Marcar llegada"}
                  </button>
                ) : (
                  <span className="text-green-600 font-semibold">Mensaje enviado</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Botón global para marcar salida */}
      <div className="mt-6 text-center">
        <button
          onClick={marcarSalidasGlobal}
          disabled={idLoading !== null}
          className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 transition disabled:opacity-50"
        >
          {idLoading === "salida" ? "Registrando salidas..." : "Marcar salidas"}
        </button>
      </div>
    </div>
  );
}
