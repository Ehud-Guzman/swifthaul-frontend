import { useState, useEffect, useCallback } from 'react';
import { usersApi } from '../../services/api';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { formatDate } from '../../utils/formatters';

const ROLES = ['', 'admin', 'owner', 'client', 'driver'];

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'owner', license_number: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const params = roleFilter ? { role: roleFilter } : {};
    const { data } = await usersApi.getAll(params);
    setUsers(data);
    setLoading(false);
  }, [roleFilter]);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (user) => {
    await usersApi.update(user._id, { is_active: !user.is_active });
    load();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      await usersApi.create(form);
      setCreateModal(false);
      setForm({ name: '', email: '', phone: '', password: '', role: 'owner', license_number: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Creation failed');
    } finally {
      setCreating(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone', render: (r) => r.phone || '—' },
    { key: 'role', label: 'Role', render: (r) => <span className="capitalize font-medium text-slate-700">{r.role}</span> },
    { key: 'status', label: 'Status', render: (r) => <Badge status={r.is_active ? 'available' : 'cancelled'} /> },
    { key: 'joined', label: 'Joined', render: (r) => formatDate(r.created_at) },
    {
      key: 'actions', label: '', render: (r) => (
        <Button size="sm" variant={r.is_active ? 'danger' : 'secondary'} onClick={() => toggleActive(r)}>
          {r.is_active ? 'Deactivate' : 'Activate'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {ROLES.map((r) => (
            <button key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${roleFilter === r ? 'bg-orange-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {r ? r.charAt(0).toUpperCase() + r.slice(1) : 'All'}
            </button>
          ))}
        </div>
        <Button onClick={() => setCreateModal(true)}>+ Add User</Button>
      </div>

      {loading ? <div className="text-slate-400 text-sm">Loading...</div> : (
        <Table columns={columns} data={users} />
      )}

      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create Account">
        <form onSubmit={handleCreate} className="space-y-4">
          {error && <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
          {[['Full Name', 'name'], ['Email', 'email', 'email'], ['Phone', 'phone', 'tel'], ['Password', 'password', 'password']].map(([label, key, type = 'text']) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
              <input type={type} required={key !== 'phone'} value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
              <option value="owner">Vehicle Owner</option>
              <option value="driver">Driver</option>
            </select>
          </div>
          {form.role === 'driver' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">License Number</label>
              <input value={form.license_number} required
                onChange={(e) => setForm({ ...form, license_number: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button type="submit" loading={creating}>Create Account</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminUsers;
