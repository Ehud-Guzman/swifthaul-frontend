import { useState, useEffect, useCallback } from 'react';
import { jobsApi } from '../../services/api';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import StatusTimeline from '../../components/ui/StatusTimeline';
import { formatDate, formatKSH } from '../../utils/formatters';
import { MapPin, Package, User, Lock } from 'lucide-react';

const STATUS_NEXT = {
  assigned: { next: 'picked_up', label: 'Mark as Picked Up' },
  picked_up: { next: 'in_transit', label: 'Mark as In Transit' },
  in_transit: { next: 'delivered', label: 'Mark as Delivered' },
};

const DriverJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [noteModal, setNoteModal] = useState(false);
  const [note, setNote] = useState('');
  const [updateError, setUpdateError] = useState('');

  const hasActiveJob = jobs.some((j) => ['picked_up', 'in_transit'].includes(j.status));

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await jobsApi.getAll({ limit: 100 });
    const list = data.jobs ?? data;
    // Sort: active first, then assigned by date, then delivered
    const order = { in_transit: 0, picked_up: 1, assigned: 2, delivered: 3 };
    list.sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
    setJobs(list);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusUpdate = async () => {
    if (!selected) return;
    const transition = STATUS_NEXT[selected.status];
    if (!transition) return;
    setUpdating(true);
    setUpdateError('');
    try {
      await jobsApi.updateStatus(selected._id, { new_status: transition.next, note });
      setNoteModal(false);
      setNote('');
      setSelected(null);
      load();
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="text-slate-400 text-sm">Loading jobs...</div>;

  return (
    <div className="space-y-4 max-w-2xl">
      {jobs.length === 0 && <p className="text-slate-400 text-sm">No assigned jobs.</p>}

      {jobs.map((job) => {
        const transition = STATUS_NEXT[job.status];
        const isActive = ['picked_up', 'in_transit'].includes(job.status);
        const isLocked = job.status === 'assigned' && hasActiveJob;

        return (
          <div key={job._id}
            className={`bg-white rounded-2xl border-2 p-5 space-y-4 ${isActive ? 'border-orange-400' : 'border-slate-200'}`}>
            {isActive && (
              <div className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                Active
              </div>
            )}

            <StatusTimeline currentStatus={job.status} />

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex gap-2">
                <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                <div><p className="text-xs text-slate-400">Pickup</p><p className="font-medium">{job.pickup_location}</p></div>
              </div>
              <div className="flex gap-2">
                <MapPin size={14} className="text-orange-400 shrink-0 mt-0.5" />
                <div><p className="text-xs text-slate-400">Drop-off</p><p className="font-medium">{job.dropoff_location}</p></div>
              </div>
              <div className="flex gap-2">
                <Package size={14} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400">Cargo</p>
                  <p className="font-medium capitalize">{job.cargo_type?.replace(/_/g, ' ')} — {job.weight_kg} kg</p>
                </div>
              </div>
              <div className="flex gap-2">
                <User size={14} className="text-slate-400 shrink-0 mt-0.5" />
                <div><p className="text-xs text-slate-400">Client</p><p className="font-medium">{job.client_id?.name || job.guest_name || '—'}</p></div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <Badge status={job.status} />
                <p className="text-xs text-slate-400 mt-1">{formatDate(job.preferred_date)}</p>
              </div>
              {transition && (
                isLocked ? (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Lock size={13} /> Complete active job first
                  </div>
                ) : (
                  <Button onClick={() => { setSelected(job); setNoteModal(true); }}>
                    {transition.label}
                  </Button>
                )
              )}
              {job.status === 'delivered' && (
                <span className="text-xs text-green-600 font-medium">✓ Delivered · {formatKSH(job.final_price ?? job.suggested_price)}</span>
              )}
            </div>

            {job.notes && (
              <div className="bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-600">
                <span className="font-medium">Notes:</span> {job.notes}
              </div>
            )}
          </div>
        );
      })}

      <Modal open={noteModal} onClose={() => setNoteModal(false)} title="Update Status" size="sm">
        {selected && (
          <div className="space-y-4">
            {updateError && <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{updateError}</div>}
            <p className="text-sm text-slate-600">
              Updating to: <span className="font-semibold capitalize">{STATUS_NEXT[selected.status]?.next?.replace(/_/g, ' ')}</span>
            </p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Note (optional)</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                placeholder="e.g. Traffic delay, arrived at pickup..."
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setNoteModal(false)}>Cancel</Button>
              <Button onClick={handleStatusUpdate} loading={updating}>Confirm</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DriverJobs;
