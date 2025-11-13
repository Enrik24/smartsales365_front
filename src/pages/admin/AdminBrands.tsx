import { useEffect, useState } from 'react';
import { Brand } from '@/types';
import AdminPageHeader from '@/components/admin/shared/AdminPageHeader';
import BrandsTable from '@/components/admin/brands/BrandsTable';
import BrandForm from '@/components/admin/brands/BrandForm';
import DeleteConfirmationDialog from '@/components/admin/shared/DeleteConfirmationDialog';
import { brandService, type BrandDTO } from '@/api/services/brandService';
import { showToast } from '@/components/ui/toast/Toast';
import { logExitoso, logFallido } from '@/lib/bitacora';

const AdminBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(false);

  const mapDtoToUi = (dto: BrandDTO): Brand => ({
    id: String(dto.id),
    nombre: dto.nombre_marca,
    descripcion: dto.description || '',
  });

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await brandService.list();
      if (res.error) throw new Error(res.error.message || 'Error al listar marcas');
      const data = Array.isArray(res.data) ? res.data : [];
      setBrands(data.map(mapDtoToUi));
    } catch (e: any) {
      showToast({ title: 'Error', description: e.message || 'No se pudieron cargar las marcas', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleOpenForm = (brand: Brand | null = null) => {
    setSelectedBrand(brand);
    setIsFormOpen(true);
  };

  const handleOpenDeleteDialog = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: { nombre: string; descripcion: string }) => {
    try {
      if (selectedBrand) {
        const res = await brandService.update(selectedBrand.id, {
          nombre_marca: data.nombre,
          description: data.descripcion || null,
        });
        if (res.error || !res.data) throw new Error(res.error?.message || 'Error al actualizar marca');
        const updated = mapDtoToUi(res.data);
        setBrands(prev => prev.map(b => b.id === selectedBrand.id ? updated : b));
        showToast({ title: '¡Éxito!', description: 'Marca actualizada', type: 'success' });
        void logExitoso('MARCA_EDITADA');
      } else {
        const res = await brandService.create({
          nombre_marca: data.nombre,
          description: data.descripcion || null,
        });
        if (res.error || !res.data) throw new Error(res.error?.message || 'Error al crear marca');
        const created = mapDtoToUi(res.data);
        setBrands(prev => [...prev, created]);
        showToast({ title: '¡Éxito!', description: 'Marca creada', type: 'success' });
        void logExitoso('MARCA_CREADA');
      }
      setIsFormOpen(false);
      setSelectedBrand(null);
    } catch (e: any) {
      showToast({ title: 'Error', description: e.message || 'Operación fallida', type: 'error' });
      void logFallido(selectedBrand ? 'MARCA_EDICION_FALLIDA' : 'MARCA_CREACION_FALLIDA');
    }
  };
  
  const handleDelete = async () => {
    if (!selectedBrand) return;
    try {
      const res = await brandService.remove(selectedBrand.id);
      if (res.error) throw new Error(res.error.message || 'Error al eliminar marca');
      setBrands(prev => prev.filter(b => b.id !== selectedBrand.id));
      showToast({ title: '¡Eliminado!', description: 'Marca eliminada', type: 'success' });
      void logExitoso('MARCA_ELIMINADA');
    } catch (e: any) {
      showToast({ title: 'Error', description: e.message || 'Error al eliminar', type: 'error' });
      void logFallido('MARCA_ELIMINACION_FALLIDA');
    } finally {
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
