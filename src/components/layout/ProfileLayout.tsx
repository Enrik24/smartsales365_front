import { Outlet, NavLink } from 'react-router-dom';
import { User, Heart, FileText } from 'lucide-react';
import { cn } from '@/utils/cn';

const profileNavItems = [
  { name: 'Perfil', path: '/profile', icon: User, end: true },
  { name: 'Guardado', path: '/profile/saved', icon: Heart, end: false },
  { name: 'Facturas', path: '/profile/invoices', icon: FileText, end: false },
];

const ProfileLayout = () => {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="md:w-1/4 lg:w-1/5">
        <h2 className="text-xl font-bold mb-4">Mi Cuenta</h2>
        <nav className="flex flex-col space-y-2">
          {profileNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
                  isActive && 'bg-primary text-white dark:bg-primary-dark dark:text-gray-900 font-semibold'
                )
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default ProfileLayout;
