import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

export type EstadoProducto = 'activo' | 'inactivo' | 'agotado';

export interface Option {
  id: number | string;
  nombre: string;
}

export interface ProductFormData {
  sku: string;
  nombre: string;
  descripcion?: string;
  precio: number | string;
  precio_original?: number | string;
  categoria: number | null;
  marca: number | null;
  estado: EstadoProducto;
  stock_inicial?: number;
  stock_minimo?: number;
  modelo?: string;
  voltaje?: string;
  garantia_meses?: number;
  eficiencia_energetica?: string;
  color?: string;
  peso?: number | string;
  alto?: number | string;
  ancho?: number | string;
  profundidad?: number | string;
  costo?: number | string;
  envio_gratis?: boolean;
  destacado?: boolean;
  imagen_file?: File | null;
  ficha_tecnica_file?: File | null;
}

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProductFormData) => void;
  defaultValues: Partial<ProductFormData> | null;
  categorias: Option[];
  marcas: Option[];
}

const ProductForm = ({ open, onOpenChange, onSubmit, defaultValues, categorias, marcas }: ProductFormProps) => {
  const [categoria, setCategoria] = useState<string>('');
  const [marca, setMarca] = useState<string>('');
  const [estado, setEstado] = useState<EstadoProducto>('activo');

  useEffect(() => {
    if (open) {
      setCategoria(defaultValues?.categoria != null ? String(defaultValues.categoria) : '');
      setMarca(defaultValues?.marca != null ? String(defaultValues.marca) : '');
      setEstado((defaultValues?.estado as EstadoProducto) || 'activo');
    }
  }, [open, defaultValues]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data: ProductFormData = {
      sku: String(form.get('sku') || ''),
      nombre: String(form.get('nombre') || ''),
      descripcion: String(form.get('descripcion') || ''),
      precio: String(form.get('precio') || '0'),
      precio_original: form.get('precio_original') ? String(form.get('precio_original')) : undefined,
      categoria: categoria ? Number(categoria) : null,
      marca: marca ? Number(marca) : null,
      estado,
      stock_inicial: form.get('stock_inicial') ? Number(form.get('stock_inicial')) : undefined,
      stock_minimo: form.get('stock_minimo') ? Number(form.get('stock_minimo')) : undefined,
      modelo: form.get('modelo') ? String(form.get('modelo')) : undefined,
      voltaje: form.get('voltaje') ? String(form.get('voltaje')) : undefined,
      garantia_meses: form.get('garantia_meses') ? Number(form.get('garantia_meses')) : undefined,
      eficiencia_energetica: form.get('eficiencia_energetica') ? String(form.get('eficiencia_energetica')) : undefined,
      color: form.get('color') ? String(form.get('color')) : undefined,
      peso: form.get('peso') ? String(form.get('peso')) : undefined,
      alto: form.get('alto') ? String(form.get('alto')) : undefined,
      ancho: form.get('ancho') ? String(form.get('ancho')) : undefined,
      profundidad: form.get('profundidad') ? String(form.get('profundidad')) : undefined,
      costo: form.get('costo') ? String(form.get('costo')) : undefined,
      envio_gratis: form.get('envio_gratis') === 'on',
      destacado: form.get('destacado') === 'on',
      imagen_file: (form.get('imagen_file') as File) || null,
      ficha_tecnica_file: (form.get('ficha_tecnica_file') as File) || null,
    };
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto w-[95vw] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{defaultValues ? 'Editar Producto' : 'Añadir Producto'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" name="sku" defaultValue={(defaultValues?.sku as string) || ''} required />
            </div>
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" name="nombre" defaultValue={(defaultValues?.nombre as string) || ''} required />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input id="descripcion" name="descripcion" defaultValue={(defaultValues?.descripcion as string) || ''} />
            </div>
            <div>
              <Label htmlFor="precio">Precio</Label>
              <Input id="precio" name="precio" type="number" step="0.01" defaultValue={String(defaultValues?.precio ?? '')} required />
            </div>
            <div>
              <Label htmlFor="precio_original">Precio original</Label>
              <Input id="precio_original" name="precio_original" type="number" step="0.01" defaultValue={String((defaultValues?.precio_original as number | string) ?? '')} />
            </div>
            <div>
              <Label htmlFor="categoria">Categoría</Label>
              <select id="categoria" name="categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full border rounded-md h-10 px-3">
                <option value="">Seleccione...</option>
                {categorias.map((c) => (
                  <option key={c.id} value={String(c.id)}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="marca">Marca</Label>
              <select id="marca" name="marca" value={marca} onChange={(e) => setMarca(e.target.value)} className="w-full border rounded-md h-10 px-3">
                <option value="">Seleccione...</option>
                {marcas.map((m) => (
                  <option key={m.id} value={String(m.id)}>{m.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="estado">Estado</Label>
              <select id="estado" name="estado" value={estado} onChange={(e) => setEstado(e.target.value as EstadoProducto)} className="w-full border rounded-md h-10 px-3">
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="agotado">Agotado</option>
              </select>
            </div>
            <div>
              <Label htmlFor="stock_inicial">Stock inicial</Label>
              <Input id="stock_inicial" name="stock_inicial" type="number" defaultValue={String(defaultValues?.stock_inicial ?? '')} disabled={Boolean(defaultValues)} />
            </div>
            <div>
              <Label htmlFor="stock_minimo">Stock mínimo</Label>
              <Input id="stock_minimo" name="stock_minimo" type="number" defaultValue={String(defaultValues?.stock_minimo ?? '')} />
            </div>
            <div>
              <Label htmlFor="modelo">Modelo</Label>
              <Input id="modelo" name="modelo" defaultValue={(defaultValues?.modelo as string) || ''} />
            </div>
            <div>
              <Label htmlFor="voltaje">Voltaje</Label>
              <Input id="voltaje" name="voltaje" defaultValue={(defaultValues?.voltaje as string) || ''} />
            </div>
            <div>
              <Label htmlFor="garantia_meses">Garantía (meses)</Label>
              <Input id="garantia_meses" name="garantia_meses" type="number" defaultValue={String(defaultValues?.garantia_meses ?? '')} />
            </div>
            <div>
              <Label htmlFor="eficiencia_energetica">Eficiencia energética</Label>
              <Input id="eficiencia_energetica" name="eficiencia_energetica" defaultValue={(defaultValues?.eficiencia_energetica as string) || ''} />
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <Input id="color" name="color" defaultValue={(defaultValues?.color as string) || ''} />
            </div>
            <div>
              <Label htmlFor="peso">Peso (kg)</Label>
              <Input id="peso" name="peso" type="number" step="0.01" defaultValue={String((defaultValues?.peso as number | string) ?? '')} />
            </div>
            <div>
              <Label htmlFor="alto">Alto (cm)</Label>
              <Input id="alto" name="alto" type="number" step="0.01" defaultValue={String((defaultValues?.alto as number | string) ?? '')} />
            </div>
            <div>
              <Label htmlFor="ancho">Ancho (cm)</Label>
              <Input id="ancho" name="ancho" type="number" step="0.01" defaultValue={String((defaultValues?.ancho as number | string) ?? '')} />
            </div>
            <div>
              <Label htmlFor="profundidad">Profundidad (cm)</Label>
              <Input id="profundidad" name="profundidad" type="number" step="0.01" defaultValue={String((defaultValues?.profundidad as number | string) ?? '')} />
            </div>
            <div>
              <Label htmlFor="costo">Costo</Label>
              <Input id="costo" name="costo" type="number" step="0.01" defaultValue={String((defaultValues?.costo as number | string) ?? '')} />
            </div>
            <div className="flex items-center gap-2">
              <input id="envio_gratis" name="envio_gratis" type="checkbox" defaultChecked={Boolean(defaultValues?.envio_gratis)} />
              <Label htmlFor="envio_gratis">Envío gratis</Label>
            </div>
            <div className="flex items-center gap-2">
              <input id="destacado" name="destacado" type="checkbox" defaultChecked={Boolean(defaultValues?.destacado)} />
              <Label htmlFor="destacado">Destacado</Label>
            </div>
            <div>
              <Label htmlFor="imagen_file">Imagen</Label>
              <Input id="imagen_file" name="imagen_file" type="file" accept="image/*" />
            </div>
            <div>
              <Label htmlFor="ficha_tecnica_file">Ficha técnica (PDF)</Label>
              <Input id="ficha_tecnica_file" name="ficha_tecnica_file" type="file" accept="application/pdf" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;

