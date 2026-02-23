import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    CloudRain,
    Waves,
    Map,
    Truck,
    BarChart3,
    Navigation,
    Activity
} from 'lucide-react';

const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Rainfall', path: '/rainfall', icon: CloudRain },
    { name: 'Groundwater', path: '/groundwater', icon: Waves },
    { name: 'Stress Map', path: '/stress-map', icon: Map },
    { name: 'Tanker Demand', path: '/tanker-demand', icon: Truck },
    { name: 'Allocation', path: '/allocation', icon: BarChart3 },
    { name: 'Route Optimization', path: '/route-optimization', icon: Navigation },
    { name: 'Monitoring', path: '/monitoring', icon: Activity },
];

const Sidebar = () => {
    return (
        <aside className="w-64 h-full bg-slate-900 border-r border-slate-800 text-white flex flex-col transition-colors duration-200">
            <div className="p-6 text-2xl font-bold border-b border-slate-800 flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Waves className="w-5 h-5 text-white" />
                </div>
                <span className="tracking-tight">Krishi Mitra</span>
            </div>
            <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-2">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-blue-600 dark:bg-blue-700 text-white shadow-lg shadow-blue-900/20 dark:shadow-blue-900/40'
                                        : 'text-slate-400 hover:bg-slate-800 dark:hover:bg-slate-800/50 hover:text-white'
                                    }`
                                }
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.name}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="p-4 border-t border-slate-800 text-xs text-slate-500 font-medium">
                © 2026 KRISHI MITRA V1.0
            </div>
        </aside>
    );
};

export default Sidebar;

