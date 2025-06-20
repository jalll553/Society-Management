import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Bell, Calendar, User } from 'lucide-react';

interface Notice {
  id: string;
  title: string;
  content: string;
  created_at: string;
  created_by: string;
  creator: {
    email: string;
  };
}

const ViewNotices: React.FC = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const { data, error } = await supabase
        .from('notices')
        .select(`
          *,
          creator:users!notices_created_by_fkey(email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotices(data || []);
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Bell className="h-8 w-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Society Notices</h1>
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {notices.map((notice) => (
          <div key={notice.id} className="bg-white p-6 rounded-lg shadow-md border hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{notice.title}</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar size={16} />
                <span>{new Date(notice.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="prose max-w-none mb-4">
              <p className="text-gray-700 whitespace-pre-wrap">{notice.content}</p>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500 pt-4 border-t border-gray-200">
              <User size={16} />
              <span>Posted by {notice.creator.email}</span>
            </div>
          </div>
        ))}
      </div>

      {notices.length === 0 && (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notices yet</h3>
          <p className="text-gray-500">No notices have been posted yet.</p>
        </div>
      )}
    </div>
  );
};

export default ViewNotices;