import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  Map,
  CloudSun, 
  ShoppingBag, 
  Bell, 
  BrainCircuit, 
  ShieldAlert, 
  Settings,
  LogOut,
  X,
  User,
  Sprout
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFarm } from '../../context/FarmContext';

const Sidebar = ({ isOpen, setToggle }) => {
  const { logout } = useAuth();
  const { t } = useFarm();

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
    { icon: Map, label: 'Land Management', path: '/farms' },
    { icon: CloudSun, label: t('weather'), path: '/weather' },
    { icon: ShoppingBag, label: t('mandi_prices'), path: '/mandi' },
    { icon: Bell, label: t('reminders'), path: '/reminders' },
    { icon: BrainCircuit, label: t('ai_recommendations'), path: '/ai' },
    { icon: ShieldAlert, label: t('disease_detection'), path: '/disease' },
    { icon: Sprout, label: t('fertilizer_hub'), path: '/fertilizer' },
  ];

  const bottomItems = [
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setToggle(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-border z-50 
        transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-border-light shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sprout size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">AgroSmart</span>
          </div>
          <button 
            onClick={() => setToggle(false)} 
            className="lg:hidden p-1.5 hover:bg-surface-hover rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          <div className="mb-3 px-3">
            <span className="section-label text-[11px]">Main Menu</span>
          </div>
          <ul className="space-y-0.5">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setToggle(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-150
                    ${isActive 
                      ? 'bg-primary-50 text-primary border-l-[3px] border-primary pl-[9px]' 
                      : 'text-gray-600 hover:bg-surface-hover hover:text-gray-900'}
                  `}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mt-6 mb-3 px-3">
            <span className="section-label text-[11px]">Account</span>
          </div>
          <ul className="space-y-0.5">
            {bottomItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setToggle(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-150
                    ${isActive 
                      ? 'bg-primary-50 text-primary border-l-[3px] border-primary pl-[9px]' 
                      : 'text-gray-600 hover:bg-surface-hover hover:text-gray-900'}
                  `}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-border-light shrink-0">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm text-red-600 hover:bg-danger-50 transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
