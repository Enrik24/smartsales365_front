import { useEffect, useState } from 'react';
import CustomersTable, { Customer as UICustomer } from '@/components/admin/customers/CustomersTable';
import CustomerForm, { CustomerFormData } from '@/components/admin/customers/CustomerForm';
import DeleteConfirmationDialog from '@/components/admin/shared/DeleteConfirmationDialog';
import { customerService, type CustomerDTO } from '@/api/services/customerService';
import { userService } from '@/api/services/userService';
import { showToast } from '@/components/ui/toast/Toast';
import { logExitoso, logFallido } from '@/lib/bitacora';

const mapDtoToUi = (dto: CustomerDTO): UICustomer => ({
  id: String(dto.id),
  nombre: dto.nombre,
  apellido: dto.apellido,
  email: dto.email,
  telefono: (dto.telefono || '') as string,
  direccion: (dto.direccion || '') as string,
  estado: (dto.estado ?? (dto.is_active ? 'Activo' : 'Inactivo')) as 'Activo' | 'Inactivo',
});

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<UICustomer[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<UICustomer | null>(null);

  const fetchCustomers = async () => {
    try {
      const res = await customerService.list();
      if (res.error) throw new Error(res.error.message || 'Error al listar clientes');
      const data = Array.isArray(res.data) ? res.data : [];
      setCustomers(data.map(mapDtoToUi));
    } catch (e: any) {
      showToast({ title: 'Error', description: e.message || 'No se pudieron cargar los clientes', type: 'error' });
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenForm = (customer: UICustomer | null = null) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleSubmit = async (form: CustomerFormData) => {
    try {
      if (!selectedCustomer) return;
      const id = selectedCustomer.id;

      // Update core fields
      const updateRes = await userService.updateUser(id, {
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        telefono: form.telefono,
        direccion: form.direccion,
      } as any);
      if ('error' in updateRes && updateRes.error) throw new Error(updateRes.error.message || 'Error al actualizar cliente');

      // Handle estado changes with activate/deactivate endpoints
      const prevEstado = selectedCustomer.estado;
      const desiredEstado = form.estado;
      if (desiredEstado !== prevEstado) {
        if (desiredEstado === 'Activo') {
          const act = await userService.activateUser(id);
          if ('error' in act && act.error) throw new Error(act.error.message || 'Error al activar cliente');
        } else {
          const deact = await userService.deactivateUser(id);
          if ('error' in deact && deact.error) throw new Error(deact.error.message || 'Error al desactivar cliente');
        }
      }

      setCustomers((prev) => prev.map((c) => c.id === id ? { ...c, ...form } : c));
      showToast({ title: '¡Éxito!', description: 'Cliente actualizado correctamente', type: 'success' });
      void logExitoso('CLIENTE_EDITADO');
      setIsFormOpen(false);
      setSelectedCustomer(null);
    } catch (e: any) {
      showToast({ title: 'Error', description: e.message || 'Operación fallida', type: 'error' });
      void logFallido('CLIENTE_EDICION_FALLIDA');
    }
  };

  const handleOpenDeleteDialog = (customer: UICustomer) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedCustomer) return;
    try {
      const res = await userService.deactivateUser(selectedCustomer.id);
      if ('error' in res && res.error) throw new Error(res.error.message || 'Error al eliminar cliente');
      setCustomers((prev) => prev.map((c) => c.id === selectedCustomer.id ? { ...c, estado: 'Inactivo' } : c));
      showToast({ title: '¡Eliminado!', description: 'Cliente desactivado', type: 'success' });
      void logExitoso('CLIENTE_ELIMINADO');
    } catch (e: any) {
      showToast({ title: 'Error', description: e.message || 'Error al eliminar', type: 'error' });
      void logFallido('CLIENTE_ELIMINACION_FALLIDA');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedCustomer(null);
    }
  };

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Clientes</h1>
      </div>

      <CustomersTable
        customers={customers}
        onEdit={handleOpenForm}
        onDelete={handleOpenDeleteDialog}
      />

      <CustomerForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        defaultValues={selectedCustomer}
      />

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        itemName={selectedCustomer ? `${selectedCustomer.nombre} ${selectedCustomer.apellido}` : ''}
      />
    </>
  );
};

export default AdminCustomers;
