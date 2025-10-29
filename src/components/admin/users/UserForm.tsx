import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { userAdminSchema } from '@/lib/validators';
import { User } from '@/types';
import { useEffect } from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

type UserFormData = z.infer<typeof userAdminSchema>;

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormData) => void;
  defaultValues: User | null;
}

const UserForm = ({ open, onOpenChange, onSubmit, defaultValues }: UserFormProps) => {
  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<UserFormData>({
    resolver: zodResolver(userAdminSchema),
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    } else {
      reset({ nombre: '', apellido: '', email: '', rol: 'Cliente', telefono: '', password: '', confirm_password: '' });
    }
  }, [defaultValues, reset, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{defaultValues ? 'Editar Usuario' : 'Añadir Usuario'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
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
          <div>
            <Label htmlFor="telefono">Teléfono (Opcional)</Label>
            <Input id="telefono" {...register('telefono')} />
          </div>
          <div>
            <Label htmlFor="rol">Rol</Label>
            <Controller
              name="rol"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
