import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { vehicleTypeLabel } from '../../utils/formatters';

const COLORS = ['#f97316', '#3b82f6', '#8b5cf6', '#10b981'];

const VehicleTypePie = ({ data = [] }) => {
  const formatted = data.map((d) => ({ ...d, name: vehicleTypeLabel(d.type) }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={formatted} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
          {formatted.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: 12 }} />
        <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default VehicleTypePie;
