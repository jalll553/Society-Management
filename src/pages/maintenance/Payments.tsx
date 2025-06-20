import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { CreditCard, Calendar, DollarSign, FileText, CheckCircle } from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  transaction_id: string;
  created_at: string;
  bill: {
    month: string;
    year: number;
    member: {
      name: string;
      flat_number: string;
    };
  };
}

const Payments: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'online' | 'bank_transfer' | 'cash' | 'cheque'>('all');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      let query = supabase
        .from('payments')
        .select(`
          *,
          bill:maintenance_bills(
            month,
            year,
            member:members(name, flat_number)
          )
        `)
        .order('payment_date', { ascending: false });

      // If not admin, only show payments for the current user's bills
      if (!isAdmin) {
        const { data: memberData } = await supabase
          .from('members')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (memberData) {
          const { data: billsData } = await supabase
            .from('maintenance_bills')
            .select('id')
            .eq('member_id', memberData.id);

          if (billsData && billsData.length > 0) {
            const billIds = billsData.map(bill => bill.id);
            query = query.in('bill_id', billIds);
          }
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'online':
        return 'bg-blue-100 text-blue-800';
      case 'bank_transfer':
        return 'bg-green-100 text-green-800';
      case 'cash':
        return 'bg-yellow-100 text-yellow-800';
      case 'cheque':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    return payment.payment_method === filter;
  });

  const totalAmount = filteredPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);

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
        <CreditCard className="h-8 w-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
      </div>

      {/* Summary Card */}
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Payments</p>
            <p className="text-3xl font-bold text-green-600">₹{totalAmount.toLocaleString()}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{filteredPayments.length}</p>
              <p className="text-sm text-gray-500">Transactions</p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Payments
        </button>
        <button
          onClick={() => setFilter('online')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'online'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Online
        </button>
        <button
          onClick={() => setFilter('bank_transfer')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'bank_transfer'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Bank Transfer
        </button>
        <button
          onClick={() => setFilter('cash')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'cash'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Cash
        </button>
        <button
          onClick={() => setFilter('cheque')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'cheque'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Cheque
        </button>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-lg shadow-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member & Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{payment.bill.member.name}</div>
                      <div className="text-sm text-gray-500">
                        Flat {payment.bill.member.flat_number} • {payment.bill.month} {payment.bill.year}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">₹{Number(payment.amount).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentMethodColor(payment.payment_method)}`}>
                      {payment.payment_method.replace('_', ' ').charAt(0).toUpperCase() + payment.payment_method.replace('_', ' ').slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">{payment.transaction_id}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredPayments.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
          <p className="text-gray-500">No payment records match your current filter.</p>
        </div>
      )}
    </div>
  );
};

export default Payments;