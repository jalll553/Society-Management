import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Plus, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const SubmitComplaint: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [complaint, setComplaint] = useState({
    title: '',
    description: ''
  });

  const isAdmin = user?.role === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdmin) return; // Only members can submit complaints

    setLoading(true);

    try {
      // First get the member record for the current user
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (memberError) throw memberError;

      const { error } = await supabase
        .from('complaints')
        .insert([{
          ...complaint,
          member_id: memberData.id
        }]);

      if (error) throw error;

      toast.success('Complaint submitted successfully!');
      navigate('/complaints');
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast.error('Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isAdmin) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-500">Only members can submit complaints.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Plus className="h-8 w-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Submit Complaint</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Complaint Title
            </label>
            <input
              type="text"
              value={complaint.title}
              onChange={(e) => setComplaint({ ...complaint, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter a brief title for your complaint"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={complaint.description}
              onChange={(e) => setComplaint({ ...complaint, description: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Describe your complaint in detail..."
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
                  <span>Submitting...</span>
                </div>
              ) : (
                'Submit Complaint'
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/complaints')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Guidelines */}
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Complaint Guidelines</h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Be specific and clear about the issue you're facing</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Include relevant details like location, time, and people involved</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Use respectful language when describing the problem</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>You will receive updates on the status of your complaint</span>
          </li>
        </ul>
      </div>

      {/* Preview */}
      {(complaint.title || complaint.description) && (
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
          <div className="border border-gray-200 rounded-lg p-4">
            {complaint.title && (
              <h4 className="text-xl font-semibold text-gray-900 mb-3">{complaint.title}</h4>
            )}
            {complaint.description && (
              <p className="text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
            )}
            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-4 pt-4 border-t border-gray-200">
              <span>Submitted by {user?.email}</span>
              <span>•</span>
              <span>{new Date().toLocaleDateString()}</span>
              <span>•</span>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                Pending
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmitComplaint;