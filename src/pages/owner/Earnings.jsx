import { useState, useEffect } from 'react';
import { vehiclesApi } from '../../services/api';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import { formatKSH, formatDate, vehicleTypeLabel } from '../../utils/formatters';
import { Wallet, Car, ClipboardList } from 'lucide-react';

const OwnerEarnings = () => {
  const [vehicles, setVehicles] = useState([]);
  const [jobsByVehicle, setJobsByVehicle] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    vehiclesApi.getAll().then(async ({ data }) => {
      setVehicles(data);
      const jobMap = {};
      await Promise.all(
        data.map(async (v) => {
          const { data: jobs } = await vehiclesApi.getJobs(v._id);
          jobMap[v._id] = jobs.filter((j) => j.status === 'delivered');
        })
      );
      setJobsByVehicle(jobMap);
    }).finally(() => setLoading(false));
  }, []);

  const totalEarnings = vehicles.reduce((acc, v) => {
    return acc + (jobsByVehicle[v._id] || []).reduce((s, j) => s + (j.suggested_price || 0), 0);
  }, 0);

  const totalJobs = vehicles.reduce((acc, v) => acc + (jobsByVehicle[v._id]?.length || 0), 0);

  const jobCols = [
    { key: 'route', label: 'Route', render: (r) => `${r.pickup_location} → ${r.dropoff_location}` },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.preferred_date) },
    { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
    { key: 'earned', label: 'Earned', render: (r) => <span className="font-semibold text-green-700">{formatKSH(r.suggested_price)}</span> },
  ];

  if (loading) return <div className="text-slate-400 text-sm">Loading earnings...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Earnings" value={formatKSH(totalEarnings)} icon={Wallet} color="green" sub="From all vehicles" />
        <StatCard title="Completed Jobs" value={totalJobs} icon={ClipboardList} color="blue" />
        <StatCard title="Vehicles" value={vehicles.length} icon={Car} color="orange" />
      </div>

      <div className="space-y-4">
        {vehicles.map((v) => {
          const jobs = jobsByVehicle[v._id] || [];
          const earned = jobs.reduce((s, j) => s + (j.suggested_price || 0), 0);
          const isOpen = selected === v._id;
          return (
            <div key={v._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
                onClick={() => setSelected(isOpen ? null : v._id)}
              >
                <div className="flex items-center gap-3">
                  <Car size={18} className="text-orange-500" />
                  <div className="text-left">
                    <p className="font-semibold text-slate-800">{v.name}</p>
                    <p className="text-xs text-slate-400">{vehicleTypeLabel(v.type)} — {v.plate_number}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-700">{formatKSH(earned)}</p>
                  <p className="text-xs text-slate-400">{jobs.length} job{jobs.length !== 1 ? 's' : ''}</p>
                </div>
              </button>
              {isOpen && (
                <div className="px-5 pb-4 border-t border-slate-100">
                  <Table columns={jobCols} data={jobs} emptyMessage="No completed jobs for this vehicle." />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
        Note: Actual payouts are handled offline with admin. This view is for tracking purposes.
      </div>
    </div>
  );
};

export default OwnerEarnings;
