import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatKSH } from '../../utils/formatters';

const RevenueChart = ({ data = [] }) => (
  <ResponsiveContainer width="100%" height={260}>
    <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
      <Tooltip
        contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: 12 }}
        formatter={(v) => [formatKSH(v), 'Revenue']}
      />
      <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} name="Revenue" />
    </BarChart>
  </ResponsiveContainer>
);

export default RevenueChart;
