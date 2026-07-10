import { useState, useEffect, useCallback } from 'react';
import { jobsApi, vehiclesApi, driversApi } from '../../services/api';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import StatusTimeline from '../../components/ui/StatusTimeline';
import { formatDate, formatKSH } from '../../utils/formatters';

const STATUS_FILTERS = ['', 'pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'];
const PAGE_SIZE = 20;

// Module-level so the inputs don't remount (and lose focus) on every keystroke
const AssignFields = ({ job, form, setForm, vehicles, drivers, error }) => (
  <div className="space-y-4">
    {error && <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
    <div className="bg-slate-50 rounded-lg p-4 text-sm space-y-1">
      <p><span className="font-medium">Route:</span> {job.pickup_location} → {job.dropoff_location}</p>
      <p><span className="font-medium">Cargo:</span> {job.cargo_type} — {job.weight_kg} kg</p>
      {job.vehicle_type && <p><span className="font-medium">Requested vehicle:</span> <span className="capitalize">{job.vehicle_type.replace(/_/g, ' ')}</span></p>}
    </div>
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle</label>
      <select value={form.vehicle_id} onChange={(e) => setForm((f) => ({ ...f, vehicle_id: e.target.value }))}
        className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
        <option value="">Select vehicle</option>
        {vehicles.map((v) => (
          <option key={v._id} value={v._id} disabled={v.capacity_kg < job.weight_kg}>
            {v.name} — {v.plate_number} ({v.type}, {v.capacity_kg} kg{v.capacity_kg < job.weight_kg ? ' — too small' : ''})
          </option>
        ))}
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Driver</label>
      <select value={form.driver_id} onChange={(e) => setForm((f) => ({ ...f, driver_id: e.target.value }))}
        className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
        <option value="">Select driver</option>
        {drivers.map((d) => (
          <option key={d._id} value={d._id}>{d.name} — {d.email}</option>
        ))}
      </select>
      {drivers.length === 0 && <p className="text-xs text-amber-600 mt-1">No available drivers right now.</p>}
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Price (KSH)</label>
        <input type="number" value={form.price_override}
          onChange={(e) => setForm((f) => ({ ...f, price_override: e.target.value }))}
          className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
        <p className="text-xs text-slate-400 mt-1">Final settlement price for the job.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Driver Cut (%)</label>
        <input type="number" min="0" max="100" value={form.driver_cut_percent}
          onChange={(e) => setForm((f) => ({ ...f, driver_cut_percent: e.target.value }))}
          className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
        <p className="text-xs text-slate-400 mt-1">
          {form.price_override > 0 && form.driver_cut_percent !== ''
            ? `Driver ${formatKSH(Math.round(form.price_override * form.driver_cut_percent / 100))} · Owner ${formatKSH(form.price_override - Math.round(form.price_override * form.driver_cut_percent / 100))}`
            : 'Owner receives the rest.'}
        </p>
      </div>
    </div>
  </div>
);

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [assignModal, setAssignModal] = useState(false);
  const [reassignModal, setReassignModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [assignForm, setAssignForm] = useState({ vehicle_id: '', driver_id: '', price_override: '' });
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');

  const load = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const params = { page: p, limit: PAGE_SIZE };
      if (statusFilter) params.status = statusFilter;
      const { data } = await jobsApi.getAll(params);
      setJobs(data.jobs);
      setTotal(data.total);
      setPage(data.page);
      setPages(data.pages);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { load(1); }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(page); }, [page]);       // eslint-disable-line react-hooks/exhaustive-deps

  const loadAssignOptions = async (job) => {
    setSelected(job);
    setAssignError('');
    try {
      const [vRes, dRes] = await Promise.all([vehiclesApi.getAvailable(), driversApi.getAvailable()]);
      setVehicles(vRes.data);
      setDrivers(dRes.data);
    } catch {
      setVehicles([]);
      setDrivers([]);
      setAssignError('Could not load available vehicles/drivers');
    }
    setAssignForm({
      vehicle_id: '',
      driver_id: '',
      price_override: job.final_price ?? job.suggested_price,
      driver_cut_percent: job.driver_cut_percent ?? 70,
    });
  };

  const openAssign = async (job) => {
    await loadAssignOptions(job);
    setAssignModal(true);
  };

  const openReassign = async (job) => {
    await loadAssignOptions(job);
    setReassignModal(true);
  };

  const handleAssign = async () => {
    if (!assignForm.vehicle_id || !assignForm.driver_id) return;
    setAssigning(true);
    setAssignError('');
    try {
      await jobsApi.assign(selected._id, assignForm);
      setAssignModal(false);
      load(page);
    } catch (err) {
      setAssignError(err.response?.data?.message || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  const handleReassign = async () => {
    if (!assignForm.vehicle_id || !assignForm.driver_id) return;
    setAssigning(true);
    setAssignError('');
    try {
      await jobsApi.reassign(selected._id, assignForm);
      setReassignModal(false);
      load(page);
    } catch (err) {
      setAssignError(err.response?.data?.message || 'Reassignment failed');
    } finally {
      setAssigning(false);
    }
  };

  const handleCancel = async () => {
    try {
      await jobsApi.cancel(cancelTarget._id, { note: 'Cancelled by admin' });
    } catch {
      // job list reload below will show the true state either way
    }
    setCancelModal(false);
    setCancelTarget(null);
    load(page);
  };

  const columns = [
    { key: 'id', label: '#', render: (r) => <span className="text-xs text-slate-400 font-mono">{r._id.slice(-6)}</span> },
    {
      key: 'client', label: 'Client', render: (r) => r.is_guest
        ? <span className="flex items-center gap-1">{r.guest_name}<span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-medium">Guest</span></span>
        : <span>{r.client_id?.name}</span>
    },
    { key: 'route', label: 'Route', render: (r) => <span className="text-xs">{r.pickup_location} → {r.dropoff_location}</span> },
    { key: 'cargo', label: 'Cargo', render: (r) => <span className="capitalize">{r.cargo_type?.replace(/_/g, ' ')}</span> },
    { key: 'weight', label: 'Weight', render: (r) => `${r.weight_kg} kg` },
    { key: 'price', label: 'Price', render: (r) => formatKSH(r.final_price ?? r.suggested_price) },
    { key: 'date', label: 'Pref. Date', render: (r) => formatDate(r.preferred_date) },
    { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
    { key: 'payment', label: 'Payment', render: (r) => <Badge status={r.payment_status || 'unpaid'} /> },
    {
      key: 'actions', label: '', render: (r) => (
        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
          <Button size="sm" variant="secondary" onClick={() => { setSelected(r); setDetailModal(true); }}>View</Button>
          {r.status === 'pending' && <Button size="sm" onClick={() => openAssign(r)}>Assign</Button>}
          {r.status === 'assigned' && <Button size="sm" variant="outline" onClick={() => openReassign(r)}>Reassign</Button>}
          {!['delivered', 'cancelled'].includes(r.status) && (
            <Button size="sm" variant="danger" onClick={() => { setCancelTarget(r); setCancelModal(true); }}>Cancel</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-orange-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            {s ? s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'All'}
          </button>
        ))}
      </div>

      {loading ? <div className="text-slate-400 text-sm">Loading jobs...</div> : (
        <>
          <Table columns={columns} data={jobs} emptyMessage="No jobs found." />

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

      {/* Assign Modal */}
      <Modal open={assignModal} onClose={() => setAssignModal(false)} title="Assign Job" size="md">
        {selected && (
          <div className="space-y-4">
            <AssignFields job={selected} form={assignForm} setForm={setAssignForm} vehicles={vehicles} drivers={drivers} error={assignError} />
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setAssignModal(false)}>Cancel</Button>
              <Button onClick={handleAssign} loading={assigning}>Confirm Assignment</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reassign Modal */}
      <Modal open={reassignModal} onClose={() => setReassignModal(false)} title="Reassign Job" size="md">
        {selected && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-800">
              The current driver and vehicle will be released and replaced.
            </div>
            <AssignFields job={selected} form={assignForm} setForm={setAssignForm} vehicles={vehicles} drivers={drivers} error={assignError} />
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setReassignModal(false)}>Cancel</Button>
              <Button onClick={handleReassign} loading={assigning}>Confirm Reassignment</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Confirm Modal */}
      <Modal open={cancelModal} onClose={() => { setCancelModal(false); setCancelTarget(null); }} title="Cancel Job" size="sm">
        {cancelTarget && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to cancel this job?
            </p>
            <div className="bg-slate-50 rounded-lg px-3 py-2 text-sm">
              <p className="font-medium">{cancelTarget.pickup_location} → {cancelTarget.dropoff_location}</p>
              <p className="text-slate-500 capitalize">{cancelTarget.cargo_type?.replace(/_/g, ' ')} — {cancelTarget.weight_kg} kg</p>
            </div>
            {cancelTarget.status !== 'pending' && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                The assigned driver and vehicle will be released.
              </p>
            )}
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => { setCancelModal(false); setCancelTarget(null); }}>Keep Job</Button>
              <Button variant="danger" onClick={handleCancel}>Yes, Cancel Job</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal open={detailModal} onClose={() => setDetailModal(false)} title="Job Details" size="lg">
        {selected && (
          <div className="space-y-5">
            <StatusTimeline currentStatus={selected.status} cancelledFromStatus={selected.cancelled_from_status} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400 text-xs">Client</p>
                {selected.is_guest ? (
                  <>
                    <p className="font-medium">{selected.guest_name} <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-medium ml-1">Guest</span></p>
                    <p className="text-slate-500">{selected.guest_email}</p>
                    <p className="text-slate-500">{selected.guest_phone}</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">{selected.client_id?.name}</p>
                    <p className="text-slate-500">{selected.client_id?.email}</p>
                  </>
                )}
              </div>
              <div><p className="text-slate-400 text-xs">Preferred Date</p><p className="font-medium">{formatDate(selected.preferred_date)}</p></div>
              <div><p className="text-slate-400 text-xs">Pickup</p><p className="font-medium">{selected.pickup_location}</p></div>
              <div><p className="text-slate-400 text-xs">Drop-off</p><p className="font-medium">{selected.dropoff_location}</p></div>
              <div><p className="text-slate-400 text-xs">Cargo / Weight</p><p className="font-medium capitalize">{selected.cargo_type?.replace(/_/g, ' ')} — {selected.weight_kg} kg</p></div>
              <div><p className="text-slate-400 text-xs">Price</p><p className="font-medium">{formatKSH(selected.final_price ?? selected.suggested_price)}</p></div>
              {selected.tracking_code && <div><p className="text-slate-400 text-xs">Tracking Code</p><p className="font-mono font-medium">{selected.tracking_code}</p></div>}
              {selected.notes && <div className="col-span-1 sm:col-span-2"><p className="text-slate-400 text-xs">Notes</p><p>{selected.notes}</p></div>}
            </div>
            {selected.vehicle_id && (
              <div className="bg-slate-50 rounded-lg p-3 text-sm">
                <p className="text-slate-400 text-xs mb-1">Assigned Vehicle</p>
                <p className="font-medium">{selected.vehicle_id?.name} — {selected.vehicle_id?.plate_number}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminJobs;
