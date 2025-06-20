import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { FileText, Plus, Calendar, Users, DollarSign } from 'lucide-react';
import { toast } from 'react-toastify';

interface Member {
  id: string;
  name: string;
  flat_number: string;
}

const GenerateBills: React.FC = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [billData, setBillData] = useState({
    amount: '',
    month: '',
    year: new Date().getFullYear(),
    due_date: ''
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchMembers();
    }
  }, [isAdmin]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('id, name, flat_number')
        .order('flat_number');

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBills = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    setGenerating(true);

    try {
      const billsToInsert = members.map(member => ({
        member_id: member.id,
        amount: parseFloat(billData.amount),
        month: billData.month,
        year: billData.year,
        due_date: billData.due_date,
        status: 'unpaid'
      }));

      const { error } = await supabase
        .from('maintenance_bills')
        .insert(billsToInsert);

      if (error) throw error;

      toast.success(`Successfully generated ${members.length} bills for ${billData.month} ${billData.year}`);
      setBillData({
        amount: '',
        month: '',
        year: new Date().getFullYear(),
        due_date: ''
      });
    } catch (error) {
      console.error('Error generating bills:', error);
      toast.error('Failed to generate bills. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-500">Only administrators can generate bills.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Plus className="h-8 w-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Generate Bills</h1>
      </div>

      {/* Summary Card */}
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
        <div className="flex items-center space-x-4">
          <Users className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Ready to Generate</h3>
            <p className="text-blue-700">Bills will be generated for {members.length} members</p>
          </div>
        </div>
      </div>

      {/* Generate Bills Form */}
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Bill Details</h2>
        
        <form onSubmit={handleGenerateBills} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₹)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="number"
                  step="0.01"
                  value={billData.amount}
                  onChange={(e) => setBillData({ ...billData, amount: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter maintenance amount"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month
              </label>
              <select
                value={billData.month}
                onChange={(e) => setBillData({ ...billData, month: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Month</option>
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <input
                type="number"
                value={billData.year}
                onChange={(e) => setBillData({ ...billData, year: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="2020"
                max="2030"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="date"
                  value={billData.due_date}
                  onChange={(e) => setBillData({ ...billData, due_date: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <button
              type="submit"
              disabled={generating}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                generating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {generating ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Generating Bills...</span>
                </div>
              ) : (
                `Generate Bills for ${members.length} Members`
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Members Preview */}
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Members ({members.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="bg-blue-100 p-2 rounded-full">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{member.name}</p>
                <p className="text-xs text-gray-500">Flat {member.flat_number}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GenerateBills;