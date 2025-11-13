import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';

export interface ProductRow {
  id: string;
  slug?: string;
  sku: string;
  nombre: string;
  precio: number;
  categoriaNombre?: string;
  marcaNombre?: string;
  estado: 'activo' | 'inactivo' | 'agotado';
  imagen_url?: string | null;
  categoria?: number | null;
  marca?: number | null;
  descripcion?: string;
  stock_inicial?: number;
  stock_minimo?: number;
  // Nuevos atributos opcionales para prefilling del formulario
  precio_original?: number | string;
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
}

interface ProductsTableProps {
  products: ProductRow[];
  onEdit: (product: ProductRow) => void;
  onDelete: (product: ProductRow) => void;
}

const ProductsTable = ({ products, onEdit, onDelete }: ProductsTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Imagen</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Marca</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead><span className="sr-only">Acciones</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id}>
              <TableCell>
                {p.imagen_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imagen_url} alt={p.nombre} className="h-10 w-10 object-cover rounded" />
                ) : (
                  <div className="h-10 w-10 rounded bg-muted" />
                )}
              </TableCell>
              <TableCell className="font-medium">{p.sku}</TableCell>
              <TableCell>{p.nombre}</TableCell>
              <TableCell>BS. {p.precio}</TableCell>
              <TableCell>{p.categoriaNombre || '-'}</TableCell>
              <TableCell>{p.marcaNombre || '-'}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  p.estado === 'activo' ? 'bg-green-100 text-green-800'
                  : p.estado === 'inactivo' ? 'bg-red-100 text-red-800'
                  : 'bg-orange-100 text-orange-800'
                }`}>
                  {p.estado}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menú</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(p)}>
                      <Edit className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(p)} className="text-red-500">
                      <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductsTable;
