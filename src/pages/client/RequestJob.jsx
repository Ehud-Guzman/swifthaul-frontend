import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsApi, pricingApi } from '../../services/api';
import Button from '../../components/ui/Button';
import { formatKSH, vehicleTypeLabel } from '../../utils/formatters';
import { Info } from 'lucide-react';

const CARGO_TYPES = ['general', 'heavy_equipment', 'fragile', 'perishable', 'other'];
const VEHICLE_TYPES = ['mini_van', 'truck_3t', 'flatbed', 'semi_trailer'];

const RequestJob = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    cargo_type: 'general', weight_kg: '', pickup_location: '',
    dropoff_location: '', preferred_date: '', notes: '', vehicle_type: '',
  });
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [error, setError] = useState('');

  const getEstimates = async () => {
    if (!form.weight_kg) return;
    setEstimating(true);
    const results = await Promise.allSettled(
      VEHICLE_TYPES.map((vt) => pricingApi.estimate({ vehicle_type: vt, weight_kg: Number(form.weight_kg) }))
    );
    setEstimates(results.filter((r) => r.status === 'fulfilled').map((r) => r.value.data));
    setEstimating(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await jobsApi.create(form);
      navigate('/client/jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl border border-slate-200 p-6">
        {error && <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</div>}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cargo Type</label>
            <select value={form.cargo_type} onChange={(e) => setForm({ ...form, cargo_type: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
              {CARGO_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
            <div className="flex gap-2">
              <input type="number" min="1" required value={form.weight_kg}
                onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
                onBlur={getEstimates} placeholder="e.g. 2000"
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>
        </div>

        {/* Price Estimates */}
        {estimates.length > 0 && (
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info size={14} className="text-orange-500" />
              <span className="text-sm font-medium text-orange-700">Estimated Prices by Vehicle Type</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {estimates.map((e) => (
                <button key={e.vehicle_type} type="button"
                  onClick={() => setForm((f) => ({ ...f, vehicle_type: e.vehicle_type }))}
                  className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${form.vehicle_type === e.vehicle_type ? 'border-orange-500 bg-orange-100' : 'border-slate-200 bg-white hover:border-orange-300'}`}>
                  <p className="font-medium text-slate-700">{vehicleTypeLabel(e.vehicle_type)}</p>
                  <p className="text-orange-600 font-semibold">{formatKSH(e.estimated_price)}</p>
                </button>
              ))}
            </div>
            {estimating && <p className="text-xs text-slate-400 mt-2">Calculating estimates...</p>}
          </div>
        )}

        {[['Pickup Location', 'pickup_location', 'text', 'e.g. Nairobi CBD'], ['Drop-off Location', 'dropoff_location', 'text', 'e.g. Mombasa Port']].map(([label, key, type, ph]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            <input type={type} required value={form[key]} placeholder={ph}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Date</label>
          <input type="date" required value={form.preferred_date}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes (optional)</label>
          <textarea value={form.notes} rows={3}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Any special handling instructions..."
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="secondary" onClick={() => navigate('/client/jobs')}>Cancel</Button>
          <Button type="submit" loading={loading}>Submit Request</Button>
        </div>
      </form>
    </div>
  );
};

export default RequestJob;
