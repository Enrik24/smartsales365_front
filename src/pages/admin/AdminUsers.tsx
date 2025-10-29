import { useState } from 'react';
import { User } from '@/types';
import { mockUsers } from '@/lib/mock-data';
import { userSchema } from '@/lib/validators';
import AdminPageHeader from '@/components/admin/shared/AdminPageHeader';
import UserForm from '@/components/admin/users/UserForm';
import UsersTable from '@/components/admin/users/UsersTable';
import DeleteConfirmationDialog from '@/components/admin/shared/DeleteConfirmationDialog';

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleOpenForm = (user: User | null = null) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleOpenDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (selectedUser) {
      // Editar
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...data } : u));
    } else {
      // Crear
      const newUser: User = { ...data, id: `usr_${Date.now()}` };
      setUsers([...users, newUser]);
    }
    setIsFormOpen(false);
    setSelectedUser(null);
  };
  
  const handleDelete = () => {
    if (selectedUser) {
      setUsers(users.filter(u => u.id !== selectedUser.id));
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Gestionar Usuarios"
        buttonLabel="Añadir Usuario"
        onButtonClick={() => handleOpenForm()}
      />
      
      <UsersTable 
        users={users} 
        onEdit={handleOpenForm} 
        onDelete={handleOpenDeleteDialog}
      />

      <UserForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        defaultValues={selectedUser}
      />
      
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        itemName={selectedUser?.nombre || ''}
      />
    </>
  );
};

export default AdminUsers;
