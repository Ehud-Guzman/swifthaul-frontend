import { statusColor, statusLabel } from '../../utils/formatters';

const Badge = ({ status, className = '' }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(status)} ${className}`}>
    {statusLabel(status)}
  </span>
);

export default Badge;
