import { useEffect, useState } from 'react';
import { Role } from '@/types';
import { RoleDTO } from '@/api/services/roleService';
import { roleService } from '@/api/services/roleService';
import AdminPageHeader from '@/components/admin/shared/AdminPageHeader';
import RolesTable from '@/components/admin/roles/RolesTable';
import RoleForm from '@/components/admin/roles/RoleForm';
import DeleteConfirmationDialog from '@/components/admin/shared/DeleteConfirmationDialog';
import { showToast } from '@/components/ui/toast/Toast';
import { logExitoso, logFallido } from '@/lib/bitacora';

const AdminRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchRoles = async () => {
      setLoading(true);
      const res = await roleService.list();
      if (!mounted) return;
      setLoading(false);

      if (res.error) {
        setError(res.error.message || 'Error al obtener roles');
        return;
      }

      const extractArray = (payload: any): any[] => {
        if (Array.isArray(payload)) return payload;
        if (!payload) return [];
        if (Array.isArray(payload.results)) return payload.results;
        if (Array.isArray(payload.data)) return payload.data;
        if (Array.isArray(payload.roles)) return payload.roles;
        if (Array.isArray(payload.items)) return payload.items;
        // Buscar el primer valor que sea array
        const firstArray = Object.values(payload).find((v: any) => Array.isArray(v));
        if (Array.isArray(firstArray)) return firstArray as any[];
        console.warn('Respuesta inesperada al obtener roles, se usará arreglo vacío:', payload);
        return [];
      };

      const data = extractArray(res.data);

      const mapped: Role[] = data.map((r: any) => {
        // Handle both formats: array of permission IDs or array of permission objects
        const permissionIds = Array.isArray(r.permisos) 
          ? r.permisos.map((p: any) => typeof p === 'object' ? String(p.id) : String(p))
          : (Array.isArray(r.permissionIds) ? r.permissionIds : []);
          
        return {
          id: String(r.id),
          nombre_rol: r.nombre_rol ?? r.nombre ?? r.name ?? '',
          descripcion: r.descripcion ?? r.description ?? '',
          permissionIds: permissionIds,
        };
      });

      setRoles(mapped);
    };

    fetchRoles();
    return () => { mounted = false; };
  }, []);
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

  const mapRoleDTOtoRole = (dto: any): Role => {
    // If permisos is an array of objects with id, extract the IDs
    const permisosArray = Array.isArray(dto.permisos) 
      ? dto.permisos.map((p: any) => typeof p === 'object' ? String(p.id) : String(p))
      : [];
      
    return {
      id: String(dto.id),
      nombre_rol: dto.nombre_rol,
      descripcion: dto.descripcion || '',
      permissionIds: permisosArray.length > 0 ? permisosArray : (dto.permissionIds || [])
    };
  };

  const handleSubmit = async (data: Omit<Role, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert permission IDs from string to number for the API
      const permisos = (data.permissionIds || []).map(id => parseInt(id, 10));
      
      if (selectedRole) {
        // Update existing role
        const response = await roleService.update(selectedRole.id, {
          nombre_rol: data.nombre_rol,
          descripcion: data.descripcion,
          permisos: permisos
        });
        
        if (response.error) {
          throw new Error(response.error.message || 'Error al actualizar el rol');
        }
        
        if (response.data) {
          const updatedRole = {
            ...mapRoleDTOtoRole(response.data as RoleDTO),
            permissionIds: data.permissionIds // Keep the original permission IDs as strings
          };
          setRoles(roles.map(r => r.id === selectedRole.id ? updatedRole : r));
          
          // Show success toast
          showToast({
            title: '¡Éxito!',
            description: 'Rol editado exitosamente',
            type: 'success'
          });
          // Bitácora
          void logExitoso('ROL_EDITADO');
          
          // Close the form after successful update
          setIsFormOpen(false);
          setSelectedRole(null);
        }
      } else {
        // Create new role
        const response = await roleService.create({
          nombre_rol: data.nombre_rol,
          descripcion: data.descripcion,
          permisos: permisos
        });
        
        if (response.error) {
          throw new Error(response.error.message || 'Error al crear el rol');
        }
        
        if (response.data) {
          const newRole = {
            ...mapRoleDTOtoRole(response.data as RoleDTO),
            permissionIds: data.permissionIds // Keep the original permission IDs as strings
          };
          setRoles([...roles, newRole]);
          
          // Show success toast
          showToast({
            title: '¡Éxito!',
            description: 'Rol creado exitosamente',
            type: 'success'
          });
          // Bitácora
          void logExitoso('ROL_CREADO');
          
          // Close the form after successful creation
          setIsFormOpen(false);
          setSelectedRole(null);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error inesperado';
      setError(errorMessage);
      showToast({
        title: 'Error',
        description: errorMessage,
        type: 'error'
      });
      // Bitácora
      void logFallido(selectedRole ? 'ROL_EDICION_FALLIDA' : 'ROL_CREACION_FALLIDA');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!selectedRole) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await roleService.remove(selectedRole.id);
      
      if (response.error) {
        throw new Error(response.error.message || 'Error al eliminar el rol');
      }
      
      // Update UI first
      setRoles(roles.filter(r => r.id !== selectedRole.id));
      
      // Show success toast
      showToast({
        title: '¡Eliminado!',
        description: 'Rol eliminado exitosamente',
        type: 'success'
      });
      // Bitácora
      void logExitoso('ROL_ELIMINADO');
      
      // Close the dialog after successful deletion
      setIsDeleteDialogOpen(false);
      setSelectedRole(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error al eliminar el rol';
      setError(errorMessage);
      showToast({
        title: 'Error',
        description: errorMessage,
        type: 'error'
      });
      // Bitácora
      void logFallido('ROL_ELIMINACION_FALLIDA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Gestionar Roles"
        buttonLabel="Añadir Rol"
        onButtonClick={() => handleOpenForm()}
      />
      
      {loading ? (
        <p>Cargando roles...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <RolesTable
          roles={roles}
          onEdit={handleOpenForm}
          onDelete={handleOpenDeleteDialog}
        />
      )}

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
        itemName={selectedRole?.nombre_rol || ''}
      />
    </>
  );
};

export default AdminRoles;
