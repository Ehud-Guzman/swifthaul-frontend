import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vehiclesApi } from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import { Car, Wallet, ClipboardList } from 'lucide-react';
import { vehicleTypeLabel } from '../../utils/formatters';

const OwnerDashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vehiclesApi.getAll().then((r) => setVehicles(r.data)).finally(() => setLoading(false));
  }, []);

  const available = vehicles.filter((v) => v.status === 'available').length;
  const assigned = vehicles.filter((v) => v.status === 'assigned').length;

  if (loading) return <div className="text-slate-400 text-sm">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Vehicles" value={vehicles.length} icon={Car} color="blue" />
        <StatCard title="On a Job" value={assigned} icon={ClipboardList} color="orange" />
        <StatCard title="Available" value={available} icon={Car} color="green" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">My Fleet</h3>
          <Link to="/owner/vehicles" className="text-sm text-orange-500 hover:underline">Manage →</Link>
        </div>
        {vehicles.length === 0 ? (
          <p className="text-sm text-slate-400">No vehicles registered yet.</p>
        ) : (
          <div className="space-y-3">
            {vehicles.map((v) => (
              <div key={v._id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div>
                  <p className="font-medium text-sm text-slate-800">{v.name}</p>
                  <p className="text-xs text-slate-400">{vehicleTypeLabel(v.type)} — {v.plate_number}</p>
                </div>
                <Badge status={v.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/owner/vehicles" className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
          <Car size={20} className="text-orange-500 mb-2" />
          <p className="font-semibold text-slate-800">Manage Vehicles</p>
          <p className="text-xs text-slate-400 mt-1">Add, edit, view job history →</p>
        </Link>
        <Link to="/owner/earnings" className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
          <Wallet size={20} className="text-green-500 mb-2" />
          <p className="font-semibold text-slate-800">View Earnings</p>
          <p className="text-xs text-slate-400 mt-1">Track revenue per vehicle →</p>
        </Link>
      </div>
    </div>
  );
};

export default OwnerDashboard;
