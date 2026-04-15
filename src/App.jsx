import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Public pages
import Landing from './pages/public/Landing';
import GetQuote from './pages/public/GetQuote';
import TrackShipment from './pages/public/TrackShipment';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';

// Layout
import RoleLayout from './components/layout/RoleLayout';

// Role guard
import { ProtectedRoute } from './utils/roleGuard';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminJobs from './pages/admin/Jobs';
import AdminUsers from './pages/admin/Users';
import AdminVehicles from './pages/admin/Vehicles';
import AdminPricing from './pages/admin/Pricing';
import AdminAnalytics from './pages/admin/Analytics';
import AdminPayouts from './pages/admin/Payouts';
import AdminDisputes from './pages/admin/Disputes';
import AdminAuditLog from './pages/admin/AuditLog';

// Owner pages
import OwnerDashboard from './pages/owner/Dashboard';
import OwnerVehicles from './pages/owner/Vehicles';
import OwnerEarnings from './pages/owner/Earnings';
import OwnerJobs from './pages/owner/Jobs';

// Client pages
import ClientDashboard from './pages/client/Dashboard';
import RequestJob from './pages/client/RequestJob';
import ClientMyJobs from './pages/client/MyJobs';

// Driver pages
import DriverDashboard from './pages/driver/Dashboard';
import DriverJobs from './pages/driver/JobDetail';
import DriverEarnings from './pages/driver/Earnings';

const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/home" replace />;
  const home = { admin: '/admin', owner: '/owner', client: '/client', driver: '/driver' };
  return <Navigate to={home[user.role] || '/home'} replace />;
};

const App = () => (
  <Routes>
    {/* Public — no auth required */}
    <Route path="/home" element={<Landing />} />
    <Route path="/quote" element={<GetQuote />} />
    <Route path="/track" element={<TrackShipment />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/" element={<RootRedirect />} />

    {/* Admin */}
    <Route path="/admin" element={<ProtectedRoute roles={['admin']}><RoleLayout /></ProtectedRoute>}>
      <Route index element={<AdminDashboard />} />
      <Route path="jobs" element={<AdminJobs />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="vehicles" element={<AdminVehicles />} />
      <Route path="pricing" element={<AdminPricing />} />
      <Route path="analytics" element={<AdminAnalytics />} />
      <Route path="payouts" element={<AdminPayouts />} />
      <Route path="disputes" element={<AdminDisputes />} />
      <Route path="audit-log" element={<AdminAuditLog />} />
    </Route>

    {/* Owner */}
    <Route path="/owner" element={<ProtectedRoute roles={['owner']}><RoleLayout /></ProtectedRoute>}>
      <Route index element={<OwnerDashboard />} />
      <Route path="vehicles" element={<OwnerVehicles />} />
      <Route path="jobs" element={<OwnerJobs />} />
      <Route path="earnings" element={<OwnerEarnings />} />
    </Route>

    {/* Client */}
    <Route path="/client" element={<ProtectedRoute roles={['client']}><RoleLayout /></ProtectedRoute>}>
      <Route index element={<ClientDashboard />} />
      <Route path="request" element={<RequestJob />} />
      <Route path="jobs" element={<ClientMyJobs />} />
    </Route>

    {/* Driver */}
    <Route path="/driver" element={<ProtectedRoute roles={['driver']}><RoleLayout /></ProtectedRoute>}>
      <Route index element={<DriverDashboard />} />
      <Route path="jobs" element={<DriverJobs />} />
      <Route path="earnings" element={<DriverEarnings />} />
    </Route>

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
