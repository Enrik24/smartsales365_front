import { Product } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';

interface StockAlertsTableProps {
  products: Product[];
}

const StockAlertsTable = ({ products }: StockAlertsTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>SKU/Modelo</TableHead>
            <TableHead className="text-right">Stock Restante</TableHead>
            <TableHead className="text-center">Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className="hover:bg-red-50 dark:hover:bg-red-900/20">
              <TableCell className="font-medium">{product.nombre}</TableCell>
              <TableCell>{product.modelo}</TableCell>
              <TableCell className="text-right font-bold text-red-600 dark:text-red-400">
                {product.stock}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="destructive">Stock Bajo</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StockAlertsTable;
