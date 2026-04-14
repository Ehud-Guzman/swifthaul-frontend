export const formatKSH = (amount) =>
  `KSH ${Number(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const formatDateTime = (date) =>
  date
    ? new Date(date).toLocaleString('en-KE', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : '—';

export const statusColor = (status) => {
  const map = {
    pending: 'bg-yellow-100 text-yellow-800',
    assigned: 'bg-blue-100 text-blue-800',
    picked_up: 'bg-indigo-100 text-indigo-800',
    in_transit: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    available: 'bg-green-100 text-green-800',
    maintenance: 'bg-orange-100 text-orange-800',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
};

export const statusLabel = (status) =>
  status ? status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—';

export const vehicleTypeLabel = (type) => {
  const map = { mini_van: 'Mini Van', truck_3t: '3-Ton Truck', flatbed: 'Flatbed', semi_trailer: 'Semi Trailer' };
  return map[type] || type;
};
