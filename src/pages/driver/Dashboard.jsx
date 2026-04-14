import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobsApi } from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import { ClipboardList, CheckCircle, Truck } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const DriverDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobsApi.getAll().then((r) => setJobs(r.data)).finally(() => setLoading(false));
  }, []);

  const active = jobs.find((j) => ['picked_up', 'in_transit'].includes(j.status));
  const assigned = jobs.filter((j) => j.status === 'assigned');
  const delivered = jobs.filter((j) => j.status === 'delivered');

  if (loading) return <div className="text-slate-400 text-sm">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Active Job" value={active ? '1' : 'None'} icon={Truck} color={active ? 'orange' : 'slate'} />
        <StatCard title="Upcoming Jobs" value={assigned.length} icon={ClipboardList} color="blue" />
        <StatCard title="Completed" value={delivered.length} icon={CheckCircle} color="green" />
      </div>

      {active && (
        <Link to="/driver/jobs" className="block bg-orange-50 border-2 border-orange-400 rounded-2xl p-5 hover:shadow-md transition-shadow">
          <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-1">Active Job</p>
          <p className="font-bold text-slate-800">{active.pickup_location} → {active.dropoff_location}</p>
          <div className="flex items-center gap-3 mt-2">
            <Badge status={active.status} />
            <span className="text-xs text-slate-500">{formatDate(active.preferred_date)}</span>
          </div>
          <p className="text-xs text-orange-600 mt-3 font-medium">Tap to update status →</p>
        </Link>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Upcoming Jobs</h3>
          <Link to="/driver/jobs" className="text-sm text-orange-500 hover:underline">View all →</Link>
        </div>
        {assigned.length === 0 ? (
          <p className="text-sm text-slate-400">No upcoming jobs.</p>
        ) : (
          <div className="space-y-3">
            {assigned.slice(0, 3).map((j) => (
              <div key={j._id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-800">{j.pickup_location} → {j.dropoff_location}</p>
                  <p className="text-xs text-slate-400">{formatDate(j.preferred_date)}</p>
                </div>
                <Badge status={j.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
