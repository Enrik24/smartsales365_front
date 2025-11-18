import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MainLayout from '@/components/layout/MainLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import Spinner from '@/components/ui/Spinner';

const Home = lazy(() => import('@/pages/Home'));
const Catalog = lazy(() => import('@/pages/Catalog'));
const ProductPage = lazy(() => import('@/pages/ProductPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const PaymentPage = lazy(() => import('@/pages/PaymentPage'));
/* const PaymentSuccessPage = lazy(() => import('@/pages/PaymentSuccessPage')); */
/* onst OrderDetailPage = lazy(() => import('@/pages/OrderDetailPage')); */
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));

// Profile Pages
const ProfileLayout = lazy(() => import('@/components/layout/ProfileLayout'));
const UserProfile = lazy(() => import('@/pages/profile/UserProfile'));
const EditProfile = lazy(() => import('@/pages/profile/EditProfile'));
const SavedItemsPage = lazy(() => import('@/pages/profile/SavedItemsPage'));
const InvoicesPage = lazy(() => import('@/pages/profile/InvoicesPage'));


// Admin Pages
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminRoles = lazy(() => import('@/pages/admin/AdminRoles'));
const AdminPermissions = lazy(() => import('@/pages/admin/AdminPermissions'));
const AdminCategories = lazy(() => import('@/pages/admin/AdminCategories'));
const AdminBrands = lazy(() => import('@/pages/admin/AdminBrands'));
const AdminProducts = lazy(() => import('@/pages/admin/AdminProducts'));
const AdminInventory = lazy(() => import('@/pages/admin/AdminInventory'));
const AdminLogs = lazy(() => import('@/pages/admin/AdminLogs'));
const AdminCustomers = lazy(() => import('@/pages/admin/AdminCustomers'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Spinner size="lg" /></div>}>
      <Routes>
        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Authenticated User Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Cliente', 'Administrador']} />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment/:pedidoId" element={<PaymentPage />} />
            {/* <Route path="/payment/success/:pedidoId" element={<PaymentSuccessPage />} /> */}
            {/* Ruta para la página de pago exitoso*/}
            <Route path="/pago/exitoso" element={<InvoicesPage />} />
            <Route path="/profile" element={<ProfileLayout />}>
              <Route index element={<UserProfile />} />
              <Route path="editar" element={<EditProfile />} />
              <Route path="saved" element={<SavedItemsPage />} />
              <Route path="invoices" element={<InvoicesPage />} />
            </Route>
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['Administrador']} />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="roles" element={<AdminRoles />} />
            <Route path="permissions" element={<AdminPermissions />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="brands" element={<AdminBrands />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="logs" element={<AdminLogs />} />
          </Route>
        </Route>
        
        {/* Not Found Route */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
