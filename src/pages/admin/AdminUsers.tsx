// src/components/admin/AdminUsers.tsx

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { userService } from "@/api/services/userService";
import { toast } from 'sonner';
import UsersTable from '@/components/admin/users/UsersTable';
import UserForm from '@/components/admin/users/UserForm';
import Swal from 'sweetalert2'; 
import type { User } from '@/types';
import { logExitoso, logFallido } from '@/lib/bitacora';

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

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Partial<User> | null>(null);

  const handleOpenForm = (user: Partial<User> | null = null) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteUserWithConfirmation = async (user: User) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¡No podrás revertir la eliminación de ${user.nombre} ${user.apellido}!`,
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
        // Bitácora
        void logExitoso('USUARIO_ELIMINADO');
        fetchUsers(); 
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        toast.error('Error al eliminar el usuario');
        // Bitácora
        void logFallido('USUARIO_ELIMINACION_FALLIDA');
      }
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await userService.getUsers();
      
      if ('error' in response) {
        throw new Error(response.error?.message || 'Error al cargar los usuarios');
      }
      
      const rawData: any = response.data;
      const usersData: any[] = Array.isArray(rawData)
        ? rawData
        : (rawData?.results ?? rawData?.data ?? []);
      
      const mappedUsers: User[] = usersData.map((u: any) => {
        const userRole = u.roles?.[0]?.nombre_rol || 'Cliente';
        const userStatus = u.estado ? u.estado.charAt(0).toUpperCase() + u.estado.slice(1) : 'Inactivo';
        return {
          id: u.id?.toString?.() || String(u.id_usuario || ''),
          id_usuario: u.id,
          email: u.email || '',
          nombre: u.nombre || '',
          apellido: u.apellido || '',
          telefono: u.telefono || '',
          direccion: u.direccion || '',
          rol: userRole,
          estado: userStatus,
          fecha_registro: u.fecha_registro || '',
          ultimo_login: u.ultimo_login ?? null,
          is_active: !!u.is_active,
          is_staff: !!u.is_staff,
        } as User;
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
  
  const handleSaveUser = async (userData: any) => {
    try {
      const desiredEstado = (userData.estado || '').toString().toLowerCase();
      const desiredRol = userData.rol as string | undefined;
      // Nunca enviar 'estado' al serializer de perfil; se maneja por endpoints dedicados
      let { estado: _omitEstado, ...payload } = userData || {};
      // Remover passwords vacíos si llegan desde otro form
      if (!payload?.password) {
        delete (payload as any)?.password;
        delete (payload as any)?.confirm_password;
      }

      if (selectedUser?.id) {
        // Update existing
        // Mapear rol por nombre a ID y enviarlo como 'roles: [id]' si corresponde
        if (desiredRol) {
          const rolesRes = await userService.getRoles();
          if (!('error' in rolesRes) || !rolesRes.error) {
            const raw: any = (rolesRes as any).data;
            const rolesList: any[] = Array.isArray(raw) ? raw : (raw?.results ?? raw?.data ?? []);
            const match = rolesList.find((r: any) => r?.nombre_rol === desiredRol || r?.nombre === desiredRol);
            if (match?.id) {
              (payload as any).roles = [match.id];
            } else {
              toast.error(`Rol no encontrado: ${desiredRol}`);
            }
          } else {
            toast.error(rolesRes.error.message || 'Error al obtener roles');
          }
        }
        const upd = await userService.updateUser(selectedUser.id, payload as any);
        if ('error' in upd && upd.error) throw new Error(upd.error.message || 'Error al actualizar usuario');
        // Apply estado if provided
        const currentEstado = (selectedUser.estado || '').toString().toLowerCase();
        if (desiredEstado && desiredEstado !== currentEstado) {
          const idStr = String(selectedUser.id);
          if (desiredEstado === 'inactivo') {
            const deact = await userService.deactivateUser(idStr);
            if ('error' in deact && deact.error) throw new Error(deact.error.message || 'Error al desactivar usuario');
          }
          if (desiredEstado === 'activo') {
            const act = await userService.activateUser(idStr);
            if ('error' in act && act.error) throw new Error(act.error.message || 'Error al activar usuario');
          }
        }
        toast.success('Usuario actualizado correctamente');
        // Bitácora
        void logExitoso('USUARIO_EDITADO');
      } else {
        // Create new via registro endpoint
        // En registro, el serializer acepta 'rol' por nombre; mantenerlo en payload si existe
        if (desiredRol) {
          (payload as any).rol = desiredRol;
        }
        const res = await userService.createUser(payload as any);
        if ('error' in res && res.error) throw new Error(res.error.message || 'Error al crear usuario');
        // Try to get new user id from payload shape { usuario: {...} }
        const newId = (res as any)?.data?.usuario?.id ?? (res as any)?.data?.id;
        // Apply estado if provided and we have id
        if (newId) {
          const idStr = String(newId);
          if (desiredEstado === 'inactivo') {
            const deact = await userService.deactivateUser(idStr);
            if ('error' in deact && deact.error) throw new Error(deact.error.message || 'Error al desactivar usuario');
          }
          if (desiredEstado === 'activo') {
            const act = await userService.activateUser(idStr);
            if ('error' in act && act.error) throw new Error(act.error.message || 'Error al activar usuario');
          }
        }
        toast.success('Usuario creado correctamente');
        // Bitácora
        void logExitoso('USUARIO_CREADO');
      }
      
      setIsFormOpen(false);
      setSelectedUser(null);
      fetchUsers();
      
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar el usuario';
      toast.error(`Error: ${errorMessage}`);
      // Bitácora
      void logFallido(selectedUser?.id ? 'USUARIO_EDICION_FALLIDA' : 'USUARIO_CREACION_FALLIDA');
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
            <div className="mb-4 text-sm text-gray-500">Mostrando {users.length} usuarios</div>
            <UsersTable 
              users={users}
              onEdit={(u) => handleOpenForm(u)}
              onDelete={(u) => handleDeleteUserWithConfirmation(u)}
            />
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
    </div>
  );
};

export default AdminUsers;