import { useState, useEffect, useCallback } from 'react';
import { auditLogApi } from '../../services/api';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';

const ACTION_FILTERS = ['', 'assign_job', 'reassign_job', 'cancel_job', 'create_user', 'activate_user', 'deactivate_user', 'update_pricing'];
const PAGE_SIZE = 30;

const ACTION_COLORS = {
  assign_job: 'text-blue-600 bg-blue-50',
  reassign_job: 'text-indigo-600 bg-indigo-50',
  cancel_job: 'text-red-600 bg-red-50',
  create_user: 'text-green-700 bg-green-50',
  activate_user: 'text-green-600 bg-green-50',
  deactivate_user: 'text-orange-600 bg-orange-50',
  update_pricing: 'text-purple-600 bg-purple-50',
};

const ACTION_LABELS = {
  assign_job: 'Assign Job',
  reassign_job: 'Reassign Job',
  cancel_job: 'Cancel Job',
  create_user: 'Create User',
  activate_user: 'Activate User',
  deactivate_user: 'Deactivate User',
  update_pricing: 'Update Pricing',
};

const AdminAuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  const load = useCallback(async (p = page) => {
    setLoading(true);
    const params = { page: p, limit: PAGE_SIZE };
    if (actionFilter) params.action = actionFilter;
    const { data } = await auditLogApi.getAll(params);
    setLogs(data.logs ?? []);
    setTotal(data.total ?? 0);
    setPage(data.page ?? 1);
    setPages(data.pages ?? 1);
    setLoading(false);
  }, [actionFilter, page]);

  useEffect(() => { load(1); }, [actionFilter]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(page); }, [page]);       // eslint-disable-line react-hooks/exhaustive-deps

  const columns = [
    {
      key: 'time', label: 'Time', render: (r) => (
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {new Date(r.timestamp).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actor', label: 'Admin', render: (r) => (
        <div>
          <p className="font-medium text-sm">{r.actor_id?.name || '—'}</p>
          <p className="text-xs text-slate-400">{r.actor_id?.email}</p>
        </div>
      ),
    },
    {
      key: 'action', label: 'Action', render: (r) => (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ACTION_COLORS[r.action] || 'text-slate-600 bg-slate-100'}`}>
          {ACTION_LABELS[r.action] || r.action}
        </span>
      ),
    },
    { key: 'target_type', label: 'Target', render: (r) => <span className="capitalize text-sm text-slate-600">{r.target_type}</span> },
    { key: 'target_id', label: 'ID', render: (r) => <span className="font-mono text-xs text-slate-400">{r.target_id.slice(-8)}</span> },
    { key: 'details', label: 'Details', render: (r) => <span className="text-xs text-slate-500">{r.details || '—'}</span> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {ACTION_FILTERS.map((a) => (
          <button key={a} onClick={() => { setActionFilter(a); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${actionFilter === a ? 'bg-orange-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {a ? (ACTION_LABELS[a] || a) : 'All Actions'}
          </button>
        ))}
      </div>

      {loading ? <div className="text-slate-400 text-sm">Loading audit log...</div> : (
        <>
          <Table columns={columns} data={logs} emptyMessage="No audit log entries yet." />
          {pages > 1 && (
            <div className="flex items-center justify-between text-sm text-slate-500 pt-1">
              <span>{total} entries · page {page} of {pages}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                <Button size="sm" variant="secondary" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}>Next</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminAuditLog;
