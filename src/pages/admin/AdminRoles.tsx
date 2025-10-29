import { useState } from 'react';
import { Role } from '@/types';
import { mockRoles } from '@/lib/mock-data';
import AdminPageHeader from '@/components/admin/shared/AdminPageHeader';
import RolesTable from '@/components/admin/roles/RolesTable';
import RoleForm from '@/components/admin/roles/RoleForm';
import DeleteConfirmationDialog from '@/components/admin/shared/DeleteConfirmationDialog';

const AdminRoles = () => {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleOpenForm = (role: Role | null = null) => {
    setSelectedRole(role);
    setIsFormOpen(true);
  };

  const handleOpenDeleteDialog = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (selectedRole) {
      setRoles(roles.map(r => r.id === selectedRole.id ? { ...r, ...data } : r));
    } else {
      const newRole: Role = { ...data, id: `role_${Date.now()}` };
      setRoles([...roles, newRole]);
    }
    setIsFormOpen(false);
    setSelectedRole(null);
  };
  
  const handleDelete = () => {
    if (selectedRole) {
      setRoles(roles.filter(r => r.id !== selectedRole.id));
      setIsDeleteDialogOpen(false);
      setSelectedRole(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Gestionar Roles"
        buttonLabel="Añadir Rol"
        onButtonClick={() => handleOpenForm()}
      />
      
      <RolesTable
        roles={roles}
        onEdit={handleOpenForm}
        onDelete={handleOpenDeleteDialog}
      />

      <RoleForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        defaultValues={selectedRole}
      />
      
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        itemName={selectedRole?.nombre || ''}
      />
    </>
  );
};

export default AdminRoles;
