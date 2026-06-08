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
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setToggle(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-100 z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-deep-green font-bold text-2xl">
            🌾 AgroSmart
          </div>
          <button onClick={() => setToggle(false)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <nav className="mt-4 px-4 h-[calc(100vh-200px)] overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setToggle(false)}
                  className={({ isActive }) => `
                    flex items-center gap-4 px-4 py-4 rounded-2xl font-semibold transition-all duration-200
                    ${isActive 
                      ? 'bg-deep-green text-white shadow-lg shadow-green-100 scale-105' 
                      : 'text-gray-500 hover:bg-green-50 hover:text-deep-green'}
                  `}
                >
                  <item.icon size={22} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-50">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-semibold text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={22} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
