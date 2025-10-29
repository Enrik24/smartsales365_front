import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Product } from '@/types';
import { useEffect } from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

const stockUpdateSchema = z.object({
  stock: z.coerce.number().min(0, { message: "El stock no puede ser negativo." }),
});

type StockUpdateFormData = z.infer<typeof stockUpdateSchema>;

interface UpdateStockFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: StockUpdateFormData) => void;
  product: Product | null;
}

const UpdateStockForm = ({ open, onOpenChange, onSubmit, product }: UpdateStockFormProps) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<StockUpdateFormData>({
    resolver: zodResolver(stockUpdateSchema),
  });

  useEffect(() => {
    if (product) {
      reset({ stock: product.stock });
    }
  }, [product, reset, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Actualizar Stock</DialogTitle>
          <DialogDescription>
            Estás modificando el stock para: <strong>{product?.nombre}</strong>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="stock">Cantidad de Stock</Label>
            <Input id="stock" type="number" {...register('stock')} />
            {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateStockForm;
