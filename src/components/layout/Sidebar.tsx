import { Link, useLocation } from 'react-router-dom';
import { X, ChevronDown, Users, Package, BarChart2, Shield, LayoutDashboard, Archive, BellRing } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/cn';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

// Define a type for sub-items to include an optional icon
type SubItem = {
  name: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
};

const navItems: {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  subItems?: SubItem[];
}[] = [
  { 
    name: 'Gestión Administrativa', 
    icon: Users,
    subItems: [
      { name: 'Gestionar Usuario', path: '/admin/users' },
      { name: 'Gestionar Rol', path: '/admin/roles' },
      { name: 'Gestionar Permisos', path: '/admin/permissions', icon: Shield },
      { name: 'Gestionar Categoría', path: '/admin/categories' },
      { name: 'Gestionar Marca', path: '/admin/brands' },
    ]
  },
  { name: 'Gestión Comercial', icon: Package, path: '/admin/products' },
  {
    name: 'Gestión de Inventario',
    icon: Archive,
    subItems: [
      { name: 'Gestionar Stock', path: '/admin/stock', icon: Archive },
      { name: 'Alertas de Stock', path: '/admin/stock-alerts', icon: BellRing }
    ]
  },
  { 
    name: 'Reportes e IA', 
    icon: BarChart2,
    subItems: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard }
    ]
  },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    'Gestión Administrativa': true,
    'Reportes e IA': true,
    'Gestión de Inventario': true,
  });

  const toggleMenu = (name: string) => {
    setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <>
      <div className={cn("fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden", sidebarOpen ? "block" : "hidden")} onClick={() => setSidebarOpen(false)}></div>
      <div className={cn(
        "fixed inset-y-0 left-0 bg-white dark:bg-gray-800 w-64 px-4 py-6 z-30 transform transition-transform duration-300 ease-in-out",
        "-translate-x-full lg:translate-x-0",
        sidebarOpen && "translate-x-0"
      )}>
        <div className="flex items-center justify-between">
          <Link to="/admin" className="text-2xl font-bold text-primary dark:text-primary-dark">
            Admin
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="text-gray-500 focus:outline-none lg:hidden">
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-10">
          {navItems.map((item) => (
            <div key={item.name}>
              <div
                className="flex items-center justify-between mt-4 py-2 px-6 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => item.subItems && toggleMenu(item.name)}
              >
                <Link to={item.path || '#'} className="flex items-center w-full" onClick={(e) => !item.path && e.preventDefault()}>
                  <item.icon className="h-5 w-5" />
                  <span className="mx-3">{item.name}</span>
                </Link>
                {item.subItems && (
                  <ChevronDown className={cn("h-5 w-5 transition-transform", openMenus[item.name] && "rotate-180")} />
                )}
              </div>
              {item.subItems && openMenus[item.name] && (
                <div className="pl-8 mt-2 space-y-2">
                  {item.subItems.map((subItem) => {
                    const SubIcon = subItem.icon;
                    return (
                      <Link
                        key={subItem.name}
                        to={subItem.path}
                        className={cn(
                          "flex items-center px-4 py-2 text-sm rounded-md",
                          location.pathname === subItem.path 
                            ? "bg-primary text-white" 
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                        )}
                      >
                        {SubIcon ? <SubIcon className="h-4 w-4 mr-2" /> : <div className="w-4 mr-2" />}
                        {subItem.name}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
