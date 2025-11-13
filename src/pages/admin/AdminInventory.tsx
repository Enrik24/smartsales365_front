import { useEffect, useState } from 'react';
import AdminPageHeader from '@/components/admin/shared/AdminPageHeader';
import InventoryTable from '@/components/admin/inventory/InventoryTable';
import IncreaseStockForm from '@/components/admin/inventory/IncreaseStockForm';
import { productService } from '@/api/services/productService';
import { inventoryService } from '@/api/services/inventoryService';
import { showToast } from '@/components/ui/toast/Toast';

interface InventoryRow {
  id: number;
  sku: string;
  nombre: string;
  stock_actual: number;
  stock_minimo?: number;
}

const AdminInventory = () => {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selected, setSelected] = useState<InventoryRow | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await productService.getAll();
      if ('error' in res && res.error) throw new Error(res.error.message || 'Error al listar inventario');
      const payload: any = res.data as any;
      const list: any[] = Array.isArray(payload)
        ? payload
        : (Array.isArray(payload?.results) ? payload.results : (Array.isArray(payload?.data) ? payload.data : []));
      const mapped: InventoryRow[] = list.map((p: any) => ({
        id: Number(p.id),
        sku: String(p.sku),
        nombre: String(p.nombre),
        stock_actual: Number(p.stock_actual ?? 0),
        stock_minimo: p.stock_minimo != null ? Number(p.stock_minimo) : undefined,
      }));
      setRows(mapped);
    } catch (e: any) {
      showToast({ title: 'Error', description: e.message || 'No se pudo cargar el inventario', type: 'error' });
    }
  };

  useEffect(() => { void fetchProducts(); }, []);

  const onOpenForm = (row: InventoryRow) => {
    setSelected(row);
    setIsFormOpen(true);
  };

  const onIncrease = async (cantidad: number) => {
    if (!selected) return;
    try {
      const res = await inventoryService.increaseStock(selected.id, cantidad);
      if ('error' in res && res.error) throw new Error(res.error.message || 'Error al aumentar stock');
      await fetchProducts();
      setIsFormOpen(false);
      setSelected(null);
      showToast({ title: '¡Éxito!', description: 'Stock actualizado', type: 'success' });
    } catch (e: any) {
      showToast({ title: 'Error', description: e.message || 'No se pudo actualizar el stock', type: 'error' });
    }
  };

  return (
    <>
      <AdminPageHeader title="Gestionar Inventario" buttonLabel="" onButtonClick={() => {}} />
      <InventoryTable rows={rows} onUpdate={(r) => onOpenForm(r)} />
      <IncreaseStockForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        productName={selected?.nombre || ''}
        onSubmit={(data: { cantidad: number }) => onIncrease(data.cantidad)}
      />
    </>
  );
};

export default AdminInventory;
