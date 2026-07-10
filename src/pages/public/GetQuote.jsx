import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, ArrowLeft, Info, Copy, Check } from 'lucide-react';
import { publicApi } from '../../services/api';
import { formatKSH, vehicleTypeLabel } from '../../utils/formatters';

const CARGO_TYPES = ['general', 'heavy_equipment', 'fragile', 'perishable', 'other'];
const VEHICLE_TYPES = ['mini_van', 'truck_3t', 'flatbed', 'semi_trailer'];

const GetQuote = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = form, 2 = success
  const [form, setForm] = useState({
    guest_name: '', guest_email: '', guest_phone: '',
    cargo_type: 'general', weight_kg: '', pickup_location: '',
    dropoff_location: '', preferred_date: '', notes: '', vehicle_type: '',
  });
  const [estimates, setEstimates] = useState([]);
  const [estimating, setEstimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const getEstimates = async () => {
    if (!form.weight_kg || Number(form.weight_kg) <= 0) return;
    setEstimating(true);
    const results = await Promise.allSettled(
      VEHICLE_TYPES.map((vt) => publicApi.estimate({ vehicle_type: vt, weight_kg: Number(form.weight_kg) }))
    );
    setEstimates(results.filter((r) => r.status === 'fulfilled').map((r) => r.value.data));
    setEstimating(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.vehicle_type) {
      setError('Please enter your cargo weight and select a vehicle type from the price estimates.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setLoading(true);
    try {
      const { data } = await publicApi.submitQuote(form);
      setResult(data);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyId = () => {
    navigator.clipboard.writeText(result.tracking_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm">
            <ArrowLeft size={16} />
            Back to Home
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-orange-500 rounded-md flex items-center justify-center">
              <Truck size={13} className="text-white" />
            </div>
            <span className="font-bold text-slate-800">SwiftHaul</span>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {step === 1 ? (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-2">Request a Delivery</h1>
              <p className="text-slate-500 text-sm">No account needed. We'll contact you once your request is reviewed.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
              )}

              {/* Contact info */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <h2 className="font-semibold text-slate-800">Your Contact Info</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input type="text" required value={form.guest_name} placeholder="e.g. James Mwangi"
                      onChange={(e) => set('guest_name', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    <input type="tel" required value={form.guest_phone} placeholder="e.g. 0712 345 678"
                      onChange={(e) => set('guest_phone', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input type="email" required value={form.guest_email} placeholder="you@example.com"
                    onChange={(e) => set('guest_email', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
              </div>

              {/* Cargo details */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <h2 className="font-semibold text-slate-800">Cargo Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cargo Type</label>
                    <select value={form.cargo_type} onChange={(e) => set('cargo_type', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                      {CARGO_TYPES.map((t) => (
                        <option key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
                    <input type="number" min="1" required value={form.weight_kg} placeholder="e.g. 2000"
                      onChange={(e) => set('weight_kg', e.target.value)}
                      onBlur={getEstimates}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                </div>

                {/* Price estimates */}
                {estimating && (
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <span className="w-3 h-3 border-2 border-orange-400 border-t-transparent rounded-full animate-spin inline-block" />
                    Calculating estimates...
                  </p>
                )}
                {estimates.length > 0 && (
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Info size={14} className="text-orange-500" />
                      <span className="text-sm font-medium text-orange-700">Estimated Prices — click to select</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {estimates.map((e) => (
                        <button key={e.vehicle_type} type="button"
                          onClick={() => set('vehicle_type', e.vehicle_type)}
                          className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${form.vehicle_type === e.vehicle_type ? 'border-orange-500 bg-orange-100' : 'border-slate-200 bg-white hover:border-orange-300'}`}>
                          <p className="font-medium text-slate-700">{vehicleTypeLabel(e.vehicle_type)}</p>
                          <p className="text-orange-600 font-semibold">{formatKSH(e.estimated_price)}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pickup Location</label>
                  <input type="text" required value={form.pickup_location} placeholder="e.g. Nairobi CBD"
                    onChange={(e) => set('pickup_location', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Drop-off Location</label>
                  <input type="text" required value={form.dropoff_location} placeholder="e.g. Mombasa Port"
                    onChange={(e) => set('dropoff_location', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Date</label>
                  <input type="date" required value={form.preferred_date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => set('preferred_date', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes (optional)</label>
                  <textarea value={form.notes} rows={3} placeholder="Special handling, access instructions..."
                    onChange={(e) => set('notes', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>

              <p className="text-center text-xs text-slate-400">
                Already have an account?{' '}
                <button type="button" onClick={() => navigate('/login')} className="text-orange-500 hover:underline font-medium">
                  Sign in
                </button>
              </p>
            </form>
          </>
        ) : (
          /* Success screen */
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={32} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Request Submitted!</h1>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
              Our team will review your request and contact you at <strong>{form.guest_email}</strong>.
              Save your tracking code below to follow your shipment.
            </p>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm mx-auto mb-8">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Your Tracking Code</p>
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
                <code className="flex-1 text-sm font-mono text-slate-800 break-all">{result?.tracking_id}</code>
                <button onClick={copyId} className="text-slate-400 hover:text-orange-500 transition-colors flex-shrink-0">
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>
              {result?.suggested_price > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-0.5">Estimated Price</p>
                  <p className="text-lg font-bold text-orange-600">{formatKSH(result.suggested_price)}</p>
                  <p className="text-xs text-slate-400">Final price confirmed upon assignment</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => navigate('/track')}
                className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                Track This Shipment
              </button>
              <button onClick={() => navigate('/')}
                className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-3 rounded-xl transition-colors">
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GetQuote;
