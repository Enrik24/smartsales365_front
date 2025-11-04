// src/components/admin/AdminUsers.tsx

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Pencil, UserX, UserCheck, Trash2 } from 'lucide-react'; // <-- CAMBIO: Importamos el icono Trash2
import { userService } from "@/api/services/userService";
import { toast } from 'sonner';
import UsersTable from '@/components/admin/users/UsersTable';
import UserForm from '@/components/admin/users/UserForm';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/Badge';
import Swal from 'sweetalert2'; // <-- CAMBIO: Importamos SweetAlert2

// Definir el tipo para el usuario de la API
interface ApiUser {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  roles?: Array<{ id: number; nombre_rol: string }>;
  estado?: string;
  is_active: boolean;
}

interface TableUser {
  id: string;
  id_usuario: number;
  nombre_completo: string;
  email: string;
  rol: string;
  estado: string;
  is_active?: boolean;
  acciones: Array<{
    label: string;
    onClick: () => void;
    icon: string;
    variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  }>;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<TableUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  // <-- CAMBIO: Ya no necesitamos el estado para el diálogo de eliminación
  const [selectedUser, setSelectedUser] = useState<Partial<TableUser> | null>(null);

  // Definición de columnas para la tabla
  const columns: ColumnDef<TableUser>[] = [
    {
      accessorKey: 'nombre_completo',
      header: 'Nombre',
      cell: ({ row }) => (
        <div className="font-medium">
          {row.getValue('nombre_completo')}
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Correo Electrónico',
    },
    {
      accessorKey: 'rol',
      header: 'Rol',
      cell: ({ row }) => (
        <Badge variant={row.getValue('rol') === 'Administrador' ? 'default' : 'secondary'}>
          {row.getValue('rol')}
        </Badge>
      ),
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge variant={row.getValue('estado') === 'Activo' ? 'default' : 'outline'}>
          {row.getValue('estado')}
        </Badge>
      ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const acciones = row.original.acciones || [];
        return (
          <div className="flex space-x-2">
            {acciones.map((accion, index) => (
              <Button
                key={index}
                variant={accion.variant}
                size="sm"
                onClick={accion.onClick}
                className="h-8 w-8 p-0"
              >
                <span className="sr-only">{accion.label}</span>
                {accion.icon === 'edit' && <Pencil className="h-4 w-4" />}
                {accion.icon === 'user-x' && <UserX className="h-4 w-4" />}
                {accion.icon === 'user-check' && <UserCheck className="h-4 w-4" />}
                {accion.icon === 'trash' && <Trash2 className="h-4 w-4" />}{/* <-- CAMBIO: Renderiza el nuevo icono */}
              </Button>
            ))}
          </div>
        );
      },
    },
  ];

  const handleOpenForm = (user: Partial<TableUser> | null = null) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  // <-- CAMBIO: Nueva función para manejar la eliminación con confirmación
  const handleDeleteUserWithConfirmation = async (user: TableUser) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¡No podrás revertir la eliminación de ${user.nombre_completo}!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await userService.deleteUser(user.id);
        toast.success('Usuario eliminado correctamente');
        fetchUsers(); // Recargar la lista
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        toast.error('Error al eliminar el usuario');
      }
    }
  };

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    try {
      await userService.updateStatus(userId, isActive);
      toast.success(`Usuario ${isActive ? 'activado' : 'desactivado'} correctamente`);
      fetchUsers();
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error);
      toast.error('Error al actualizar el estado del usuario');
    }
  };

  // <-- CAMBIO: Modificamos fetchUsers para añadir la acción de eliminar y corregir la de editar
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await userService.getUsers();
      
      if ('error' in response) {
        throw new Error(response.error?.message || 'Error al cargar los usuarios');
      }
      
      const usersData = response.data?.results || response.data || [];
      
      const mappedUsers = usersData.map((user: any) => {
        const userRole = user.roles?.[0]?.nombre_rol || 'Sin rol asignado';
        const userStatus = user.estado ? 
          user.estado.charAt(0).toUpperCase() + user.estado.slice(1) : 
          'Inactivo';
          
        return {
          id: user.id.toString(),
          id_usuario: user.id,
          nombre_completo: `${user.nombre || ''} ${user.apellido || ''}`.trim() || 'Sin nombre',
          email: user.email,
          rol: userRole,
          estado: userStatus,
          is_active: user.is_active,
          acciones: [
            {
              label: 'Editar',
              // <-- CAMBIO CLAVE: Llama a handleOpenForm con el objeto usuario completo
              onClick: () => handleOpenForm(user), 
              icon: 'edit',
              variant: 'outline' as const
            },
            {
              label: user.is_active ? 'Desactivar' : 'Activar',
              onClick: () => handleToggleStatus(user.id.toString(), !user.is_active),
              icon: user.is_active ? 'user-x' : 'user-check',
              variant: user.is_active ? 'destructive' : 'default' as const
            },
            // <-- CAMBIO: Añadimos la nueva acción de eliminar
            {
              label: 'Eliminar',
              onClick: () => handleDeleteUserWithConfirmation(user),
              icon: 'trash',
              variant: 'destructive' as const
            }
          ]
        };
      });
      
      setUsers(mappedUsers);
      
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los usuarios';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const handleSaveUser = async (userData: Partial<TableUser>) => {
    try {
      if (userData.id) {
        await userService.updateUser(userData.id, userData as any);
        toast.success('Usuario actualizado correctamente');
      } else {
        await userService.createUser(userData as any);
        toast.success('Usuario creado correctamente');
      }
      
      setIsFormOpen(false);
      setSelectedUser(null);
      fetchUsers();
      
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar el usuario';
      toast.error(`Error: ${errorMessage}`);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-gray-600">Administra los usuarios del sistema</p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          Nuevo Usuario
        </Button>
      </div>
      
      <div className="mt-8">
        {isLoading ? (
          <p>Cargando usuarios...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No se encontraron usuarios</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => fetchUsers()}
            >
              Reintentar
            </Button>
          </div>
        ) : (
          <div>
            <div className="mb-4 text-sm text-gray-500">
              Mostrando {users.length} usuarios
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={String(column.id || column.accessorKey)}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {String(column.header || '')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      {columns.map((column) => (
                        <td key={`${user.id}-${column.id || column.accessorKey}`} className="px-6 py-4 whitespace-nowrap">
                          {column.cell ? (
                            column.cell({ row: { original: user, getValue: (key: string) => (user as any)[key] } } as any)
                          ) : (
                            <>{String((user as any)[column.accessorKey as string])}</>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {isFormOpen && (
        <UserForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={handleSaveUser}
          defaultValues={selectedUser}
        />
      )}
      
      {/* <-- CAMBIO: Eliminamos el DeleteConfirmationDialog, ya no se usa */}
    </div>
  );
};

export default AdminUsers;