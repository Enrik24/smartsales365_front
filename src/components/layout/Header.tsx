import { Link, NavLink } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, LogIn, LogOut, LayoutDashboard, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useState } from 'react';

const Header = () => {
  const { authState, logout } = useAuth();
  const { itemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getInitials = (name: string, surname: string) => {
    return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary dark:text-primary-dark">
          SmartSales365
        </Link>

        <div className="hidden md:flex flex-1 justify-center px-8">
            <div className="relative w-full max-w-lg">
                <input 
                    type="text" 
                    placeholder="Buscar productos..."
                    className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
        </div>

        <nav className="flex items-center space-x-4">
          <NavLink to="/catalog" className={({isActive}) => `hidden md:block text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-dark ${isActive ? 'font-bold text-primary' : ''}`}>
            Catálogo
          </NavLink>
          
          <Link to="/cart" className="relative text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-dark">
            <ShoppingCart />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          <div className="relative">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-dark">
              {authState.isAuthenticated && authState.user ? (
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {getInitials(authState.user.nombre, authState.user.apellido)}
                </div>
              ) : (
                <UserIcon />
              )}
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                {authState.isAuthenticated && authState.user ? (
                  <>
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <p className="font-semibold">{authState.user.nombre} {authState.user.apellido}</p>
                      <p className="text-xs text-gray-500">{authState.user.email}</p>
                    </div>
                    <Link to="/profile" className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <UserIcon className="mr-2 h-4 w-4" /> Mi Cuenta
                    </Link>

                    {authState.user.isAdmin && (
                      <Link to="/admin" className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <LayoutDashboard className="mr-2 h-4 w-4" /> Panel Admin
                      </Link>
                    )}
                    <button onClick={() => { logout(); setIsMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                      <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <LogIn className="mr-2 h-4 w-4" /> Iniciar Sesión
                  </Link>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
