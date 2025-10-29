import { useState } from 'react';
import { Product } from '@/types';
import { mockProducts } from '@/lib/mock-data';
import AdminPageHeader from '@/components/admin/shared/AdminPageHeader';
import StockTable from '@/components/admin/stock/StockTable';
import UpdateStockForm from '@/components/admin/stock/UpdateStockForm';

const AdminStock = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleOpenForm = (product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleSubmit = (data: { stock: number }) => {
    if (selectedProduct) {
      setProducts(products.map(p => p.id === selectedProduct.id ? { ...p, stock: data.stock } : p));
    }
    setIsFormOpen(false);
    setSelectedProduct(null);
  };

  return (
    <>
      <AdminPageHeader
        title="Gestionar Stock"
        buttonLabel="Añadir Producto" // This button might navigate to AdminProducts page instead
        onButtonClick={() => alert('Navegar a la página de añadir producto...')}
      />
      
      <StockTable 
        products={products} 
        onUpdateStock={handleOpenForm} 
      />

      <UpdateStockForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        product={selectedProduct}
      />
    </>
  );
};

export default AdminStock;
