import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { roleSchema } from '@/lib/validators';
import { Role, Permission } from '@/types';
import { useEffect } from 'react';
import { mockPermissions } from '@/lib/mock-data';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { Checkbox } from '@/components/ui/Checkbox';

type RoleFormData = z.infer<typeof roleSchema>;

interface RoleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RoleFormData) => void;
  defaultValues: Role | null;
}

const RoleForm = ({ open, onOpenChange, onSubmit, defaultValues }: RoleFormProps) => {
  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
  });

  useEffect(() => {
    if (open) {
      if (defaultValues) {
        reset(defaultValues);
      } else {
        reset({ nombre: '', descripcion: '', activo: true, permissionIds: [] });
      }
    }
  }, [defaultValues, reset, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{defaultValues ? 'Editar Rol' : 'Añadir Rol'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre del Rol</Label>
            <Input id="nombre" {...register('nombre')} />
            {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>}
          </div>
          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Input id="descripcion" {...register('descripcion')} />
            {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion.message}</p>}
          </div>
          
          <div>
            <Label>Permisos</Label>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
              <Controller
                name="permissionIds"
                control={control}
                render={({ field }) => (
                  <>
                    {mockPermissions.map((permission: Permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`perm-${permission.id}`}
                          checked={field.value?.includes(permission.id)}
                          onCheckedChange={(checked) => {
                            const newValue = checked
                              ? [...(field.value || []), permission.id]
                              : (field.value || []).filter((id) => id !== permission.id);
                            field.onChange(newValue);
                          }}
                        />
                        <Label htmlFor={`perm-${permission.id}`} className="font-normal">{permission.nombre}</Label>
                      </div>
                    ))}
                  </>
                )}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Controller
              name="activo"
              control={control}
              render={({ field }) => (
                <Switch
                  id="activo"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="activo">Activo</Label>
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

export default RoleForm;
