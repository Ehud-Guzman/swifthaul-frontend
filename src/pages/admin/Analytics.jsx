import { useState, useEffect } from 'react';
import { analyticsApi } from '../../services/api';
import JobsChart from '../../components/charts/JobsChart';
import RevenueChart from '../../components/charts/RevenueChart';
import VehicleTypePie from '../../components/charts/VehicleTypePie';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import { formatKSH } from '../../utils/formatters';
import { Download } from 'lucide-react';

const AdminAnalytics = () => {
  const [period, setPeriod] = useState('daily');
  const [jobs, setJobs] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      analyticsApi.jobs({ period }),
      analyticsApi.revenue({ period }),
      analyticsApi.vehicles(),
      analyticsApi.drivers(),
      analyticsApi.owners(),
    ]).then(([j, r, v, d, o]) => {
      setJobs(j.data);
      setRevenue(r.data);
      setVehicles(v.data);
      setDrivers(d.data);
      setOwners(o.data);
    }).finally(() => setLoading(false));
  }, [period]);

  const downloadCSV = async (fn, name) => {
    const { data } = await fn();
    const url = URL.createObjectURL(new Blob([data], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };

  const driverCols = [
    { key: 'name', label: 'Driver' },
    { key: 'email', label: 'Email' },
    { key: 'completed', label: 'Jobs Completed', render: (r) => <span className="font-semibold">{r.completed}</span> },
  ];
  const ownerCols = [
    { key: 'name', label: 'Owner' },
    { key: 'email', label: 'Email' },
    { key: 'jobs', label: 'Jobs' },
    { key: 'total_ksh', label: 'Total Earnings', render: (r) => <span className="font-semibold text-green-700">{formatKSH(r.total_ksh)}</span> },
  ];

  const PERIODS = [{ value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }, { value: 'monthly', label: 'Monthly' }];

  return (
    <div className="space-y-6">
      {/* Period Selector + Exports */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${period === p.value ? 'bg-orange-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => downloadCSV(analyticsApi.exportJobs, 'swifthaul_jobs.csv')}>
            <Download size={13} /> Jobs CSV
          </Button>
          <Button size="sm" variant="outline" onClick={() => downloadCSV(analyticsApi.exportEarnings, 'swifthaul_earnings.csv')}>
            <Download size={13} /> Earnings CSV
          </Button>
        </div>
      </div>

      {loading ? <div className="text-slate-400 text-sm">Loading analytics...</div> : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Jobs Over Time</h3>
              <JobsChart data={jobs} />
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Revenue Over Time</h3>
              <RevenueChart data={revenue} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Jobs by Vehicle Type</h3>
            <VehicleTypePie data={vehicles} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Top Drivers</h3>
              <Table columns={driverCols} data={drivers} emptyMessage="No driver data." />
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Owner Earnings Breakdown</h3>
              <Table columns={ownerCols} data={owners} emptyMessage="No earnings data." />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;
