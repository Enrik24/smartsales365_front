import { useState } from 'react';
import { Category } from '@/types';
import { mockCategories } from '@/lib/mock-data';
import AdminPageHeader from '@/components/admin/shared/AdminPageHeader';
import CategoriesTable from '@/components/admin/categories/CategoriesTable';
import CategoryForm from '@/components/admin/categories/CategoryForm';
import DeleteConfirmationDialog from '@/components/admin/shared/DeleteConfirmationDialog';

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const handleOpenForm = (category: Category | null = null) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleOpenDeleteDialog = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (selectedCategory) {
      setCategories(categories.map(c => c.id === selectedCategory.id ? { ...c, ...data } : c));
    } else {
      const newCategory: Category = { ...data, id: `cat_${Date.now()}` };
      setCategories([...categories, newCategory]);
    }
    setIsFormOpen(false);
    setSelectedCategory(null);
  };
  
  const handleDelete = () => {
    if (selectedCategory) {
      setCategories(categories.filter(c => c.id !== selectedCategory.id));
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
