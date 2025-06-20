import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Plus, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const CreateNotice: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({
    title: '',
    content: ''
  });

  const isAdmin = user?.role === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('notices')
        .insert([{
          ...notice,
          created_by: user.id
        }]);

      if (error) throw error;

      toast.success('Notice created successfully!');
      navigate('/notices');
    } catch (error) {
      console.error('Error creating notice:', error);
      toast.error('Failed to create notice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-500">Only administrators can create notices.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Plus className="h-8 w-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Create Notice</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notice Title
            </label>
            <input
              type="text"
              value={notice.title}
              onChange={(e) => setNotice({ ...notice, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter notice title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notice Content
            </label>
            <textarea
              value={notice.content}
              onChange={(e) => setNotice({ ...notice, content: e.target.value })}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Enter notice content..."
              required
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Notice'
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/notices')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Preview */}
      {(notice.title || notice.content) && (
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
          <div className="border border-gray-200 rounded-lg p-4">
            {notice.title && (
              <h4 className="text-xl font-semibold text-gray-900 mb-3">{notice.title}</h4>
            )}
            {notice.content && (
              <p className="text-gray-700 whitespace-pre-wrap">{notice.content}</p>
            )}
            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-4 pt-4 border-t border-gray-200">
              <span>Posted by {user?.email}</span>
              <span>•</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateNotice;