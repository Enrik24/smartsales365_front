import { useState } from 'react';
import { Permission } from '@/types';
import AdminPageHeader from '@/components/admin/shared/AdminPageHeader';
import PermissionsTable from '@/components/admin/permissions/PermissionsTable';
import PermissionForm from '@/components/admin/permissions/PermissionForm';
import DeleteConfirmationDialog from '@/components/admin/shared/DeleteConfirmationDialog';
import { useEffect } from 'react';
import { permissionService, type PermissionDTO } from '@/api/services/permissionService';
import { showToast } from '@/components/ui/toast/Toast';
import { logExitoso, logFallido } from '@/lib/bitacora';

const AdminPermissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpenForm = (permission: Permission | null = null) => {
    setSelectedPermission(permission);
    setIsFormOpen(true);
  };

  // Adaptador para el formulario: convierte { nombre_permiso, descripcion }
  // al shape interno { nombre, descripcion }
  const handleFormSubmit = async (data: { nombre: string; descripcion: string }) => {
    await handleSubmit({ nombre: data.nombre, descripcion: data.descripcion });
  };

  const handleOpenDeleteDialog = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsDeleteDialogOpen(true);
  };

  const mapDtoToUi = (dto: PermissionDTO): Permission => ({
    id: String(dto.id),
    nombre: dto.nombre_permiso,
    descripcion: dto.descripcion || '',
  });

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const res = await permissionService.list();
      if (res.error) throw new Error(res.error.message || 'Error al listar permisos');
      const raw = Array.isArray(res.data) ? res.data : [];
      setPermissions(raw.map(mapDtoToUi));
    } catch (e: any) {
      showToast({ title: 'Error', description: e.message || 'Error al cargar permisos', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleSubmit = async (data: { nombre: string; descripcion?: string }) => {
    try {
      if (selectedPermission) {
        const res = await permissionService.update(Number(selectedPermission.id), {
          nombre_permiso: data.nombre,
          descripcion: data.descripcion || null,
        });
        if (res.error || !res.data) throw new Error(res.error?.message || 'Error al actualizar permiso');
        const updated = mapDtoToUi(res.data);
        setPermissions((prev) => prev.map((p) => (p.id === selectedPermission.id ? updated : p)));
        showToast({ title: '¡Éxito!', description: 'Permiso actualizado', type: 'success' });
        // Bitácora
        void logExitoso('PERMISO_EDITADO');
      } else {
        const res = await permissionService.create({
          nombre_permiso: data.nombre,
          descripcion: data.descripcion || null,
        });
        if (res.error || !res.data) throw new Error(res.error?.message || 'Error al crear permiso');
        setPermissions((prev) => [...prev, mapDtoToUi(res.data!)]);
        showToast({ title: '¡Éxito!', description: 'Permiso creado', type: 'success' });
        // Bitácora
        void logExitoso('PERMISO_CREADO');
      }
      setIsFormOpen(false);
      setSelectedPermission(null);
    } catch (e: any) {
      showToast({ title: 'Error', description: e.message || 'Operación fallida', type: 'error' });
      // Bitácora
      void logFallido(selectedPermission ? 'PERMISO_EDICION_FALLIDA' : 'PERMISO_CREACION_FALLIDA');
    }
  };
  
  const handleDelete = async () => {
    if (!selectedPermission) return;
    try {
      const res = await permissionService.remove(Number(selectedPermission.id));
      if (res.error) throw new Error(res.error.message || 'Error al eliminar permiso');
      setPermissions((prev) => prev.filter((p) => p.id !== selectedPermission.id));
      showToast({ title: '¡Eliminado!', description: 'Permiso eliminado', type: 'success' });
      // Bitácora
      void logExitoso('PERMISO_ELIMINADO');
    } catch (e: any) {
      showToast({ title: 'Error', description: e.message || 'Error al eliminar', type: 'error' });
      // Bitácora
      void logFallido('PERMISO_ELIMINACION_FALLIDA');
    } finally {
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
        onSubmit={handleFormSubmit}
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
