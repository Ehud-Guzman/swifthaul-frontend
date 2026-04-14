import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, Users, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { analyticsApi } from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import { formatKSH } from '../../utils/formatters';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.overview().then((r) => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-slate-400 text-sm">Loading overview...</div>;
  if (!data) return <div className="text-red-500 text-sm">Failed to load data.</div>;

  const statusMap = data.byStatus || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Jobs Today" value={data.jobs.today} icon={Package} color="orange" />
        <StatCard title="Jobs This Week" value={data.jobs.week} icon={Clock} color="blue" />
        <StatCard title="Jobs This Month" value={data.jobs.month} icon={CheckCircle} color="green" />
        <StatCard title="Month Revenue" value={formatKSH(data.monthRevenue)} icon={DollarSign} color="purple" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pending" value={statusMap.pending || 0} icon={AlertCircle} color="orange" />
        <StatCard title="In Transit" value={(statusMap.in_transit || 0) + (statusMap.picked_up || 0)} icon={Truck} color="blue" />
        <StatCard title="Delivered" value={statusMap.delivered || 0} icon={CheckCircle} color="green" />
        <StatCard title="Active Vehicles" value={data.activeVehicles} icon={Truck} color="slate" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/admin/jobs?status=pending" className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
          <p className="text-sm font-semibold text-slate-800">Pending Jobs Queue</p>
          <p className="text-3xl font-bold text-orange-500 mt-1">{statusMap.pending || 0}</p>
          <p className="text-xs text-slate-400 mt-1">Awaiting assignment →</p>
        </Link>
        <Link to="/admin/vehicles?status=available" className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
          <p className="text-sm font-semibold text-slate-800">Available Vehicles</p>
          <p className="text-3xl font-bold text-green-500 mt-1">{statusMap.available || '—'}</p>
          <p className="text-xs text-slate-400 mt-1">Ready to assign →</p>
        </Link>
        <Link to="/admin/users?role=driver" className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
          <p className="text-sm font-semibold text-slate-800">Drivers</p>
          <p className="text-3xl font-bold text-blue-500 mt-1"><Users size={28} className="inline" /></p>
          <p className="text-xs text-slate-400 mt-1">View all drivers →</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
