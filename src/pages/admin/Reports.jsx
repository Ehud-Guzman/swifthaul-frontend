import { useState, useEffect } from 'react';
import { reportsApi, analyticsApi, usersApi } from '../../services/api';
import Button from '../../components/ui/Button';
import {
  FileText, Download, Users2, Truck, ClipboardList,
  Wallet, AlertTriangle, ShieldCheck, FileBarChart,
} from 'lucide-react';

const downloadBlob = async (fn, params, name) => {
  const { data } = await fn(params);
  const url = URL.createObjectURL(new Blob([data]));
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
};

const ReportCard = ({ icon: Icon, title, description, children }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-3">
    <div className="flex items-center gap-3">
      <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 shrink-0">
        <Icon size={18} />
      </div>
      <div>
        <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
    </div>
    {children}
  </div>
);

const AdminReports = () => {
  const [range, setRange] = useState({ from: '', to: '' });
  const [owners, setOwners] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [busy, setBusy] = useState('');

  useEffect(() => {
    usersApi.getAll({ role: 'owner', limit: 200 }).then(({ data }) => setOwners(data.users ?? []));
    usersApi.getAll({ role: 'driver', limit: 200 }).then(({ data }) => setDrivers(data.users ?? []));
  }, []);

  const rangeParams = () => {
    const params = {};
    if (range.from) params.from = range.from;
    if (range.to) params.to = range.to;
    return params;
  };

  const run = async (key, fn, params, name) => {
    setBusy(key);
    try {
      await downloadBlob(fn, params, name);
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Date range filter — applies to all reports below where relevant */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 text-sm mb-1">Report Date Range</h3>
        <p className="text-xs text-slate-400 mb-3">Optional — leave blank to include all-time data. Applies to every export below.</p>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">From</label>
            <input
              type="date"
              value={range.from}
              onChange={(e) => setRange({ ...range, from: e.target.value })}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">To</label>
            <input
              type="date"
              value={range.to}
              onChange={(e) => setRange({ ...range, to: e.target.value })}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          {(range.from || range.to) && (
            <Button size="sm" variant="ghost" onClick={() => setRange({ from: '', to: '' })}>Clear</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ReportCard icon={FileBarChart} title="Business Summary" description="Jobs, revenue, top owners/drivers & disputes — one PDF.">
          <Button size="sm" loading={busy === 'summary'} onClick={() => run('summary', reportsApi.businessSummary, rangeParams(), 'swifthaul_business_summary.pdf')}>
            <Download size={13} /> Download PDF
          </Button>
        </ReportCard>

        <ReportCard icon={ClipboardList} title="Jobs Report" description="Every job request in the selected range, CSV.">
          <Button size="sm" loading={busy === 'jobs'} onClick={() => run('jobs', analyticsApi.exportJobs, rangeParams(), 'swifthaul_jobs.csv')}>
            <Download size={13} /> Download CSV
          </Button>
        </ReportCard>

        <ReportCard icon={Wallet} title="Earnings Report" description="Owner/driver cuts on every completed job, CSV.">
          <Button size="sm" loading={busy === 'earnings'} onClick={() => run('earnings', analyticsApi.exportEarnings, undefined, 'swifthaul_earnings.csv')}>
            <Download size={13} /> Download CSV
          </Button>
        </ReportCard>

        <ReportCard icon={Truck} title="Payouts Report" description="All payout requests and their review status, CSV.">
          <Button size="sm" loading={busy === 'payouts'} onClick={() => run('payouts', reportsApi.exportPayouts, rangeParams(), 'swifthaul_payouts.csv')}>
            <Download size={13} /> Download CSV
          </Button>
        </ReportCard>

        <ReportCard icon={AlertTriangle} title="Disputes Report" description="Filed disputes with resolution details, CSV.">
          <Button size="sm" loading={busy === 'disputes'} onClick={() => run('disputes', reportsApi.exportDisputes, rangeParams(), 'swifthaul_disputes.csv')}>
            <Download size={13} /> Download CSV
          </Button>
        </ReportCard>

        <ReportCard icon={ShieldCheck} title="Audit Log Report" description="Admin actions across the platform, CSV.">
          <Button size="sm" loading={busy === 'audit'} onClick={() => run('audit', reportsApi.exportAuditLog, rangeParams(), 'swifthaul_audit_log.csv')}>
            <Download size={13} /> Download CSV
          </Button>
        </ReportCard>

        <ReportCard icon={Users2} title="Owner Statement" description="Per-owner earnings statement, PDF.">
          <select
            value={selectedOwner}
            onChange={(e) => setSelectedOwner(e.target.value)}
            className="border border-slate-200 rounded-lg px-2 py-2 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="">Select an owner…</option>
            {owners.map((o) => <option key={o._id} value={o._id}>{o.name} ({o.email})</option>)}
          </select>
          <Button
            size="sm"
            disabled={!selectedOwner}
            loading={busy === 'owner-statement'}
            onClick={() => run('owner-statement', reportsApi.ownerStatement, { ...rangeParams(), owner_id: selectedOwner }, 'swifthaul_owner_statement.pdf')}
          >
            <FileText size={13} /> Download PDF
          </Button>
        </ReportCard>

        <ReportCard icon={Users2} title="Driver Statement" description="Per-driver earnings statement, PDF.">
          <select
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
            className="border border-slate-200 rounded-lg px-2 py-2 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="">Select a driver…</option>
            {drivers.map((d) => <option key={d._id} value={d._id}>{d.name} ({d.email})</option>)}
          </select>
          <Button
            size="sm"
            disabled={!selectedDriver}
            loading={busy === 'driver-statement'}
            onClick={() => run('driver-statement', reportsApi.driverStatement, { ...rangeParams(), driver_id: selectedDriver }, 'swifthaul_driver_statement.pdf')}
          >
            <FileText size={13} /> Download PDF
          </Button>
        </ReportCard>
      </div>
    </div>
  );
};

export default AdminReports;
