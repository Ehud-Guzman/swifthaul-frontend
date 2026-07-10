import { useState, useEffect, useRef, useCallback } from 'react';
import { Smartphone, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { paymentsApi } from '../../services/api';
import { formatKSH } from '../../utils/formatters';

const POLL_INTERVAL_MS = 4000;
const MAX_POLLS = 30; // ~2 minutes

const MpesaPayCard = ({ trackingCode, amount, paymentStatus, defaultPhone = '', onPaid }) => {
  const [enabled, setEnabled] = useState(null); // null = still checking
  const [phone, setPhone] = useState(defaultPhone);
  const [submitting, setSubmitting] = useState(false);
  const [pollStatus, setPollStatus] = useState(null); // 'pending' | 'success' | 'failed' | 'cancelled' | 'timeout'
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');
  const pollCountRef = useRef(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    paymentsApi.getMpesaConfig()
      .then(({ data }) => setEnabled(Boolean(data.enabled)))
      .catch(() => setEnabled(false));
  }, []);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const checkStatus = useCallback(async (id) => {
    try {
      const { data } = await paymentsApi.getStatus(id);
      if (data.status === 'success') {
        setPollStatus('success');
        setReceipt(data.mpesa_receipt_number);
        stopPolling();
        onPaid?.();
      } else if (data.status === 'failed' || data.status === 'cancelled') {
        setPollStatus(data.status);
        stopPolling();
      }
      // still pending — keep polling
    } catch {
      // transient — next tick retries
    }
  }, [stopPolling, onPaid]);

  const startPolling = (id) => {
    pollCountRef.current = 0;
    intervalRef.current = setInterval(() => {
      pollCountRef.current += 1;
      if (pollCountRef.current > MAX_POLLS) {
        setPollStatus('timeout');
        stopPolling();
        return;
      }
      checkStatus(id);
    }, POLL_INTERVAL_MS);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await paymentsApi.initiate({ tracking_code: trackingCode, phone });
      setPollStatus('pending');
      startPolling(data.checkout_request_id);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setPollStatus(null);
    setError('');
    stopPolling();
  };

  // Already paid (from job data) — nothing to do here
  if (paymentStatus === 'paid' && pollStatus !== 'success') {
    return (
      <div className="bg-white rounded-2xl border border-green-200 bg-green-50/50 p-6 flex items-center gap-3">
        <CheckCircle2 size={22} className="text-green-600 shrink-0" />
        <p className="text-sm font-medium text-green-800">This shipment has been paid for.</p>
      </div>
    );
  }

  if (pollStatus === 'success') {
    return (
      <div className="bg-white rounded-2xl border border-green-200 bg-green-50/50 p-6">
        <div className="flex items-center gap-3 mb-1">
          <CheckCircle2 size={22} className="text-green-600 shrink-0" />
          <p className="text-sm font-semibold text-green-800">Payment received — thank you!</p>
        </div>
        {receipt && <p className="text-xs text-green-700 pl-9">M-Pesa Receipt: {receipt}</p>}
      </div>
    );
  }

  if (enabled === null) return null; // avoid a flash while checking config

  if (!enabled) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-1.5">Payment</h2>
        <p className="text-sm text-slate-500">
          Online M-Pesa payment isn't live yet. Our team will confirm payment by cash or bank
          transfer — reach out via WhatsApp or phone with your tracking code.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-1.5">
        <h2 className="font-semibold text-slate-800">Payment</h2>
        <span className="text-sm font-bold text-orange-600">{formatKSH(amount)}</span>
      </div>

      {(pollStatus === 'failed' || pollStatus === 'cancelled') && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
          <XCircle size={16} className="shrink-0" />
          {pollStatus === 'cancelled' ? 'Payment was cancelled.' : 'Payment did not go through.'}
        </div>
      )}

      {pollStatus === 'timeout' && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm px-4 py-3 rounded-xl mb-4">
          Still waiting for confirmation. If you completed the M-Pesa prompt, this page will
          update shortly — otherwise, try again below.
        </div>
      )}

      {pollStatus === 'pending' ? (
        <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3.5">
          <Loader2 size={18} className="text-orange-500 animate-spin shrink-0" />
          <p className="text-sm text-orange-700">Check your phone and enter your M-Pesa PIN to complete payment.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Smartphone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0712345678"
              className="w-full pl-9 pr-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !phone.trim()}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm shrink-0"
          >
            {submitting && <Loader2 size={15} className="animate-spin" />}
            {submitting ? 'Sending...' : 'Pay with M-Pesa'}
          </button>
        </form>
      )}

      {error && <p className="text-red-600 text-xs mt-3">{error}</p>}

      {(pollStatus === 'failed' || pollStatus === 'cancelled' || pollStatus === 'timeout') && (
        <button onClick={reset} className="text-orange-500 hover:underline text-xs font-medium mt-3">
          Try again
        </button>
      )}
    </div>
  );
};

export default MpesaPayCard;
