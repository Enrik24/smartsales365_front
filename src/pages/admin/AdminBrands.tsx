import { useState } from 'react';
import { Brand } from '@/types';
import { mockBrands } from '@/lib/mock-data';
import AdminPageHeader from '@/components/admin/shared/AdminPageHeader';
import BrandsTable from '@/components/admin/brands/BrandsTable';
import BrandForm from '@/components/admin/brands/BrandForm';
import DeleteConfirmationDialog from '@/components/admin/shared/DeleteConfirmationDialog';

const AdminBrands = () => {
  const [brands, setBrands] = useState<Brand[]>(mockBrands);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  const handleOpenForm = (brand: Brand | null = null) => {
    setSelectedBrand(brand);
    setIsFormOpen(true);
  };

  const handleOpenDeleteDialog = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (selectedBrand) {
      setBrands(brands.map(b => b.id === selectedBrand.id ? { ...b, ...data } : b));
    } else {
      const newBrand: Brand = { ...data, id: `brand_${Date.now()}` };
      setBrands([...brands, newBrand]);
    }
    setIsFormOpen(false);
    setSelectedBrand(null);
  };
  
  const handleDelete = () => {
    if (selectedBrand) {
      setBrands(brands.filter(b => b.id !== selectedBrand.id));
      setIsDeleteDialogOpen(false);
      setSelectedBrand(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Gestionar Marcas"
        buttonLabel="Añadir Marca"
        onButtonClick={() => handleOpenForm()}
      />
      
      <BrandsTable
        brands={brands}
        onEdit={handleOpenForm}
        onDelete={handleOpenDeleteDialog}
      />

      <BrandForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        defaultValues={selectedBrand}
      />
      
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        itemName={selectedBrand?.nombre || ''}
      />
    </>
  );
};

export default AdminBrands;
