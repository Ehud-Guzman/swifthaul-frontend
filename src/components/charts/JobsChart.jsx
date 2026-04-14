import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const JobsChart = ({ data = [] }) => (
  <ResponsiveContainer width="100%" height={260}>
    <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
      <Tooltip
        contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: 12 }}
        labelStyle={{ fontWeight: 600 }}
      />
      <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={2.5} dot={{ r: 3, fill: '#f97316' }} name="Jobs" />
    </LineChart>
  </ResponsiveContainer>
);

export default JobsChart;
