import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

export interface CustomerFormData {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  direccion?: string;
  estado: 'Activo' | 'Inactivo';
}

export interface CustomerDefaultValues extends Partial<CustomerFormData> {
  id?: string;
}

interface CustomerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CustomerFormData) => void;
  defaultValues: CustomerDefaultValues | null;
}

const CustomerForm = ({ open, onOpenChange, onSubmit, defaultValues }: CustomerFormProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload: CustomerFormData = {
      nombre: String(form.get('nombre') || ''),
      apellido: String(form.get('apellido') || ''),
      email: String(form.get('email') || ''),
      telefono: String(form.get('telefono') || ''),
      direccion: String(form.get('direccion') || ''),
      estado: (String(form.get('estado') || 'Activo') as 'Activo' | 'Inactivo'),
    };
    onSubmit(payload);
  };

  useEffect(() => {
    // noop just to follow pattern if needed in future
  }, [open, defaultValues]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{defaultValues?.id ? 'Editar Cliente' : 'Editar Cliente'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" name="nombre" defaultValue={defaultValues?.nombre || ''} required />
          </div>
          <div>
            <Label htmlFor="apellido">Apellido</Label>
            <Input id="apellido" name="apellido" defaultValue={defaultValues?.apellido || ''} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={defaultValues?.email || ''} required />
          </div>
          <div>
            <Label htmlFor="telefono">Teléfono</Label>
            <Input id="telefono" name="telefono" defaultValue={defaultValues?.telefono || ''} />
          </div>
          <div>
            <Label htmlFor="direccion">Dirección</Label>
            <Input id="direccion" name="direccion" defaultValue={defaultValues?.direccion || ''} />
          </div>
          <div>
            <Label htmlFor="estado">Estado</Label>
            <select id="estado" name="estado" defaultValue={defaultValues?.estado || 'Activo'} className="w-full border rounded-md h-10 px-3">
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
          <DialogFooter>
            <Button type="submit">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerForm;
