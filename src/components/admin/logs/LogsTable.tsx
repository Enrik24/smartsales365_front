import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import type { BitacoraItemDTO } from '@/api/services/bitacoraService';

interface LogsTableProps {
  items: BitacoraItemDTO[];
  loading?: boolean;
}

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const dd = d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
  const hh = d.toLocaleTimeString(undefined, { hour12: false });
  return { date: dd, time: hh };
};

const statusBadge = (estado: BitacoraItemDTO['estado']) => {
  const map: Record<string, { color: string; label: string }> = {
    exitoso: { color: 'bg-green-600 hover:bg-green-700', label: 'EXITOSO' },
    fallido: { color: 'bg-red-600 hover:bg-red-700', label: 'FALLIDO' },
    advertencia: { color: 'bg-amber-600 hover:bg-amber-700', label: 'ADVERTENCIA' },
  };
  const conf = map[estado] || map['exitoso'];
  return <Badge className={`${conf.color} text-white`}>{conf.label}</Badge>;
};

export default function LogsTable({ items, loading }: LogsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-800">
            <TableHead className="text-white">FECHA</TableHead>
            <TableHead className="text-white">HORA</TableHead>
            <TableHead className="text-white">USUARIO</TableHead>
            <TableHead className="text-white">IP</TableHead>
            <TableHead className="text-white">ACCION</TableHead>
            <TableHead className="text-white">ESTADO</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6}>Cargando...</TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>Sin resultados</TableCell>
            </TableRow>
          ) : (
            items.map((it) => {
              const { date, time } = formatDate(it.fecha_accion);
              const nombre = it.usuario_nombre || '';
              const email = it.usuario_email || '';
              return (
                <TableRow key={it.id_bitacora} className="odd:bg-white even:bg-gray-50">
                  <TableCell>{date}</TableCell>
                  <TableCell>{time}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{nombre || '—'}</span>
                      {email ? (
                        <span className="text-sm text-gray-500">{email}</span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>{it.ip || '—'}</TableCell>
                  <TableCell className="capitalize">{it.accion || '—'}</TableCell>
                  <TableCell>{statusBadge(it.estado)}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
