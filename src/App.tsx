import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Maintenance from './pages/Maintenance';
import ViewBills from './pages/maintenance/ViewBills';
import GenerateBills from './pages/maintenance/GenerateBills';
import Payments from './pages/maintenance/Payments';
import Notices from './pages/Notices';
import ViewNotices from './pages/notices/ViewNotices';
import CreateNotice from './pages/notices/CreateNotice';
import Complaints from './pages/Complaints';
import AllComplaints from './pages/complaints/AllComplaints';
import SubmitComplaint from './pages/complaints/SubmitComplaint';
import MakePayment from './pages/MakePayment';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="members" element={<Members />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="maintenance/bills" element={<ViewBills />} />
            <Route path="maintenance/generate" element={<GenerateBills />} />
            <Route path="maintenance/payments" element={<Payments />} />
            <Route path="notices" element={<ViewNotices />} />
            <Route path="notices/create" element={<CreateNotice />} />
            <Route path="complaints" element={<AllComplaints />} />
            <Route path="complaints/create" element={<SubmitComplaint />} />
            <Route path="payment" element={<MakePayment />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

export default App;