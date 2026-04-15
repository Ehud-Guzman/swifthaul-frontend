import { useState, useEffect, useCallback } from 'react';
import { vehiclesApi, usersApi } from '../../services/api';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { formatDate, vehicleTypeLabel } from '../../utils/formatters';

const STATUS_FILTERS = ['', 'available', 'assigned', 'maintenance'];
const VEHICLE_TYPES = ['mini_van', 'truck_3t', 'flatbed', 'semi_trailer'];
const PAGE_SIZE = 20;

const AdminVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'mini_van', plate_number: '', capacity_kg: '', owner_id: '' });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (p = page) => {
    setLoading(true);
    const params = { page: p, limit: PAGE_SIZE };
    if (statusFilter) params.status = statusFilter;
    const { data } = await vehiclesApi.getAll(params);
    setVehicles(data.vehicles ?? data);
    setTotal(data.total ?? data.length);
    setPage(data.page ?? 1);
    setPages(data.pages ?? 1);
    setLoading(false);
  }, [statusFilter, page]);

  useEffect(() => { load(1); }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(page); }, [page]);       // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    usersApi.getAll({ role: 'owner', limit: 200 }).then(({ data }) => {
      setOwners(data.users ?? data);
    });
  }, []);

  const openStatusChange = (v) => {
    setSelected(v);
    setNewStatus(v.status);
    setStatusModal(true);
  };

  const handleStatusChange = async () => {
    await vehiclesApi.update(selected._id, { status: newStatus });
    setStatusModal(false);
    load(page);
  };

  const openAddModal = () => {
    setError('');
    setForm({ name: '', type: 'mini_van', plate_number: '', capacity_kg: '', owner_id: owners[0]?._id || '' });
    setAddModal(true);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setAdding(true);
    try {
      await vehiclesApi.create(form);
      setAddModal(false);
      load(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add vehicle');
    } finally {
      setAdding(false);
    }
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
        <Button size="sm" variant="outline" onClick={() => openStatusChange(r)} className="w-full sm:w-auto">
          Change Status
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-orange-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            </button>
          ))}
        </div>
        <Button onClick={openAddModal}>+ Add Vehicle</Button>
      </div>

      {loading ? <div className="text-slate-400 text-sm">Loading...</div> : (
        <>
          <Table columns={columns} data={vehicles} />
          {pages > 1 && (
            <div className="flex items-center justify-between text-sm text-slate-500 pt-1">
              <span>{total} total · page {page} of {pages}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                <Button size="sm" variant="secondary" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}>Next</Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Change Status Modal */}
      <Modal open={statusModal} onClose={() => setStatusModal(false)} title="Update Vehicle Status">
        {selected && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">{selected.name} — {selected.plate_number}</p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Status</label>
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
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

      {/* Add Vehicle Modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Register Vehicle">
        <form onSubmit={handleAdd} className="space-y-4">
          {error && <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Owner</label>
            <select required value={form.owner_id} onChange={(e) => setForm({ ...form, owner_id: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
              <option value="">— Select owner —</option>
              {owners.map((o) => (
                <option key={o._id} value={o._id}>{o.name} ({o.email})</option>
              ))}
            </select>
          </div>
          {[['Vehicle Name', 'name', 'text', 'e.g. Isuzu Flatbed 01'], ['Plate Number', 'plate_number', 'text', 'KBX 123A'], ['Capacity (kg)', 'capacity_kg', 'number', '5000']].map(([label, key, type, ph]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
              <input type={type} required value={form[key]} placeholder={ph}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
              {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{vehicleTypeLabel(t)}</option>)}
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setAddModal(false)}>Cancel</Button>
            <Button type="submit" loading={adding}>Register</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminVehicles;
