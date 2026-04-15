import { useState, useEffect, useCallback } from 'react';
import { disputesApi } from '../../services/api';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { formatDate } from '../../utils/formatters';

const STATUS_FILTERS = ['', 'open', 'in_review', 'resolved', 'closed'];
const PAGE_SIZE = 20;

const STATUS_COLORS = {
  open: 'text-amber-600 bg-amber-50',
  in_review: 'text-blue-600 bg-blue-50',
  resolved: 'text-green-700 bg-green-50',
  closed: 'text-slate-500 bg-slate-100',
};

const DISPUTE_TYPE_LABELS = {
  damage: 'Damaged Goods',
  delay: 'Significant Delay',
  missing_item: 'Missing Items',
  wrong_delivery: 'Wrong Delivery',
  overcharge: 'Incorrect Charge',
  other: 'Other Issue',
};

const AdminDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [resolveModal, setResolveModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [resolveForm, setResolveForm] = useState({ status: 'in_review', resolution: '' });
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState('');

  const load = useCallback(async (p = page) => {
    setLoading(true);
    const params = { page: p, limit: PAGE_SIZE };
    if (statusFilter) params.status = statusFilter;
    const { data } = await disputesApi.getAll(params);
    setDisputes(data.disputes ?? []);
    setTotal(data.total ?? 0);
    setPage(data.page ?? 1);
    setPages(data.pages ?? 1);
    setLoading(false);
  }, [statusFilter, page]);

  useEffect(() => { load(1); }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(page); }, [page]);       // eslint-disable-line react-hooks/exhaustive-deps

  const openResolve = (dispute) => {
    setSelected(dispute);
    setResolveForm({ status: dispute.status === 'open' ? 'in_review' : 'resolved', resolution: '' });
    setResolveError('');
    setResolveModal(true);
  };

  const handleResolve = async () => {
    setResolving(true);
    setResolveError('');
    try {
      await disputesApi.resolve(selected._id, resolveForm);
      setResolveModal(false);
      load(page);
    } catch (err) {
      setResolveError(err.response?.data?.message || 'Update failed');
    } finally {
      setResolving(false);
    }
  };

  const columns = [
    { key: 'date', label: 'Filed', render: (r) => formatDate(r.created_at) },
    { key: 'client', label: 'Client', render: (r) => <span className="font-medium">{r.client_id?.name || '—'}</span> },
    { key: 'type', label: 'Type', render: (r) => DISPUTE_TYPE_LABELS[r.type] || r.type },
    {
      key: 'job', label: 'Job', render: (r) => r.job_id
        ? <span className="text-xs">{r.job_id.pickup_location} → {r.job_id.dropoff_location}</span>
        : '—'
    },
    { key: 'description', label: 'Description', render: (r) => <span className="text-xs text-slate-600 line-clamp-2">{r.description}</span> },
    {
      key: 'status', label: 'Status', render: (r) => (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[r.status]}`}>
          {r.status.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'actions', label: '', render: (r) => (
        !['resolved', 'closed'].includes(r.status)
          ? <Button size="sm" onClick={() => openResolve(r)}>Update</Button>
          : <span className="text-xs text-slate-400">Closed</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-orange-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {s ? s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'All'}
          </button>
        ))}
      </div>

      {loading ? <div className="text-slate-400 text-sm">Loading disputes...</div> : (
        <>
          <Table columns={columns} data={disputes} emptyMessage="No disputes filed." />
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

      <Modal open={resolveModal} onClose={() => setResolveModal(false)} title="Update Dispute" size="sm">
        {selected && (
          <div className="space-y-4">
            {resolveError && <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{resolveError}</div>}
            <div className="bg-slate-50 rounded-lg px-4 py-3 text-sm space-y-1">
              <p><span className="font-medium">Type:</span> {DISPUTE_TYPE_LABELS[selected.type]}</p>
              <p><span className="font-medium">Filed by:</span> {selected.client_id?.name}</p>
              <p><span className="font-medium">Description:</span> {selected.description}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Status</label>
              <select value={resolveForm.status} onChange={(e) => setResolveForm({ ...resolveForm, status: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                <option value="in_review">Under Review</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Resolution / Note</label>
              <textarea
                rows={2}
                value={resolveForm.resolution}
                onChange={(e) => setResolveForm({ ...resolveForm, resolution: e.target.value })}
                placeholder="Explain the resolution or action taken..."
                className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setResolveModal(false)}>Cancel</Button>
              <Button onClick={handleResolve} loading={resolving}>Save Update</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDisputes;
