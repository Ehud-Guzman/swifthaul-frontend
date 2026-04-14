import { useState, useEffect, useCallback } from 'react';
import { jobsApi } from '../../services/api';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import StatusTimeline from '../../components/ui/StatusTimeline';
import { formatDate, formatKSH } from '../../utils/formatters';

const ClientMyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [logs, setLogs] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await jobsApi.getAll();
    setJobs(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openDetail = async (job) => {
    setSelected(job);
    const { data } = await jobsApi.getLogs(job._id);
    setLogs(data);
    setDetailModal(true);
  };

  const handleCancel = async (job) => {
    if (!window.confirm('Cancel this job?')) return;
    await jobsApi.cancel(job._id, { note: 'Cancelled by client' });
    load();
  };

  const columns = [
    { key: 'id', label: '#', render: (r) => <span className="text-xs text-slate-400 font-mono">{r._id.slice(-6)}</span> },
    { key: 'route', label: 'Route', render: (r) => <span className="text-xs">{r.pickup_location} → {r.dropoff_location}</span> },
    { key: 'cargo', label: 'Cargo', render: (r) => <span className="capitalize">{r.cargo_type?.replace(/_/g, ' ')}</span> },
    { key: 'weight', label: 'Weight', render: (r) => `${r.weight_kg} kg` },
    { key: 'price', label: 'Price', render: (r) => formatKSH(r.suggested_price) },
    { key: 'date', label: 'Pref. Date', render: (r) => formatDate(r.preferred_date) },
    { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
    {
      key: 'actions', label: '', render: (r) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => openDetail(r)}>Track</Button>
          {r.status === 'pending' && (
            <Button size="sm" variant="danger" onClick={() => handleCancel(r)}>Cancel</Button>
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

      <Modal open={detailModal} onClose={() => setDetailModal(false)} title="Job Tracking" size="lg">
        {selected && (
          <div className="space-y-5">
            <StatusTimeline currentStatus={selected.status} />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-slate-400 text-xs">Pickup</p><p className="font-medium">{selected.pickup_location}</p></div>
              <div><p className="text-slate-400 text-xs">Drop-off</p><p className="font-medium">{selected.dropoff_location}</p></div>
              <div><p className="text-slate-400 text-xs">Cargo / Weight</p><p className="font-medium capitalize">{selected.cargo_type?.replace(/_/g, ' ')} — {selected.weight_kg} kg</p></div>
              <div><p className="text-slate-400 text-xs">Price</p><p className="font-medium">{formatKSH(selected.suggested_price)}</p></div>
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
    </div>
  );
};

export default ClientMyJobs;
