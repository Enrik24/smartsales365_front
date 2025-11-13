import { useEffect, useMemo, useState } from 'react';
import { bitacoraService, BitacoraFilters, BitacoraItemDTO } from '@/api/services/bitacoraService';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import LogsTable from '@/components/admin/logs/LogsTable';

const AdminLogs = () => {
  const [filters, setFilters] = useState<BitacoraFilters>({ estado: 'todos' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<BitacoraItemDTO[]>([]);

  const applyFilters = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bitacoraService.list(filters);
      setItems(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar la bitácora';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const estadoOptions = useMemo(() => [
    { value: 'todos', label: 'Todos' },
    { value: 'exitoso', label: 'Exitoso' },
    { value: 'fallido', label: 'Fallido' },
    { value: 'advertencia', label: 'Advertencia' },
  ], []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold">Bitácora</h1>
      </div>

      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Fecha Inicio</label>
              <Input
                type="date"
                value={filters.fecha_desde || ''}
                onChange={(e) => setFilters((f) => ({ ...f, fecha_desde: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-600">Fecha Fin</label>
              <Input
                type="date"
                value={filters.fecha_hasta || ''}
                onChange={(e) => setFilters((f) => ({ ...f, fecha_hasta: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-600">Estado</label>
              <select
                className="w-full border rounded-md h-10 px-3"
                value={filters.estado || 'todos'}
                onChange={(e) => setFilters((f) => ({ ...f, estado: e.target.value as any }))}
              >
                {estadoOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-sm text-gray-600">Buscar por nombre o email</label>
              <Input
                placeholder="Buscar..."
                value={filters.usuario_search || ''}
                onChange={(e) => setFilters((f) => ({ ...f, usuario_search: e.target.value }))}
              />
            </div>
          </div>

          <div className="mt-4">
            <Button onClick={applyFilters} className="bg-blue-600 hover:bg-blue-700">Aplicar Filtros</Button>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <LogsTable items={items} loading={loading} />
      )}
    </div>
  );
};

export default AdminLogs;
