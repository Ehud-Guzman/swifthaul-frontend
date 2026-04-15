import { useState, useEffect, useCallback } from 'react';
import { usersApi } from '../../services/api';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { formatDate } from '../../utils/formatters';

const ROLES = ['', 'admin', 'owner', 'client', 'driver'];
const PAGE_SIZE = 20;

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'owner', license_number: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [toggleModal, setToggleModal] = useState(false);
  const [toggleTarget, setToggleTarget] = useState(null);

  const load = useCallback(async (p = page) => {
    setLoading(true);
    const params = { page: p, limit: PAGE_SIZE };
    if (roleFilter) params.role = roleFilter;
    const { data } = await usersApi.getAll(params);
    setUsers(data.users ?? data);
    setTotal(data.total ?? data.length);
    setPage(data.page ?? 1);
    setPages(data.pages ?? 1);
    setLoading(false);
  }, [roleFilter, page]);

  useEffect(() => { load(1); }, [roleFilter]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(page); }, [page]);     // eslint-disable-line react-hooks/exhaustive-deps

  const confirmToggle = (user) => {
    setToggleTarget(user);
    setToggleModal(true);
  };

  const handleToggle = async () => {
    await usersApi.update(toggleTarget._id, { is_active: !toggleTarget.is_active });
    setToggleModal(false);
    setToggleTarget(null);
    load(page);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      await usersApi.create(form);
      setCreateModal(false);
      setForm({ name: '', email: '', phone: '', password: '', role: 'owner', license_number: '' });
      load(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Creation failed');
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (user) => {
    setEditTarget(user);
    setEditForm({ name: user.name, email: user.email, phone: user.phone || '' });
    setEditError('');
    setEditModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditError('');
    setSaving(true);
    try {
      await usersApi.update(editTarget._id, editForm);
      setEditModal(false);
      load(page);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
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
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => openEdit(r)}>Edit</Button>
          <Button size="sm" variant={r.is_active ? 'danger' : 'secondary'} onClick={() => confirmToggle(r)}>
            {r.is_active ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {ROLES.map((r) => (
            <button key={r}
              onClick={() => { setRoleFilter(r); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${roleFilter === r ? 'bg-orange-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {r ? r.charAt(0).toUpperCase() + r.slice(1) : 'All'}
            </button>
          ))}
        </div>
        <Button onClick={() => setCreateModal(true)}>+ Add User</Button>
      </div>

      {loading ? <div className="text-slate-400 text-sm">Loading...</div> : (
        <>
          <Table columns={columns} data={users} />
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

      {/* Toggle Active Confirm Modal */}
      <Modal open={toggleModal} onClose={() => { setToggleModal(false); setToggleTarget(null); }} title={toggleTarget?.is_active ? 'Deactivate User' : 'Activate User'} size="sm">
        {toggleTarget && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to {toggleTarget.is_active ? 'deactivate' : 'activate'} <span className="font-semibold">{toggleTarget.name}</span>?
              {toggleTarget.is_active && toggleTarget.role === 'driver' && (
                <span className="block mt-1 text-amber-700">This driver will be marked unavailable for job assignments.</span>
              )}
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => { setToggleModal(false); setToggleTarget(null); }}>Cancel</Button>
              <Button variant={toggleTarget.is_active ? 'danger' : 'primary'} onClick={handleToggle}>
                {toggleTarget.is_active ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create User Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create Account">
        <form onSubmit={handleCreate} className="space-y-4">
          {error && <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
          {[['Full Name', 'name'], ['Email', 'email', 'email'], ['Phone', 'phone', 'tel'], ['Password', 'password', 'password']].map(([label, key, type = 'text']) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
              <input type={type} required={key !== 'phone'} value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
              <option value="owner">Vehicle Owner</option>
              <option value="driver">Driver</option>
            </select>
          </div>
          {form.role === 'driver' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">License Number</label>
              <input value={form.license_number} required
                onChange={(e) => setForm({ ...form, license_number: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button type="submit" loading={creating}>Create Account</Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit User">
        <form onSubmit={handleEdit} className="space-y-4">
          {editError && <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{editError}</div>}
          {[['Full Name', 'name', 'text'], ['Email', 'email', 'email'], ['Phone', 'phone', 'tel']].map(([label, key, type]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
              <input type={type} required={key !== 'phone'} value={editForm[key]}
                onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          ))}
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setEditModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminUsers;
