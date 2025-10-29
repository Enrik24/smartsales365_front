import { Product } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Edit } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StockTableProps {
  products: Product[];
  onUpdateStock: (product: Product) => void;
}

const StockTable = ({ products, onUpdateStock }: StockTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>SKU/Modelo</TableHead>
            <TableHead className="text-right">Stock Actual</TableHead>
            <TableHead><span className="sr-only">Acciones</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.nombre}</TableCell>
              <TableCell>{product.modelo}</TableCell>
              <TableCell className={cn(
                "text-right font-semibold",
                product.stock <= 10 && "text-red-500",
                product.stock > 10 && product.stock <= 20 && "text-yellow-500"
              )}>
                {product.stock}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" onClick={() => onUpdateStock(product)}>
                  <Edit className="mr-2 h-4 w-4" /> Actualizar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StockTable;
