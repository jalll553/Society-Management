// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    pendingComplaints: 0,
    unpaidBills: 0,
    totalNotices: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        const { count: totalMembers } = await supabase
          .from('members')
          .select('*', { count: 'exact', head: true });

        const { count: pendingComplaints } = await supabase
          .from('complaints')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        const { count: unpaidBills } = await supabase
          .from('maintenance_bills')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'unpaid');

        const { count: totalNotices } = await supabase
          .from('notices')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalMembers: totalMembers || 0,
          pendingComplaints: pendingComplaints || 0,
          unpaidBills: unpaidBills || 0,
          totalNotices: totalNotices || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Welcome, {user?.email}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-lg font-semibold">Total Members</h2>
          <p className="text-3xl">{stats.totalMembers}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-lg font-semibold">Pending Complaints</h2>
          <p className="text-3xl">{stats.pendingComplaints}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-lg font-semibold">Unpaid Bills</h2>
          <p className="text-3xl">{stats.unpaidBills}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-lg font-semibold">Total Notices</h2>
          <p className="text-3xl">{stats.totalNotices}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
