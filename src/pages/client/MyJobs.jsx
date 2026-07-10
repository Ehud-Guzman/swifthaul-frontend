import { useState, useEffect, useCallback } from 'react';
import { jobsApi, disputesApi } from '../../services/api';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import StatusTimeline from '../../components/ui/StatusTimeline';
import MpesaPayCard from '../../components/payments/MpesaPayCard';
import { formatDate, formatKSH } from '../../utils/formatters';

const DISPUTE_TYPES = [
  { value: 'damage', label: 'Damaged Goods' },
  { value: 'delay', label: 'Significant Delay' },
  { value: 'missing_item', label: 'Missing Items' },
  { value: 'wrong_delivery', label: 'Wrong Delivery Location' },
  { value: 'overcharge', label: 'Incorrect Charge' },
  { value: 'other', label: 'Other Issue' },
];

const DISPUTE_STATUS_COLORS = {
  open: 'text-amber-600 bg-amber-50',
  in_review: 'text-blue-600 bg-blue-50',
  resolved: 'text-green-700 bg-green-50',
  closed: 'text-slate-500 bg-slate-100',
};

const ClientMyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [logs, setLogs] = useState([]);
  const [disputeModal, setDisputeModal] = useState(false);
  const [disputeJob, setDisputeJob] = useState(null);
  const [disputeForm, setDisputeForm] = useState({ type: 'damage', description: '' });
  const [submittingDispute, setSubmittingDispute] = useState(false);
  const [disputeError, setDisputeError] = useState('');
  const [disputeSuccess, setDisputeSuccess] = useState(false);
  const [payModal, setPayModal] = useState(false);
  const [payJob, setPayJob] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await jobsApi.getAll();
    setJobs(data.jobs ?? data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openDetail = async (job) => {
    setSelected(job);
    const { data } = await jobsApi.getLogs(job._id);
    setLogs(data);
    setDetailModal(true);
  };

  const handleCancel = async () => {
    try {
      await jobsApi.cancel(cancelTarget._id, { note: 'Cancelled by client' });
    } catch {
      // reload below shows the true state either way
    }
    setCancelModal(false);
    setCancelTarget(null);
    load();
  };

  const openDisputeModal = (job) => {
    setDisputeJob(job);
    setDisputeForm({ type: 'damage', description: '' });
    setDisputeError('');
    setDisputeSuccess(false);
    setDisputeModal(true);
  };

  const handleDispute = async (e) => {
    e.preventDefault();
    setDisputeError('');
    setSubmittingDispute(true);
    try {
      await disputesApi.create({ job_id: disputeJob._id, ...disputeForm });
      setDisputeSuccess(true);
    } catch (err) {
      setDisputeError(err.response?.data?.message || 'Failed to submit dispute');
    } finally {
      setSubmittingDispute(false);
    }
  };

  const columns = [
    { key: 'id', label: '#', render: (r) => <span className="text-xs text-slate-400 font-mono">{r.tracking_code || r._id.slice(-6)}</span> },
    { key: 'route', label: 'Route', render: (r) => <span className="text-xs">{r.pickup_location} → {r.dropoff_location}</span> },
    { key: 'cargo', label: 'Cargo', render: (r) => <span className="capitalize">{r.cargo_type?.replace(/_/g, ' ')}</span> },
    { key: 'weight', label: 'Weight', render: (r) => `${r.weight_kg} kg` },
    { key: 'price', label: 'Price', render: (r) => formatKSH(r.final_price ?? r.suggested_price) },
    { key: 'date', label: 'Pref. Date', render: (r) => formatDate(r.preferred_date) },
    { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
    { key: 'payment', label: 'Payment', render: (r) => <Badge status={r.payment_status || 'unpaid'} /> },
    {
      key: 'actions', label: '', render: (r) => (
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="secondary" onClick={() => openDetail(r)}>Track</Button>
          {r.status === 'pending' && (
            <Button size="sm" variant="danger" onClick={() => { setCancelTarget(r); setCancelModal(true); }}>Cancel</Button>
          )}
          {r.payment_status !== 'paid' && r.status !== 'cancelled' && (
            <Button size="sm" onClick={() => { setPayJob(r); setPayModal(true); }}>Pay Now</Button>
          )}
          {['picked_up', 'in_transit', 'delivered', 'cancelled'].includes(r.status) && (
            <Button size="sm" variant="outline" onClick={() => openDisputeModal(r)}>Report Issue</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {loading ? <div className="text-slate-400 text-sm">Loading jobs...</div> : (
        <Table columns={columns} data={jobs} emptyMessage="No jobs submitted yet." />
      )}

      {/* Cancel Confirm Modal */}
      <Modal open={cancelModal} onClose={() => { setCancelModal(false); setCancelTarget(null); }} title="Cancel Job" size="sm">
        {cancelTarget && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Are you sure you want to cancel this job?</p>
            <div className="bg-slate-50 rounded-lg px-3 py-2 text-sm">
              <p className="font-medium">{cancelTarget.pickup_location} → {cancelTarget.dropoff_location}</p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => { setCancelModal(false); setCancelTarget(null); }}>Keep Job</Button>
              <Button variant="danger" onClick={handleCancel}>Yes, Cancel</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Track Detail Modal */}
      <Modal open={detailModal} onClose={() => setDetailModal(false)} title="Job Tracking" size="lg">
        {selected && (
          <div className="space-y-5">
            <StatusTimeline currentStatus={selected.status} cancelledFromStatus={selected.cancelled_from_status} />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-slate-400 text-xs">Pickup</p><p className="font-medium">{selected.pickup_location}</p></div>
              <div><p className="text-slate-400 text-xs">Drop-off</p><p className="font-medium">{selected.dropoff_location}</p></div>
              <div><p className="text-slate-400 text-xs">Cargo / Weight</p><p className="font-medium capitalize">{selected.cargo_type?.replace(/_/g, ' ')} — {selected.weight_kg} kg</p></div>
              <div><p className="text-slate-400 text-xs">Price</p><p className="font-medium">{formatKSH(selected.final_price ?? selected.suggested_price)}</p></div>
              {selected.tracking_code && (
                <div><p className="text-slate-400 text-xs">Tracking Code</p><p className="font-mono font-medium">{selected.tracking_code}</p></div>
              )}
              <div><p className="text-slate-400 text-xs">Preferred Date</p><p className="font-medium">{formatDate(selected.preferred_date)}</p></div>
              {selected.vehicle_id && (
                <div><p className="text-slate-400 text-xs">Vehicle</p><p className="font-medium">{selected.vehicle_id?.name} — {selected.vehicle_id?.plate_number}</p></div>
              )}
            </div>

            {logs.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Status History</p>
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div key={log._id} className="flex items-start gap-3 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0" />
                      <div>
                        <span className="font-medium capitalize">{log.new_status?.replace(/_/g, ' ')}</span>
                        {log.note && <span className="text-slate-400"> — {log.note}</span>}
                        <p className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Pay Modal */}
      <Modal open={payModal} onClose={() => { setPayModal(false); setPayJob(null); }} title="Pay for Shipment" size="sm">
        {payJob && (
          <MpesaPayCard
            trackingCode={payJob.tracking_code}
            amount={payJob.final_price ?? payJob.suggested_price}
            paymentStatus={payJob.payment_status}
            defaultPhone={payJob.client_id?.phone || ''}
            onPaid={() => { load(); setPayModal(false); setPayJob(null); }}
          />
        )}
      </Modal>

      {/* Report Issue Modal */}
      <Modal open={disputeModal} onClose={() => setDisputeModal(false)} title="Report an Issue" size="sm">
        {disputeJob && (
          disputeSuccess ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800">
                Your dispute has been submitted. Our team will review it and get back to you shortly.
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setDisputeModal(false)}>Close</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleDispute} className="space-y-4">
              {disputeError && <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{disputeError}</div>}
              <div className="bg-slate-50 rounded-lg px-3 py-2 text-sm">
                <p className="font-medium">{disputeJob.pickup_location} → {disputeJob.dropoff_location}</p>
                <p className="text-slate-400 text-xs">Job #{disputeJob._id.slice(-6)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Issue Type</label>
                <select
                  value={disputeForm.type}
                  onChange={(e) => setDisputeForm({ ...disputeForm, type: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  {DISPUTE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={disputeForm.description}
                  onChange={(e) => setDisputeForm({ ...disputeForm, description: e.target.value })}
                  placeholder="Please describe the issue in detail..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="secondary" onClick={() => setDisputeModal(false)}>Cancel</Button>
                <Button type="submit" loading={submittingDispute}>Submit Report</Button>
              </div>
            </form>
          )
        )}
      </Modal>
    </div>
  );
};

export default ClientMyJobs;
