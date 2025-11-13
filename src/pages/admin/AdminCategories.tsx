import { useEffect, useState } from 'react';
import { Category } from '@/types';
import AdminPageHeader from '@/components/admin/shared/AdminPageHeader';
import CategoriesTable from '@/components/admin/categories/CategoriesTable';
import CategoryForm from '@/components/admin/categories/CategoryForm';
import DeleteConfirmationDialog from '@/components/admin/shared/DeleteConfirmationDialog';
import { categoryService, type CategoryDTO } from '@/api/services/categoryService';
import { showToast } from '@/components/ui/toast/Toast';
import { logExitoso, logFallido } from '@/lib/bitacora';

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);

  const mapDtoToUi = (dto: CategoryDTO): Category => ({
    id: String(dto.id),
    nombre: dto.nombre_categoria,
    descripcion: dto.description || '',
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.list();
      if (res.error) throw new Error(res.error.message || 'Error al listar categorías');
      const data = Array.isArray(res.data) ? res.data : [];
      setCategories(data.map(mapDtoToUi));
    } catch (e: any) {
      showToast({ title: 'Error', description: e.message || 'No se pudieron cargar las categorías', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenForm = (category: Category | null = null) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleOpenDeleteDialog = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: { nombre: string; descripcion: string }) => {
    try {
      if (selectedCategory) {
        const res = await categoryService.update(selectedCategory.id, {
          nombre_categoria: data.nombre,
          description: data.descripcion || null,
        });
        if (res.error || !res.data) throw new Error(res.error?.message || 'Error al actualizar categoría');
        const updated = mapDtoToUi(res.data);
        setCategories(prev => prev.map(c => c.id === selectedCategory.id ? updated : c));
        showToast({ title: '¡Éxito!', description: 'Categoría actualizada', type: 'success' });
        void logExitoso('CATEGORIA_EDITADA');
      } else {
        const res = await categoryService.create({
          nombre_categoria: data.nombre,
          description: data.descripcion || null,
        });
        if (res.error || !res.data) throw new Error(res.error?.message || 'Error al crear categoría');
        const created = mapDtoToUi(res.data);
        setCategories(prev => [...prev, created]);
        showToast({ title: '¡Éxito!', description: 'Categoría creada', type: 'success' });
        void logExitoso('CATEGORIA_CREADA');
      }
      setIsFormOpen(false);
      setSelectedCategory(null);
    } catch (e: any) {
      showToast({ title: 'Error', description: e.message || 'Operación fallida', type: 'error' });
      void logFallido(selectedCategory ? 'CATEGORIA_EDICION_FALLIDA' : 'CATEGORIA_CREACION_FALLIDA');
    }
  };
  
  const handleDelete = async () => {
    if (!selectedCategory) return;
    try {
      const res = await categoryService.remove(selectedCategory.id);
      if (res.error) throw new Error(res.error.message || 'Error al eliminar categoría');
      setCategories(prev => prev.filter(c => c.id !== selectedCategory.id));
      showToast({ title: '¡Eliminado!', description: 'Categoría eliminada', type: 'success' });
      void logExitoso('CATEGORIA_ELIMINADA');
    } catch (e: any) {
      showToast({ title: 'Error', description: e.message || 'Error al eliminar', type: 'error' });
      void logFallido('CATEGORIA_ELIMINACION_FALLIDA');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Gestionar Categorías"
        buttonLabel="Añadir Categoría"
        onButtonClick={() => handleOpenForm()}
      />
      
      <CategoriesTable
        categories={categories}
        onEdit={handleOpenForm}
        onDelete={handleOpenDeleteDialog}
      />

      <CategoryForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        defaultValues={selectedCategory}
      />
      
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        itemName={selectedCategory?.nombre || ''}
      />
    </>
  );
};

export default AdminCategories;
