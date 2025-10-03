import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './Dashboard';
import TakeAttendance from './TakeAttendance';
import Reports from './Reports';
import Login from './Login';

export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <nav style={{ marginBottom: 20 }}>
        <Link to='/'>Dashboard</Link> | <Link to='/take'>Tomar asistencia</Link> | <Link to='/reports'>Reportes</Link>
      </nav>
      <Routes>
        <Route path='/' element={<Dashboard />} />
        <Route path='/take' element={<TakeAttendance />} />
        <Route path='/reports' element={<Reports />} />
        <Route path='/login' element={<Login />} />
      </Routes>
    </div>
  );
}
