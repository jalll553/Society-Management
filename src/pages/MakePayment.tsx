import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { CreditCard, Calendar, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

interface UnpaidBill {
  id: string;
  amount: number;
  due_date: string;
  month: string;
  year: number;
  member: {
    name: string;
    flat_number: string;
  };
}

const MakePayment: React.FC = () => {
  const { user } = useAuth();
  const [unpaidBills, setUnpaidBills] = useState<UnpaidBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [transactionId, setTransactionId] = useState('');
  const [processing, setProcessing] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchUnpaidBills();
  }, []);

  const fetchUnpaidBills = async () => {
    try {
      let query = supabase
        .from('maintenance_bills')
        .select(`
          *,
          member:members(name, flat_number)
        `)
        .eq('status', 'unpaid')
        .order('due_date', { ascending: true });

      // If not admin, only show bills for the current user's member record
      if (!isAdmin) {
        const { data: memberData } = await supabase
          .from('members')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (memberData) {
          query = query.eq('member_id', memberData.id);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setUnpaidBills(data || []);
    } catch (error) {
      console.error('Error fetching unpaid bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return;

    setProcessing(true);

    try {
      const selectedBillData = unpaidBills.find(bill => bill.id === selectedBill);
      if (!selectedBillData) throw new Error('Bill not found');

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          bill_id: selectedBill,
          amount: selectedBillData.amount,
          payment_date: new Date().toISOString(),
          payment_method: paymentMethod,
          transaction_id: transactionId || `TXN${Date.now()}`
        }]);

      if (paymentError) throw paymentError;

      // Update bill status to paid
      const { error: billError } = await supabase
        .from('maintenance_bills')
        .update({ status: 'paid' })
        .eq('id', selectedBill);

      if (billError) throw billError;

      // Reset form and refresh data
      setSelectedBill(null);
      setTransactionId('');
      fetchUnpaidBills();
      
      alert('Payment successful!');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const getTotalAmount = () => {
    return unpaidBills.reduce((sum, bill) => sum + Number(bill.amount), 0);
  };

  const getSelectedBillAmount = () => {
    if (!selectedBill) return 0;
    const bill = unpaidBills.find(b => b.id === selectedBill);
    return bill ? Number(bill.amount) : 0;
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
        <CreditCard className="h-8 w-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Make Payment</h1>
      </div>

      {unpaidBills.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">All bills are paid!</h3>
          <p className="text-gray-500">You have no outstanding maintenance bills.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Unpaid Bills List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Outstanding Bills</h2>
            
            {/* Summary Card */}
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-sm font-medium text-red-800">
                  Total Outstanding: ₹{getTotalAmount().toLocaleString()}
                </span>
              </div>
            </div>

            {/* Bills List */}
            <div className="space-y-3">
              {unpaidBills.map((bill) => (
                <div
                  key={bill.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedBill === bill.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedBill(bill.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {bill.month} {bill.year}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {bill.member.name} - Flat {bill.member.flat_number}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                        <Calendar size={14} />
                        <span>Due: {new Date(bill.due_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        ₹{Number(bill.amount).toLocaleString()}
                      </div>
                      {new Date(bill.due_date) < new Date() && (
                        <span className="text-xs text-red-600 font-medium">Overdue</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
            
            {!selectedBill ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a bill to make payment</p>
              </div>
            ) : (
              <form onSubmit={handlePayment} className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-800">Amount to Pay:</span>
                    <span className="text-xl font-bold text-blue-900">
                      ₹{getSelectedBillAmount().toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="online">Online Payment</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction ID if available"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    processing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {processing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    `Pay ₹${getSelectedBillAmount().toLocaleString()}`
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MakePayment;