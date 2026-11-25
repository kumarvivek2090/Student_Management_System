import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { CreditCard, DollarSign, CheckCircle2, Clock, AlertTriangle, Plus, Search, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import StatCard from '../components/common/StatCard';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';

const FeeManagement = () => {
  const [overview, setOverview] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Payment Modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'ONLINE',
    transactionReference: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ovRes, fRes] = await Promise.all([
        api.get('/fees/overview'),
        api.get('/fees')
      ]);
      if (ovRes.data?.success) setOverview(ovRes.data.data);
      if (fRes.data?.success) setFees(fRes.data.data || []);
    } catch (e) {
      toast.error('Failed to load fee management records');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      toast.error('Please enter a valid positive payment amount');
      return;
    }
    try {
      const payload = {
        studentFeeId: selectedFee.id,
        amount: Number(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        transactionReference: paymentForm.transactionReference || `TXN-${Date.now()}`
      };
      const res = await api.post('/fees/payments', payload);
      if (res.data?.success) {
        toast.success(`Payment recorded for ${selectedFee.studentFullName}`);
        setShowPayModal(false);
        loadData();
        setPaymentForm({
          amount: '',
          paymentMethod: 'ONLINE',
          transactionReference: ''
        });
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Payment processing failed');
    }
  };

  const filteredFees = fees.filter((f) => {
    const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;
    const matchesSearch =
      f.studentFullName?.toLowerCase().includes(search.toLowerCase()) ||
      f.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      f.rollNumber?.includes(search);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID': return 'olive';
      case 'PARTIAL': return 'gold';
      case 'OVERDUE': return 'error';
      default: return 'sage';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="card-premium p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#E3E1D6]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-[#52613B] bg-[#E4EAD9] px-2.5 py-0.5 rounded-full border border-[#CAD6B7]">
              Financial Administration
            </span>
            <span className="text-xs text-[#555B50] font-semibold">Tuition & Invoicing</span>
          </div>
          <h2 className="text-xl font-bold text-[#242820] mt-1 tracking-tight">Institutional Fee Management</h2>
          <p className="text-xs text-[#555B50] font-medium mt-0.5">
            Track student tuition invoices, record digital payments, audit collections, and inspect outstanding dues.
          </p>
        </div>

        <button
          onClick={() => toast.success('Exporting fee ledger...')}
          className="btn-secondary text-xs font-bold flex items-center space-x-2 py-2.5 px-4"
        >
          <Receipt className="w-3.5 h-3.5 text-[#52613B]" />
          <span>Export Fee Ledger</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Billed"
          value={`$${Number(overview?.totalBilled || 0).toLocaleString()}`}
          icon={DollarSign}
          subtitle="Cumulative tuition invoices"
        />
        <StatCard
          title="Total Collected"
          value={`$${Number(overview?.totalCollected || 0).toLocaleString()}`}
          icon={CheckCircle2}
          trend="up"
          change="Deposited to school account"
        />
        <StatCard
          title="Outstanding Dues"
          value={`$${Number(overview?.pendingDues || 0).toLocaleString()}`}
          icon={AlertTriangle}
          trend={Number(overview?.pendingDues || 0) > 0 ? 'down' : 'up'}
          change="Receivable tuition balance"
        />
        <StatCard
          title="Invoices Settled"
          value={`${overview?.paidInvoices || 0} / ${overview?.totalInvoices || 0}`}
          icon={CreditCard}
          subtitle="Payment clearance rate"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="card-premium p-4 bg-[#F0EFE6]/60 border border-[#E3E1D6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          {['ALL', 'PENDING', 'PARTIAL', 'PAID', 'OVERDUE'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === s
                  ? 'bg-[#52613B] text-white shadow-sm'
                  : 'bg-white border border-[#CAD6B7] text-[#555B50] hover:text-[#242820]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-[#74796D] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student or invoice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 py-2 text-xs font-semibold"
          />
        </div>
      </div>

      {/* Fees Table */}
      <div className="card-premium overflow-hidden border border-[#E3E1D6]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E3E1D6] text-left text-xs">
            <thead className="bg-[#F8F7F2] text-[#555B50] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Invoice #</th>
                <th className="px-4 py-3.5">Student</th>
                <th className="px-4 py-3.5">Fee Category</th>
                <th className="px-4 py-3.5 text-center">Due Date</th>
                <th className="px-4 py-3.5 text-right">Billed</th>
                <th className="px-4 py-3.5 text-right">Paid</th>
                <th className="px-4 py-3.5 text-right">Balance</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E1D6] bg-white">
              {filteredFees.length > 0 ? (
                filteredFees.map((f) => (
                  <tr key={f.id} className="hover:bg-[#F8F7F2] transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-[#52613B]">{f.invoiceNumber}</td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-[#242820]">{f.studentFullName}</p>
                      <p className="text-[11px] text-[#555B50]">{f.className} - Sec {f.sectionName} (Roll: {f.rollNumber})</p>
                    </td>
                    <td className="px-4 py-3.5 text-[#555B50] font-medium max-w-xs truncate">{f.feeTitle}</td>
                    <td className="px-4 py-3.5 text-center font-medium text-[#242820]">{f.dueDate}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-[#242820]">${f.totalAmount}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-[#52613B]">${f.paidAmount}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-[#B84040]">
                      ${f.balanceAmount}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge variant={getStatusBadge(f.status)}>{f.status}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {f.status !== 'PAID' ? (
                        <button
                          onClick={() => {
                            setSelectedFee(f);
                            setPaymentForm({
                              amount: f.balanceAmount,
                              paymentMethod: 'ONLINE',
                              transactionReference: `TXN-${Date.now()}`
                            });
                            setShowPayModal(true);
                          }}
                          className="btn-primary text-[11px] font-bold py-1.5 px-3"
                        >
                          Record Pay
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-[#52613B] flex items-center justify-end space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Cleared</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-[#74796D] font-medium">
                    No fee records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        title={`Record Payment for ${selectedFee?.studentFullName}`}
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div className="p-3 rounded-xl bg-[#F0EFE6]/60 border border-[#E3E1D6] space-y-1 text-xs">
            <p className="text-[#555B50]">
              Invoice: <strong className="text-[#242820] font-mono">{selectedFee?.invoiceNumber}</strong>
            </p>
            <p className="text-[#555B50]">
              Total Billed: <strong className="text-[#242820]">${selectedFee?.totalAmount}</strong> | Outstanding Balance:{' '}
              <strong className="text-[#B84040]">${selectedFee?.balanceAmount}</strong>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#242820] mb-1">Amount to Pay ($)</label>
            <input
              type="number"
              step="0.01"
              max={selectedFee?.balanceAmount}
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              className="input-field text-xs font-semibold"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#242820] mb-1">Payment Method</label>
              <select
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                className="input-field text-xs font-semibold"
              >
                <option value="ONLINE">ONLINE PORTAL</option>
                <option value="BANK_TRANSFER">BANK TRANSFER</option>
                <option value="CARD">CREDIT/DEBIT CARD</option>
                <option value="CASH">CASH AT BURSAR</option>
                <option value="CHEQUE">BANK CHEQUE</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#242820] mb-1">Transaction Ref / Cheque #</label>
              <input
                type="text"
                value={paymentForm.transactionReference}
                onChange={(e) => setPaymentForm({ ...paymentForm, transactionReference: e.target.value })}
                className="input-field text-xs font-semibold"
                placeholder="TXN-987654"
              />
            </div>
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
              Confirm & Generate Receipt
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FeeManagement;
