import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { brandSchema } from '@/lib/validators';
import { Brand } from '@/types';
import { useEffect } from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';

type BrandFormData = z.infer<typeof brandSchema>;

interface BrandFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BrandFormData) => void;
  defaultValues: Brand | null;
}

const BrandForm = ({ open, onOpenChange, onSubmit, defaultValues }: BrandFormProps) => {
  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
  });

  useEffect(() => {
    if (open) {
      if (defaultValues) {
        reset(defaultValues);
      } else {
        reset({ nombre: '', descripcion: '', activo: true });
      }
    }
  }, [defaultValues, reset, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{defaultValues ? 'Editar Marca' : 'Añadir Marca'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre de la Marca</Label>
            <Input id="nombre" {...register('nombre')} />
            {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>}
          </div>
          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Input id="descripcion" {...register('descripcion')} />
            {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion.message}</p>}
          </div>
          <div className="flex items-center space-x-2">
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

export default BrandForm;
