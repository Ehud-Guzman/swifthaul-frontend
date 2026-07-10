import { useState, useEffect } from 'react';
import { vehiclesApi, payoutsApi } from '../../services/api';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import StatCard from '../../components/ui/StatCard';
import { formatKSH, formatDate, vehicleTypeLabel } from '../../utils/formatters';
import { Wallet, Car, ClipboardList, ArrowDownToLine } from 'lucide-react';

const PAYOUT_STATUS_COLORS = {
  pending: 'text-amber-600 bg-amber-50',
  approved: 'text-green-700 bg-green-50',
  rejected: 'text-red-600 bg-red-50',
};

const OwnerEarnings = () => {
  const [vehicles, setVehicles] = useState([]);
  const [jobsByVehicle, setJobsByVehicle] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [summary, setSummary] = useState({ totalEarned: 0, totalPaid: 0, balance: 0 });
  const [payouts, setPayouts] = useState([]);
  const [payoutModal, setPayoutModal] = useState(false);
  const [payoutForm, setPayoutForm] = useState({ amount_ksh: '', note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [payoutError, setPayoutError] = useState('');

  const loadPayouts = async () => {
    const [sumRes, payRes] = await Promise.all([
      payoutsApi.getSummary(),
      payoutsApi.getAll(),
    ]);
    setSummary(sumRes.data);
    setPayouts(payRes.data.payouts ?? []);
  };

  useEffect(() => {
    vehiclesApi.getAll().then(async ({ data }) => {
      const list = data.vehicles ?? data;
      setVehicles(list);
      const jobMap = {};
      await Promise.all(
        list.map(async (v) => {
          const { data: jobs } = await vehiclesApi.getJobs(v._id);
          jobMap[v._id] = jobs.filter((j) => j.status === 'delivered');
        })
      );
      setJobsByVehicle(jobMap);
    }).finally(() => setLoading(false));

    loadPayouts();
  }, []);

  const totalJobs = vehicles.reduce((acc, v) => acc + (jobsByVehicle[v._id]?.length || 0), 0);

  const handlePayoutRequest = async (e) => {
    e.preventDefault();
    setPayoutError('');
    setSubmitting(true);
    try {
      await payoutsApi.create({ amount_ksh: Number(payoutForm.amount_ksh), note: payoutForm.note });
      setPayoutModal(false);
      setPayoutForm({ amount_ksh: '', note: '' });
      loadPayouts();
    } catch (err) {
      setPayoutError(err.response?.data?.message || 'Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  const jobCols = [
    { key: 'route', label: 'Route', render: (r) => `${r.pickup_location} → ${r.dropoff_location}` },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.preferred_date) },
    { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
    { key: 'value', label: 'Job Value', render: (r) => <span className="font-semibold text-green-700">{formatKSH(r.final_price ?? r.suggested_price)}</span> },
  ];

  const payoutCols = [
    { key: 'date', label: 'Requested', render: (r) => formatDate(r.created_at) },
    { key: 'amount', label: 'Amount', render: (r) => <span className="font-semibold">{formatKSH(r.amount_ksh)}</span> },
    { key: 'note', label: 'Note', render: (r) => r.note || '—' },
    {
      key: 'status', label: 'Status', render: (r) => (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${PAYOUT_STATUS_COLORS[r.status]}`}>
          {r.status}
        </span>
      ),
    },
    { key: 'admin_note', label: 'Admin Note', render: (r) => r.admin_note || '—' },
  ];

  if (loading) return <div className="text-slate-400 text-sm">Loading earnings...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Earned" value={formatKSH(summary.totalEarned)} icon={Wallet} color="green" sub="All time" />
        <StatCard title="Total Paid Out" value={formatKSH(summary.totalPaid)} icon={ArrowDownToLine} color="blue" sub="Approved payouts" />
        <StatCard title="Available Balance" value={formatKSH(summary.balance)} icon={Car} color="orange" sub={`${totalJobs} completed jobs`} />
      </div>

      {/* Payout Request */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-800">Payout Requests</h3>
            <p className="text-xs text-slate-400 mt-0.5">Request a withdrawal from your available balance</p>
          </div>
          <Button onClick={() => { setPayoutError(''); setPayoutModal(true); }}>
            Request Payout
          </Button>
        </div>

        {payouts.length === 0 ? (
          <p className="text-sm text-slate-400">No payout requests yet.</p>
        ) : (
          <Table columns={payoutCols} data={payouts} emptyMessage="No payout requests yet." />
        )}
      </div>

      {/* Vehicle earnings breakdown */}
      <div className="space-y-4">
        {vehicles.map((v) => {
          const jobs = jobsByVehicle[v._id] || [];
          const totalValue = jobs.reduce((s, j) => s + (j.final_price ?? j.suggested_price ?? 0), 0);
          const isOpen = selected === v._id;
          return (
            <div key={v._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
                onClick={() => setSelected(isOpen ? null : v._id)}
              >
                <div className="flex items-center gap-3">
                  <Car size={18} className="text-orange-500" />
                  <div className="text-left">
                    <p className="font-semibold text-slate-800">{v.name}</p>
                    <p className="text-xs text-slate-400">{vehicleTypeLabel(v.type)} — {v.plate_number}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-700">{formatKSH(totalValue)}</p>
                  <p className="text-xs text-slate-400">{jobs.length} job{jobs.length !== 1 ? 's' : ''} · total job value</p>
                </div>
              </button>
              {isOpen && (
                <div className="px-5 pb-4 border-t border-slate-100">
                  <Table columns={jobCols} data={jobs} emptyMessage="No completed jobs for this vehicle." />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Payout Request Modal */}
      <Modal open={payoutModal} onClose={() => setPayoutModal(false)} title="Request Payout" size="sm">
        <form onSubmit={handlePayoutRequest} className="space-y-4">
          {payoutError && <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{payoutError}</div>}
          <div className="bg-slate-50 rounded-lg px-3 py-2 text-sm">
            <p className="text-slate-500">Available to withdraw</p>
            <p className="font-bold text-green-700 text-lg">{formatKSH(summary.available ?? summary.balance)}</p>
            {summary.pendingRequests > 0 && (
              <p className="text-xs text-amber-600 mt-0.5">{formatKSH(summary.pendingRequests)} already pending review</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount (KSH)</label>
            <input
              type="number"
              required
              min="1"
              max={summary.available ?? summary.balance}
              value={payoutForm.amount_ksh}
              onChange={(e) => setPayoutForm({ ...payoutForm, amount_ksh: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Note (optional)</label>
            <input
              type="text"
              value={payoutForm.note}
              onChange={(e) => setPayoutForm({ ...payoutForm, note: e.target.value })}
              placeholder="e.g. M-Pesa number"
              className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setPayoutModal(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Submit Request</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OwnerEarnings;
