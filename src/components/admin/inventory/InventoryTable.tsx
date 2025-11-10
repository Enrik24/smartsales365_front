import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Edit } from 'lucide-react';

export interface InventoryRow {
  id: number;
  sku: string;
  nombre: string;
  stock_actual: number;
  stock_minimo?: number;
}

export default function InventoryTable({ rows, onUpdate }: { rows: InventoryRow[]; onUpdate: (row: InventoryRow) => void; }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead className="text-right">Stock min.</TableHead>
            <TableHead className="text-right">Stock act.</TableHead>
            <TableHead><span className="sr-only">Acciones</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.nombre}</TableCell>
              <TableCell>{r.sku}</TableCell>
              <TableCell className="text-right">{r.stock_minimo ?? '-'}</TableCell>
              <TableCell className="text-right">
                {typeof r.stock_minimo === 'number' && r.stock_actual <= (r.stock_minimo ?? 0) ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {r.stock_actual} REPONER
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {r.stock_actual}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" onClick={() => onUpdate(r)}>
                  <Edit className="mr-2 h-4 w-4" /> Aumentar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
