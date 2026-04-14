import { useState, useEffect, useCallback } from 'react';
import { vehiclesApi } from '../../services/api';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { formatDate, vehicleTypeLabel } from '../../utils/formatters';

const OwnerVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await vehiclesApi.getAll();
    setVehicles(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { key: 'name', label: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'type', label: 'Type', render: (r) => vehicleTypeLabel(r.type) },
    { key: 'plate', label: 'Plate', render: (r) => <span className="font-mono text-sm">{r.plate_number}</span> },
    { key: 'capacity', label: 'Capacity', render: (r) => `${r.capacity_kg} kg` },
    { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
    { key: 'added', label: 'Added', render: (r) => formatDate(r.created_at) },
  ];

  return (
    <div className="space-y-4">
      {loading ? <div className="text-slate-400 text-sm">Loading...</div> : (
        <Table columns={columns} data={vehicles} emptyMessage="No vehicles assigned to your account yet." />
      )}
    </div>
  );
};

export default OwnerVehicles;
