import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const pageTitles = {
  '/admin': 'Overview',
  '/admin/jobs': 'Job Management',
  '/admin/users': 'User Management',
  '/admin/vehicles': 'Vehicle Management',
  '/admin/pricing': 'Pricing Control',
  '/admin/analytics': 'Analytics',
  '/owner': 'Overview',
  '/owner/vehicles': 'My Vehicles',
  '/owner/earnings': 'Earnings',
  '/client': 'Overview',
  '/client/request': 'Request a Job',
  '/client/jobs': 'My Jobs',
  '/driver': 'Overview',
  '/driver/jobs': 'My Jobs',
};

const RoleLayout = () => {
  const { pathname } = useLocation();
  const title = pageTitles[pathname] || 'SwiftHaul';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RoleLayout;
