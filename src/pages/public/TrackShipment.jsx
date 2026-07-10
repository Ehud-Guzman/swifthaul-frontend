import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Truck, ArrowLeft, Search, MapPin, Package, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { publicApi } from '../../services/api';
import { formatDate, formatDateTime, statusLabel } from '../../utils/formatters';
import ShipmentMap from '../../components/map/ShipmentMap';
import MpesaPayCard from '../../components/payments/MpesaPayCard';

const LIVE_STATUSES = ['picked_up', 'in_transit'];

const STATUS_ORDER = ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered'];

const STATUS_META = {
  pending:    { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', dot: 'bg-yellow-400', icon: Clock },
  assigned:   { color: 'text-blue-600 bg-blue-50 border-blue-200',       dot: 'bg-blue-500',   icon: Truck },
  picked_up:  { color: 'text-indigo-600 bg-indigo-50 border-indigo-200', dot: 'bg-indigo-500', icon: Package },
  in_transit: { color: 'text-purple-600 bg-purple-50 border-purple-200', dot: 'bg-purple-500', icon: Truck },
  delivered:  { color: 'text-green-600 bg-green-50 border-green-200',    dot: 'bg-green-500',  icon: CheckCircle },
  cancelled:  { color: 'text-red-600 bg-red-50 border-red-200',          dot: 'bg-red-500',    icon: AlertCircle },
};

const TrackShipment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runTrack = async (code) => {
    if (!code.trim()) return;
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const { data } = await publicApi.track(code.trim());
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not find that tracking code. Please double-check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = (e) => {
    e.preventDefault();
    runTrack(trackingId);
  };

  // Deep link support: /track?id=SH-XXXX from the landing tracking widget
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setTrackingId(id);
      runTrack(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // While the shipment is actually moving, poll quietly (no spinner/reset)
  // so the map and status refresh without the page flashing empty.
  useEffect(() => {
    if (!LIVE_STATUSES.includes(result?.job?.status)) return;
    const code = result.job.tracking_code;
    const interval = setInterval(async () => {
      try {
        const { data } = await publicApi.track(code);
        setResult(data);
      } catch {
        // Silent — the next tick will retry, and any real error already
        // surfaced to the user on the initial lookup.
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [result?.job?.status, result?.job?.tracking_code]);

  const { job, logs } = result || {};
  const meta = job ? (STATUS_META[job.status] || STATUS_META.pending) : null;
  const currentStep = job ? STATUS_ORDER.indexOf(job.status) : -1;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Track Your Shipment</h1>
          <p className="text-slate-500 text-sm">Enter the tracking code you received after submitting your request (e.g. SH-A7K2M9QX).</p>
        </div>

        {/* Search form */}
        <form onSubmit={handleTrack} className="flex gap-3 mb-8">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Enter your tracking code, e.g. SH-A7K2M9QX"
              className="w-full pl-9 pr-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
            />
          </div>
          <button type="submit" disabled={loading || !trackingId.trim()}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 text-sm">
            {loading
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Search size={16} />}
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {job && (
          <div className="space-y-5">
            {/* Status card */}
            <div className={`rounded-2xl border p-6 ${meta.color}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">Current Status</p>
                  <p className="text-xl font-bold">{statusLabel(job.status)}</p>
                  <p className="text-sm opacity-70 mt-1">Last updated {formatDateTime(job.updated_at)}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white/50`}>
                  {(() => { const Icon = meta.icon; return <Icon size={22} />; })()}
                </div>
              </div>
            </div>

            {/* Payment */}
            {job.status !== 'cancelled' && (
              <MpesaPayCard
                trackingCode={job.tracking_code}
                amount={job.final_price ?? job.suggested_price}
                paymentStatus={job.payment_status}
                onPaid={() => runTrack(job.tracking_code)}
              />
            )}

            {/* Job details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h2 className="font-semibold text-slate-800">Shipment Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs mb-0.5">Cargo Type</p>
                  <p className="font-medium">{statusLabel(job.cargo_type)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-0.5">Weight</p>
                  <p className="font-medium">{job.weight_kg?.toLocaleString()} kg</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-0.5">Preferred Date</p>
                  <p className="font-medium">{formatDate(job.preferred_date)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-0.5">Submitted</p>
                  <p className="font-medium">{formatDate(job.created_at)}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400 text-xs">Pickup </span>
                    <span className="font-medium">{job.pickup_location}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400 text-xs">Drop-off </span>
                    <span className="font-medium">{job.dropoff_location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live map — shown once we have at least one resolved point */}
            {(job.pickup_coords?.lat != null || job.dropoff_coords?.lat != null || job.current_location?.lat != null) && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-slate-800">Live Map</h2>
                  {job.current_location?.lat != null && (
                    <span className="flex items-center gap-1.5 bg-orange-50 text-orange-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-orange-200">
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                      Updated {formatDateTime(job.current_location.updated_at)}
                    </span>
                  )}
                </div>
                <ShipmentMap
                  pickupCoords={job.pickup_coords}
                  dropoffCoords={job.dropoff_coords}
                  currentLocation={job.current_location}
                />
              </div>
            )}

            {/* Progress bar — only for active statuses */}
            {job.status !== 'cancelled' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-semibold text-slate-800 mb-5">Progress</h2>
                <div className="flex items-center gap-0">
                  {STATUS_ORDER.map((s, i) => {
                    const done = i <= currentStep;
                    const active = i === currentStep;
                    return (
                      <div key={s} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center">
                          <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${done ? 'bg-orange-500 border-orange-500' : 'bg-white border-slate-300'} ${active ? 'ring-4 ring-orange-100' : ''}`}>
                            {done && <CheckCircle size={14} className="text-white" />}
                          </div>
                          <p className={`text-xs mt-1.5 text-center leading-tight max-w-[60px] ${done ? 'text-orange-600 font-semibold' : 'text-slate-400'}`}>
                            {statusLabel(s)}
                          </p>
                        </div>
                        {i < STATUS_ORDER.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1 mb-5 transition-colors ${i < currentStep ? 'bg-orange-500' : 'bg-slate-200'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Status history */}
            {logs?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-semibold text-slate-800 mb-4">Status History</h2>
                <div className="space-y-4">
                  {logs.map((log, i) => {
                    const m = STATUS_META[log.new_status] || STATUS_META.pending;
                    return (
                      <div key={i} className="flex gap-3 text-sm">
                        <div className="flex flex-col items-center gap-1">
                          <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${m.dot}`} />
                          {i < logs.length - 1 && <div className="w-px flex-1 bg-slate-200" />}
                        </div>
                        <div className="pb-4">
                          <p className="font-semibold">{statusLabel(log.new_status)}</p>
                          {log.note && <p className="text-slate-500 text-xs mt-0.5">{log.note}</p>}
                          <p className="text-slate-400 text-xs mt-1">{formatDateTime(log.timestamp)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="text-center text-xs text-slate-400 pt-2">
              Have an account?{' '}
              <button onClick={() => navigate('/login')} className="text-orange-500 hover:underline font-medium">
                Sign in for more details
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackShipment;
