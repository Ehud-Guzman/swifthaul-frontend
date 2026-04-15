import { useState, useEffect } from 'react';
import { earningsApi } from '../../services/api';
import Table from '../../components/ui/Table';
import StatCard from '../../components/ui/StatCard';
import { formatKSH, formatDate } from '../../utils/formatters';
import { Wallet, ClipboardList, Truck } from 'lucide-react';

const DriverEarnings = () => {
  const [earnings, setEarnings] = useState([]);
  const [totalPay, setTotalPay] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    earningsApi.getDriverEarnings()
      .then(({ data }) => {
        setEarnings(data.earnings ?? []);
        setTotalPay(data.totalPay ?? 0);
      })
      .finally(() => setLoading(false));
  }, []);

  const avgPay = earnings.length ? Math.round(totalPay / earnings.length) : 0;

  const columns = [
    { key: 'id', label: '#', render: (r) => <span className="text-xs text-slate-400 font-mono">{r.job_id?._id?.slice(-6) ?? '—'}</span> },
    { key: 'route', label: 'Route', render: (r) => <span className="text-xs">{r.job_id?.pickup_location} → {r.job_id?.dropoff_location}</span> },
    { key: 'cargo', label: 'Cargo', render: (r) => <span className="capitalize">{r.job_id?.cargo_type?.replace(/_/g, ' ')}</span> },
    { key: 'vehicle', label: 'Vehicle', render: (r) => r.vehicle_id?.name || '—' },
    { key: 'date', label: 'Delivered', render: (r) => formatDate(r.recorded_at) },
    { key: 'pay', label: 'Your Pay (70%)', render: (r) => <span className="font-semibold text-green-700">{formatKSH(r.driver_cut_ksh)}</span> },
  ];

  if (loading) return <div className="text-slate-400 text-sm">Loading earnings...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Earnings" value={formatKSH(totalPay)} icon={Wallet} color="green" sub="Your 70% cut" />
        <StatCard title="Completed Jobs" value={earnings.length} icon={ClipboardList} color="blue" />
        <StatCard title="Avg. Per Job" value={earnings.length ? formatKSH(avgPay) : 'KSH 0'} icon={Truck} color="orange" />
      </div>

      <Table columns={columns} data={earnings} emptyMessage="No completed deliveries yet." />

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
        You receive 70% of each job price. Actual payment is arranged with admin.
      </div>
    </div>
  );
};

export default DriverEarnings;
