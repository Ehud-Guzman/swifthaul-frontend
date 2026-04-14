import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobsApi } from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import { Package, ClipboardList, CheckCircle, Clock } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const ClientDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobsApi.getAll().then((r) => setJobs(r.data)).finally(() => setLoading(false));
  }, []);

  const active = jobs.filter((j) => ['assigned', 'picked_up', 'in_transit'].includes(j.status));
  const delivered = jobs.filter((j) => j.status === 'delivered');
  const pending = jobs.filter((j) => j.status === 'pending');

  if (loading) return <div className="text-slate-400 text-sm">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Total Jobs" value={jobs.length} icon={ClipboardList} color="blue" />
        <StatCard title="Pending" value={pending.length} icon={Clock} color="orange" />
        <StatCard title="In Transit" value={active.length} icon={Package} color="purple" />
        <StatCard title="Delivered" value={delivered.length} icon={CheckCircle} color="green" />
      </div>

      <div className="flex gap-4">
        <Link to="/client/request"
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl p-5 transition-colors">
          <Package size={22} className="mb-2" />
          <p className="font-semibold">Request a Job</p>
          <p className="text-xs text-orange-100 mt-1">Submit a new cargo delivery →</p>
        </Link>
        <Link to="/client/jobs"
          className="flex-1 bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
          <ClipboardList size={22} className="text-slate-600 mb-2" />
          <p className="font-semibold text-slate-800">My Jobs</p>
          <p className="text-xs text-slate-400 mt-1">Track all deliveries →</p>
        </Link>
      </div>

      {active.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Active Deliveries</h3>
          <div className="space-y-3">
            {active.map((j) => (
              <Link key={j._id} to={`/client/jobs`}
                className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 hover:bg-slate-50 px-2 rounded-lg transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-800">{j.pickup_location} → {j.dropoff_location}</p>
                  <p className="text-xs text-slate-400">{formatDate(j.preferred_date)}</p>
                </div>
                <Badge status={j.status} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
