import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { CreditCard, DollarSign, CheckCircle2, AlertTriangle, Receipt, Download, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import StatCard from '../components/common/StatCard';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';

const StudentFeePage = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFee, setSelectedFee] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');

  useEffect(() => {
    loadFees();
  }, []);

  const loadFees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/fees/my-fees');
      if (res.data?.success) {
        setFees(res.data.data || []);
      }
    } catch (e) {
      toast.error('Failed to load fee ledger');
    } finally {
      setLoading(false);
    }
  };

  const totalBilled = fees.reduce((sum, f) => sum + Number(f.totalAmount || 0), 0);
  const totalPaid = fees.reduce((sum, f) => sum + Number(f.paidAmount || 0), 0);
  const balanceDue = totalBilled - totalPaid;

  const handlePay = async (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }
    try {
      const res = await api.post('/fees/payments', {
        studentFeeId: selectedFee.id,
        amount: Number(payAmount),
        paymentMethod: 'ONLINE',
        transactionReference: `PORTAL-TXN-${Date.now()}`
      });
      if (res.data?.success) {
        toast.success('Tuition payment processed successfully! Receipt issued.');
        setShowPayModal(false);
        loadFees();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Payment failed');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="card-premium p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#E3E1D6]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-[#52613B] bg-[#E4EAD9] px-2.5 py-0.5 rounded-full border border-[#CAD6B7]">
              Student Finance
            </span>
            <span className="text-xs text-[#555B50] font-semibold">Tuition & Invoicing Statement</span>
          </div>
          <h2 className="text-xl font-bold text-[#242820] mt-1 tracking-tight">Fee Ledger & Payment Portal</h2>
          <p className="text-xs text-[#555B50] font-medium mt-0.5">
            Review academic tuition invoices, track clearance status, and make online fee payments.
          </p>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Invoiced"
          value={`$${totalBilled.toLocaleString()}`}
          icon={DollarSign}
          subtitle="Cumulative curriculum fees"
        />
        <StatCard
          title="Total Paid"
          value={`$${totalPaid.toLocaleString()}`}
          icon={CheckCircle2}
          trend="up"
          change="Cleared payments"
        />
        <StatCard
          title="Outstanding Balance"
          value={`$${balanceDue.toLocaleString()}`}
          icon={AlertTriangle}
          trend={balanceDue > 0 ? 'down' : 'up'}
          change={balanceDue === 0 ? 'All fees settled' : 'Payment required'}
        />
      </div>

      {/* Invoice Ledger Table */}
      <div className="card-premium overflow-hidden border border-[#E3E1D6]">
        <div className="p-4 border-b border-[#E3E1D6] bg-[#F0EFE6]/60 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#242820]">Statement of Account & Invoices</h3>
          <span className="text-xs text-[#52613B] font-bold">{fees.length} Invoices</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E3E1D6] text-left text-xs">
            <thead className="bg-[#F8F7F2] text-[#555B50] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Invoice #</th>
                <th className="px-4 py-3.5">Description</th>
                <th className="px-4 py-3.5 text-center">Due Date</th>
                <th className="px-4 py-3.5 text-right">Billed Amount</th>
                <th className="px-4 py-3.5 text-right">Paid Amount</th>
                <th className="px-4 py-3.5 text-right">Remaining Balance</th>
                <th className="px-4 py-3.5 text-center">Clearance Status</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E1D6] bg-white">
              {fees.length > 0 ? (
                fees.map((f) => (
                  <tr key={f.id} className="hover:bg-[#F8F7F2] transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-[#52613B]">{f.invoiceNumber}</td>
                    <td className="px-4 py-3.5 text-[#242820] font-medium">{f.feeTitle}</td>
                    <td className="px-4 py-3.5 text-center text-[#555B50] font-medium">{f.dueDate}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-[#242820]">${f.totalAmount}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-[#52613B]">${f.paidAmount}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-[#B84040]">
                      ${f.balanceAmount}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge variant={f.status === 'PAID' ? 'olive' : 'gold'}>{f.status}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {f.status !== 'PAID' ? (
                        <button
                          onClick={() => {
                            setSelectedFee(f);
                            setPayAmount(f.balanceAmount);
                            setShowPayModal(true);
                          }}
                          className="btn-primary text-xs font-bold py-1 px-3"
                        >
                          Pay Dues
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-[#52613B] flex items-center justify-end space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Cleared</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#74796D] font-medium">
                    No fee invoices issued for your account.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Modal */}
      <Modal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        title={`Settle Tuition: ${selectedFee?.invoiceNumber}`}
      >
        <form onSubmit={handlePay} className="space-y-4">
          <div className="p-3 bg-[#F0EFE6]/60 rounded-xl border border-[#E3E1D6] text-xs space-y-1">
            <p className="text-[#555B50]">
              Invoice: <strong className="text-[#242820]">{selectedFee?.feeTitle}</strong>
            </p>
            <p className="text-[#555B50]">
              Remaining Outstanding Balance:{' '}
              <strong className="text-[#B84040]">${selectedFee?.balanceAmount}</strong>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#242820] mb-1">Payment Amount ($)</label>
            <input
              type="number"
              step="0.01"
              max={selectedFee?.balanceAmount}
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="input-field text-xs font-semibold"
              required
            />
          </div>

          <div className="p-3 rounded-xl border border-[#CAD6B7] bg-[#E4EAD9]/30 text-xs text-[#555B50] space-y-1">
            <p className="font-bold text-[#293526]">Secure Payment Simulation</p>
            <p>Integrated sandbox gateway. Click below to verify and deposit directly to institution treasury.</p>
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowPayModal(false)}
              className="btn-secondary text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs font-bold"
            >
              Authorize & Pay Now
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentFeePage;
