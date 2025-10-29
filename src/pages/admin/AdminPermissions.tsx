import { useState } from 'react';
import { Permission } from '@/types';
import { mockPermissions } from '@/lib/mock-data';
import AdminPageHeader from '@/components/admin/shared/AdminPageHeader';
import PermissionsTable from '@/components/admin/permissions/PermissionsTable';
import PermissionForm from '@/components/admin/permissions/PermissionForm';
import DeleteConfirmationDialog from '@/components/admin/shared/DeleteConfirmationDialog';

const AdminPermissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>(mockPermissions);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);

  const handleOpenForm = (permission: Permission | null = null) => {
    setSelectedPermission(permission);
    setIsFormOpen(true);
  };

  const handleOpenDeleteDialog = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (selectedPermission) {
      setPermissions(permissions.map(p => p.id === selectedPermission.id ? { ...p, ...data } : p));
    } else {
      const newPermission: Permission = { ...data, id: `perm_${Date.now()}` };
      setPermissions([...permissions, newPermission]);
    }
    setIsFormOpen(false);
    setSelectedPermission(null);
  };
  
  const handleDelete = () => {
    if (selectedPermission) {
      setPermissions(permissions.filter(p => p.id !== selectedPermission.id));
      setIsDeleteDialogOpen(false);
      setSelectedPermission(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Gestionar Permisos"
        buttonLabel="Añadir Permiso"
        onButtonClick={() => handleOpenForm()}
      />
      
      <PermissionsTable
        permissions={permissions}
        onEdit={handleOpenForm}
        onDelete={handleOpenDeleteDialog}
      />

      <PermissionForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        defaultValues={selectedPermission}
      />
      
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        itemName={selectedPermission?.nombre || ''}
      />
    </>
  );
};

export default AdminPermissions;
