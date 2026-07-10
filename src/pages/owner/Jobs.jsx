import { useState, useEffect, useCallback } from 'react';
import { jobsApi } from '../../services/api';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import StatusTimeline from '../../components/ui/StatusTimeline';
import { formatDate, formatKSH } from '../../utils/formatters';

const OwnerJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detailModal, setDetailModal] = useState(false);

  const load = useCallback(async () => {
    const { data } = await jobsApi.getAll();
    setJobs(data.jobs ?? data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { key: 'id', label: '#', render: (r) => <span className="text-xs text-slate-400 font-mono">{r._id.slice(-6)}</span> },
    { key: 'vehicle', label: 'Vehicle', render: (r) => r.vehicle_id?.name || '—' },
    { key: 'route', label: 'Route', render: (r) => <span className="text-xs">{r.pickup_location} → {r.dropoff_location}</span> },
    { key: 'cargo', label: 'Cargo', render: (r) => <span className="capitalize">{r.cargo_type?.replace(/_/g, ' ')}</span> },
    { key: 'price', label: 'Value', render: (r) => formatKSH(r.final_price ?? r.suggested_price) },
    { key: 'date', label: 'Pref. Date', render: (r) => formatDate(r.preferred_date) },
    { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
    {
      key: 'actions', label: '', render: (r) => (
        <Button size="sm" variant="secondary" onClick={() => { setSelected(r); setDetailModal(true); }}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {loading ? <div className="text-slate-400 text-sm">Loading jobs...</div> : (
        <Table columns={columns} data={jobs} emptyMessage="No jobs assigned to your vehicles yet." />
      )}

      <Modal open={detailModal} onClose={() => setDetailModal(false)} title="Job Details" size="lg">
        {selected && (
          <div className="space-y-5">
            <StatusTimeline currentStatus={selected.status} />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-slate-400 text-xs">Vehicle</p><p className="font-medium">{selected.vehicle_id?.name} — {selected.vehicle_id?.plate_number}</p></div>
              <div><p className="text-slate-400 text-xs">Job Value</p><p className="font-medium">{formatKSH(selected.final_price ?? selected.suggested_price)}</p></div>
              <div><p className="text-slate-400 text-xs">Pickup</p><p className="font-medium">{selected.pickup_location}</p></div>
              <div><p className="text-slate-400 text-xs">Drop-off</p><p className="font-medium">{selected.dropoff_location}</p></div>
              <div><p className="text-slate-400 text-xs">Cargo / Weight</p><p className="font-medium capitalize">{selected.cargo_type?.replace(/_/g, ' ')} — {selected.weight_kg} kg</p></div>
              <div><p className="text-slate-400 text-xs">Preferred Date</p><p className="font-medium">{formatDate(selected.preferred_date)}</p></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OwnerJobs;
