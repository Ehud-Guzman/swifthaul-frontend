import { useState, useEffect, useCallback } from 'react';
import { payoutsApi } from '../../services/api';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { formatKSH, formatDate } from '../../utils/formatters';

const STATUS_FILTERS = ['', 'pending', 'approved', 'rejected'];
const PAGE_SIZE = 20;

const STATUS_COLORS = {
  pending: 'text-amber-600 bg-amber-50',
  approved: 'text-green-700 bg-green-50',
  rejected: 'text-red-600 bg-red-50',
};

const AdminPayouts = () => {
  const [payouts, setPayouts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [reviewModal, setReviewModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [reviewForm, setReviewForm] = useState({ status: 'approved', admin_note: '' });
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const load = useCallback(async (p = page) => {
    setLoading(true);
    const params = { page: p, limit: PAGE_SIZE };
    if (statusFilter) params.status = statusFilter;
    const { data } = await payoutsApi.getAll(params);
    setPayouts(data.payouts ?? []);
    setTotal(data.total ?? 0);
    setPage(data.page ?? 1);
    setPages(data.pages ?? 1);
    setLoading(false);
  }, [statusFilter, page]);

  useEffect(() => { load(1); }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(page); }, [page]);       // eslint-disable-line react-hooks/exhaustive-deps

  const openReview = (payout) => {
    setSelected(payout);
    setReviewForm({ status: 'approved', admin_note: '' });
    setReviewError('');
    setReviewModal(true);
  };

  const handleReview = async () => {
    setReviewing(true);
    setReviewError('');
    try {
      await payoutsApi.review(selected._id, reviewForm);
      setReviewModal(false);
      load(page);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Review failed');
    } finally {
      setReviewing(false);
    }
  };

  const columns = [
    { key: 'date', label: 'Requested', render: (r) => formatDate(r.created_at) },
    { key: 'owner', label: 'Owner', render: (r) => <span className="font-medium">{r.owner_id?.name}</span> },
    { key: 'email', label: 'Email', render: (r) => r.owner_id?.email },
    { key: 'amount', label: 'Amount', render: (r) => <span className="font-semibold">{formatKSH(r.amount_ksh)}</span> },
    { key: 'note', label: 'Note', render: (r) => r.note || '—' },
    {
      key: 'status', label: 'Status', render: (r) => (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[r.status]}`}>
          {r.status}
        </span>
      ),
    },
    { key: 'admin_note', label: 'Admin Note', render: (r) => r.admin_note || '—' },
    {
      key: 'actions', label: '', render: (r) => (
        r.status === 'pending'
          ? <Button size="sm" onClick={() => openReview(r)}>Review</Button>
          : <span className="text-xs text-slate-400">Reviewed {formatDate(r.reviewed_at)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-orange-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {loading ? <div className="text-slate-400 text-sm">Loading payout requests...</div> : (
        <>
          <Table columns={columns} data={payouts} emptyMessage="No payout requests." />
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

      <Modal open={reviewModal} onClose={() => setReviewModal(false)} title="Review Payout Request" size="sm">
        {selected && (
          <div className="space-y-4">
            {reviewError && <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{reviewError}</div>}
            <div className="bg-slate-50 rounded-lg px-4 py-3 text-sm space-y-1">
              <p><span className="font-medium">Owner:</span> {selected.owner_id?.name}</p>
              <p><span className="font-medium">Amount:</span> {formatKSH(selected.amount_ksh)}</p>
              {selected.note && <p><span className="font-medium">Note:</span> {selected.note}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Decision</label>
              <div className="flex gap-3">
                {['approved', 'rejected'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setReviewForm({ ...reviewForm, status: s })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize border transition-colors ${
                      reviewForm.status === s
                        ? s === 'approved' ? 'bg-green-600 text-white border-green-600' : 'bg-red-600 text-white border-red-600'
                        : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Note to Owner (optional)</label>
              <input
                type="text"
                value={reviewForm.admin_note}
                onChange={(e) => setReviewForm({ ...reviewForm, admin_note: e.target.value })}
                placeholder={reviewForm.status === 'rejected' ? 'Reason for rejection...' : 'e.g. Payment sent via M-Pesa'}
                className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setReviewModal(false)}>Cancel</Button>
              <Button onClick={handleReview} loading={reviewing}>Confirm</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminPayouts;
