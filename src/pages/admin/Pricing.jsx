import { useState, useEffect } from 'react';
import { pricingApi } from '../../services/api';
import Button from '../../components/ui/Button';
import { formatKSH, vehicleTypeLabel } from '../../utils/formatters';

const VEHICLE_TYPES = ['mini_van', 'truck_3t', 'flatbed', 'semi_trailer'];

const AdminPricing = () => {
  const [rules, setRules] = useState({});
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pricingApi.getAll().then(({ data }) => {
      const map = {};
      data.forEach((r) => { map[r.vehicle_type] = r; });
      setRules(map);
      const editMap = {};
      VEHICLE_TYPES.forEach((t) => {
        editMap[t] = { base_rate_ksh: map[t]?.base_rate_ksh || 0, rate_per_kg: map[t]?.rate_per_kg || 0, rate_per_km: map[t]?.rate_per_km || 0 };
      });
      setEdits(editMap);
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (type) => {
    setSaving((s) => ({ ...s, [type]: true }));
    try {
      await pricingApi.update(type, edits[type]);
      const { data } = await pricingApi.getAll();
      const map = {};
      data.forEach((r) => { map[r.vehicle_type] = r; });
      setRules(map);
    } finally {
      setSaving((s) => ({ ...s, [type]: false }));
    }
  };

  if (loading) return <div className="text-slate-400 text-sm">Loading pricing...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
        Price changes apply to new jobs only — existing jobs retain their original price.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {VEHICLE_TYPES.map((type) => (
          <div key={type} className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-1">{vehicleTypeLabel(type)}</h3>
            {rules[type] && (
              <p className="text-xs text-slate-400 mb-4">
                Last updated: {rules[type].updated_at ? new Date(rules[type].updated_at).toDateString() : '—'}
              </p>
            )}
            <div className="space-y-3">
              {[['Base Rate (KSH)', 'base_rate_ksh'], ['Rate per kg (KSH)', 'rate_per_kg'], ['Rate per km (KSH)', 'rate_per_km']].map(([label, key]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                  <input
                    type="number" min="0" step="0.01"
                    value={edits[type]?.[key] || 0}
                    onChange={(e) => setEdits((ed) => ({ ...ed, [type]: { ...ed[type], [key]: e.target.value } }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Current base: {rules[type] ? formatKSH(rules[type].base_rate_ksh) : 'Not set'}
              </p>
              <Button size="sm" loading={saving[type]} onClick={() => handleSave(type)}>Save</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPricing;
