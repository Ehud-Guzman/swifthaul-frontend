import { useState, useEffect, useCallback } from 'react';
import { vehiclesApi } from '../../services/api';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { formatDate, vehicleTypeLabel } from '../../utils/formatters';

const VEHICLE_TYPES = ['mini_van', 'truck_3t', 'flatbed', 'semi_trailer'];

const OwnerVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'mini_van', plate_number: '', capacity_kg: '' });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await vehiclesApi.getAll();
    setVehicles(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setAdding(true);
    try {
      await vehiclesApi.create(form);
      setAddModal(false);
      setForm({ name: '', type: 'mini_van', plate_number: '', capacity_kg: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add vehicle');
    } finally {
      setAdding(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'type', label: 'Type', render: (r) => vehicleTypeLabel(r.type) },
    { key: 'plate', label: 'Plate', render: (r) => <span className="font-mono text-sm">{r.plate_number}</span> },
    { key: 'capacity', label: 'Capacity', render: (r) => `${r.capacity_kg} kg` },
    { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
    { key: 'added', label: 'Added', render: (r) => formatDate(r.created_at) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setAddModal(true)}>+ Add Vehicle</Button>
      </div>

      {loading ? <div className="text-slate-400 text-sm">Loading...</div> : (
        <Table columns={columns} data={vehicles} emptyMessage="No vehicles registered yet." />
      )}

      <Modal open={addModal} onClose={() => setAddModal(false)} title="Register Vehicle">
        <form onSubmit={handleAdd} className="space-y-4">
          {error && <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
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

export default OwnerVehicles;
