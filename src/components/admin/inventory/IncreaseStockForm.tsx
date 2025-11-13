import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

const schema = z.object({
  cantidad: z.coerce.number().min(1, { message: 'Ingrese una cantidad mayor a 0' }),
});

type FormData = z.infer<typeof schema>;

export default function IncreaseStockForm({ open, onOpenChange, onSubmit, productName }: { open: boolean; onOpenChange: (o: boolean) => void; onSubmit: (data: FormData) => void; productName: string; }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({ resolver: zodResolver(schema) });

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-h-[85vh] overflow-y-auto w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Aumentar stock</DialogTitle>
          <DialogDescription>
            Producto: <strong>{productName}</strong>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div>
            <Label htmlFor="cantidad">Cantidad</Label>
            <Input id="cantidad" type="number" {...register('cantidad')} />
            {errors.cantidad && <p className="text-red-500 text-sm mt-1">{errors.cantidad.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Procesando...' : 'Guardar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
