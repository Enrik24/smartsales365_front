import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AdminHeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

const AdminHeader = ({ setSidebarOpen }: AdminHeaderProps) => {
  const { authState, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const getInitials = (name: string, surname: string) => `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b-2 dark:border-gray-700">
      <div className="flex items-center">
        <button onClick={() => setSidebarOpen(true)} className="text-gray-500 focus:outline-none lg:hidden">
          <Menu className="h-6 w-6" />
        </button>
      </div>
      <div className="flex items-center space-x-4">
        <button className="flex text-gray-600 dark:text-gray-300 focus:outline-none">
          <Bell className="h-6 w-6" />
        </button>
        <div className="relative">
          <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="focus:outline-none">
            {authState.user && (
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                {getInitials(authState.user.nombre, authState.user.apellido)}
              </div>
            )}
          </button>
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 dark:bg-gray-700 border dark:border-gray-600">
              <Link 
                to="/" 
                onClick={() => setIsUserMenuOpen(false)}
                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver
              </Link>
              <button 
                onClick={() => { logout(); setIsUserMenuOpen(false); }} 
                className="w-full text-left flex items-center px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-600"
              >
                <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
