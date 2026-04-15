import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Truck, Users, Package, DollarSign,
  BarChart2, LogOut, ClipboardList, Car, Wallet,
  ArrowDownToLine, AlertTriangle, ShieldCheck,
} from 'lucide-react';

const navByRole = {
  admin: [
    { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
    { label: 'Jobs', to: '/admin/jobs', icon: ClipboardList },
    { label: 'Users', to: '/admin/users', icon: Users },
    { label: 'Vehicles', to: '/admin/vehicles', icon: Truck },
    { label: 'Pricing', to: '/admin/pricing', icon: DollarSign },
    { label: 'Payouts', to: '/admin/payouts', icon: ArrowDownToLine },
    { label: 'Disputes', to: '/admin/disputes', icon: AlertTriangle },
    { label: 'Analytics', to: '/admin/analytics', icon: BarChart2 },
    { label: 'Audit Log', to: '/admin/audit-log', icon: ShieldCheck },
  ],
  owner: [
    { label: 'Dashboard', to: '/owner', icon: LayoutDashboard },
    { label: 'My Vehicles', to: '/owner/vehicles', icon: Car },
    { label: 'Jobs', to: '/owner/jobs', icon: ClipboardList },
    { label: 'Earnings', to: '/owner/earnings', icon: Wallet },
  ],
  client: [
    { label: 'Dashboard', to: '/client', icon: LayoutDashboard },
    { label: 'Request a Job', to: '/client/request', icon: Package },
    { label: 'My Jobs', to: '/client/jobs', icon: ClipboardList },
  ],
  driver: [
    { label: 'Dashboard', to: '/driver', icon: LayoutDashboard },
    { label: 'My Jobs', to: '/driver/jobs', icon: ClipboardList },
    { label: 'Earnings', to: '/driver/earnings', icon: Wallet },
  ],
};

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = navByRole[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`w-64 min-h-screen bg-slate-900 flex flex-col text-white shrink-0 fixed lg:static top-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Brand */}
        <div className="px-6 py-5 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Truck className="text-orange-400" size={22} />
            <span className="font-bold text-lg tracking-tight">SwiftHaul</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 capitalize">{user?.role} Portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to.split('/').length === 2}
              onClick={() => setIsOpen(false)} // Close sidebar on mobile after navigation
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="px-4 py-4 border-t border-slate-700">
          <p className="text-sm font-medium truncate">{user?.name}</p>
          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="mt-3 flex items-center gap-2 text-xs text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
