import { useMemo } from 'react';
import { Product } from '@/types';
import { mockProducts } from '@/lib/mock-data';
import AdminPageHeader from '@/components/admin/shared/AdminPageHeader';
import StockAlertsTable from '@/components/admin/stock/StockAlertsTable';

const LOW_STOCK_THRESHOLD = 10;

const AdminStockAlerts = () => {
  const lowStockProducts = useMemo(() => {
    return mockProducts.filter(p => p.stock <= LOW_STOCK_THRESHOLD);
  }, [mockProducts]);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Alertas de Stock Bajo</h1>
      </div>
      
      <StockAlertsTable 
        products={lowStockProducts} 
      />

      {lowStockProducts.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg mt-6">
            <p className="text-gray-500">¡Buen trabajo! No hay productos con stock bajo.</p>
        </div>
      )}
    </>
  );
};

export default AdminStockAlerts;
