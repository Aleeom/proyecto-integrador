import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [students, setStudents] = useState<any[]>([]);
  useEffect(() => {
    axios.get(import.meta.env.VITE_API_URL + '/students')
      .then(res => setStudents(res.data))
      .catch(err => console.error(err));
  }, []);
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Alumnos (ejemplo):</p>
      <ul>
        {students.map(s => <li key={s.Id}>{s.Name} (RFID: {s.RfId})</li>)}
      </ul>
    </div>
  );
}
