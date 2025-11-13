// src/components/admin/users/UserForm.tsx

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from '@/types';
import { userAdminSchema, UserAdminFormData } from '@/lib/validators/user';
import { useEffect } from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

type FormDataWithEstado = UserAdminFormData & { estado?: 'activo' | 'inactivo' };

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormDataWithEstado) => void;
  defaultValues: Partial<User> | null;
}

const UserForm = ({ open, onOpenChange, onSubmit, defaultValues }: UserFormProps) => {
  const { 
    register, 
    handleSubmit, 
    control, 
    reset, 
    getValues,
    formState: { errors, isSubmitting } 
  } = useForm<FormDataWithEstado>({
    resolver: zodResolver(userAdminSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      rol: 'Cliente',
      telefono: '',
      direccion: '',
      // Nuevo: estado por defecto activo
      // @ts-ignore - el schema podría no incluir estado aún
      estado: 'activo' as any,
      password: '',
      confirm_password: ''
    }
  });

  useEffect(() => {
    if (defaultValues) {
      // Ensure the role is one of the allowed values
      const role = ['Administrador', 'Cliente', 'Empleado'].includes(defaultValues.rol || '')
        ? defaultValues.rol
        : 'Cliente';
      // Normalizar estado a minúsculas para el select
      const estado = (defaultValues.estado || '').toLowerCase() === 'inactivo' ? 'inactivo' : 'activo';
        
      reset({
        ...defaultValues,
        rol: role as 'Administrador' | 'Cliente',
        // @ts-ignore - el schema podría no incluir estado aún
        estado: estado as any,
        password: '',
        confirm_password: ''
      });
    } else {
      reset({
        nombre: '',
        apellido: '',
        email: '',
        rol: 'Cliente',
        telefono: '',
        direccion: '',
        // @ts-ignore - el schema podría no incluir estado aún
        estado: 'activo' as any,
        password: '',
        confirm_password: ''
      });
    }
  }, [defaultValues, reset, open]);

  const handleFormSubmit = (data: FormDataWithEstado) => {
    // Remove empty password fields if they exist
    const submitData: FormDataWithEstado = { ...data };
    // Reincorporar 'estado' por si el resolver lo removió del parsed data
    // @ts-ignore
    const estado = (getValues('estado') as any) || submitData.estado;
    if (estado) {
      // @ts-ignore
      submitData.estado = estado;
    }
    if (!submitData.password) {
      delete submitData.password;
      delete submitData.confirm_password;
    }
    onSubmit(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{defaultValues ? 'Editar Usuario' : 'Añadir Usuario'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" {...register('nombre')} />
              {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>}
            </div>
            <div>
              <Label htmlFor="apellido">Apellido</Label>
              <Input id="apellido" {...register('apellido')} />
              {errors.apellido && <p className="text-red-500 text-sm mt-1">{errors.apellido.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          
           <div className="space-y-1">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" {...register('password')} placeholder={defaultValues ? 'Dejar en blanco para no cambiar' : ''} />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm_password">Confirmar Contraseña</Label>
              <Input id="confirm_password" type="password" {...register('confirm_password')} />
              {errors.confirm_password && <p className="text-red-500 text-sm mt-1">{errors.confirm_password.message}</p>}
            </div>
            <div>
            <Label htmlFor="rol">Rol</Label>
            <Controller
              name="rol"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cliente">Cliente</SelectItem>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div>
          <Label htmlFor="estado">Estado</Label>
          <Controller
            // @ts-ignore - el schema podría no incluir estado aún
            name="estado"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value || 'activo'}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserForm;