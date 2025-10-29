import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { permissionSchema } from '@/lib/validators';
import { Permission } from '@/types';
import { useEffect } from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

type PermissionFormData = z.infer<typeof permissionSchema>;

interface PermissionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PermissionFormData) => void;
  defaultValues: Permission | null;
}

const PermissionForm = ({ open, onOpenChange, onSubmit, defaultValues }: PermissionFormProps) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PermissionFormData>({
    resolver: zodResolver(permissionSchema),
  });

  useEffect(() => {
    if (open) {
      if (defaultValues) {
        reset(defaultValues);
      } else {
        reset({ nombre: '', descripcion: '' });
      }
    }
  }, [defaultValues, reset, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{defaultValues ? 'Editar Permiso' : 'Añadir Permiso'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre del Permiso</Label>
            <Input id="nombre" {...register('nombre')} />
            {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>}
          </div>
          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Input id="descripcion" {...register('descripcion')} />
            {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion.message}</p>}
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

export default PermissionForm;
