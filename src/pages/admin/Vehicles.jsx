import { useState, useEffect, useCallback } from 'react';
import { vehiclesApi } from '../../services/api';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { formatDate, vehicleTypeLabel } from '../../utils/formatters';

const STATUS_FILTERS = ['', 'available', 'assigned', 'maintenance'];

const AdminVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await vehiclesApi.getAll(statusFilter ? { status: statusFilter } : {});
    setVehicles(data);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const openStatusChange = (v) => {
    setSelected(v);
    setNewStatus(v.status);
    setStatusModal(true);
  };

  const handleStatusChange = async () => {
    await vehiclesApi.update(selected._id, { status: newStatus });
    setStatusModal(false);
    load();
  };

  const columns = [
    { key: 'name', label: 'Vehicle', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'type', label: 'Type', render: (r) => vehicleTypeLabel(r.type) },
    { key: 'plate', label: 'Plate', render: (r) => <span className="font-mono text-sm">{r.plate_number}</span> },
    { key: 'capacity', label: 'Capacity', render: (r) => `${r.capacity_kg} kg` },
    { key: 'owner', label: 'Owner', render: (r) => r.owner_id?.name || '—' },
    { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
    { key: 'added', label: 'Added', render: (r) => formatDate(r.created_at) },
    {
      key: 'actions', label: '', render: (r) => (
        <Button size="sm" variant="outline" onClick={() => openStatusChange(r)}>Change Status</Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-orange-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {loading ? <div className="text-slate-400 text-sm">Loading...</div> : (
        <Table columns={columns} data={vehicles} />
      )}

      <Modal open={statusModal} onClose={() => setStatusModal(false)} title="Update Vehicle Status">
        {selected && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">{selected.name} — {selected.plate_number}</p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Status</label>
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                <option value="available">Available</option>
                <option value="assigned">Assigned</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setStatusModal(false)}>Cancel</Button>
              <Button onClick={handleStatusChange}>Update</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminVehicles;
