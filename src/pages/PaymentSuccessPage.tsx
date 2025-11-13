import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ordersService } from '@/api/services/ordersService';
import { showToast } from '@/components/ui/toast/Toast';
import { CheckCircle2, Home, Package, Loader2 } from 'lucide-react';

const PaymentSuccessPage = () => {
  const { pedidoId } = useParams<{ pedidoId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);

  const trackingNumber = (() => {
    const o: any = order || {};
    const qsPedidoId = new URLSearchParams(location.search).get('pedidoId') || '';
    return (
      o.numero_seguimiento ||
      o.numeroSeguimiento ||
      o.tracking_number ||
      o.trackingNumber ||
      o.numero ||
      pedidoId ||
      qsPedidoId ||
      '—'
    );
  })();

  // Nota: totalToPay depende de 'summary', por lo que lo calcularemos más abajo tras definir 'summary'.

  useEffect(() => {
    const load = async () => {
      const searchParams = new URLSearchParams(location.search);
      const qsPedidoId = searchParams.get('pedidoId') || '';
      const storedPedidoId = (() => {
        try {
          return localStorage.getItem('lastPedidoId') || '';
        } catch {
          return '';
        }
      })();
      const effectivePedidoId = pedidoId || qsPedidoId || storedPedidoId;

      // Si no tenemos ID (ruta sin parámetro y sin query), mostramos éxito genérico
      if (!effectivePedidoId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const res = await ordersService.getById(effectivePedidoId);
      setLoading(false);
      if (res.error) {
        showToast({ title: 'Error', description: res.error.message || 'No se pudo cargar el pedido.', type: 'error' });
        navigate('/');
        return;
      }
      setOrder(res.data);
      // Limpiar el guardado temporal una vez usado
      try {
        localStorage.removeItem('lastPedidoId');
      } catch {}
    };
    load();
  }, [pedidoId, navigate, location.search]);

  type SummaryItem = { name: string; qty: number; price: number };
  const summary = useMemo(() => {
    if (!order) return { items: [] as SummaryItem[], shipping: 0, total: 0 };
    const items: SummaryItem[] = Array.isArray(order?.items)
      ? (order.items as any[]).map((it: any): SummaryItem => ({
          name: it.product?.nombre || it.producto?.nombre || `Producto ${it.producto_id ?? it.product_id ?? ''}`,
          qty: Number(it.cantidad ?? it.quantity ?? 1),
          price: Number(it.product?.precio_original ?? it.product?.precio ?? it.precio ?? 0),
        }))
      : [];
    const shipping = Number(order?.envio ?? order?.shipping_cost ?? 15);
    const itemsTotal = items.reduce((s: number, x: SummaryItem) => s + x.qty * x.price, 0);
    const total = Number(order?.monto_total ?? itemsTotal + shipping);
    return { items, shipping, total };
  }, [order]);

  const totalToPay = useMemo(() => {
    const o: any = order || {};
    const raw =
      o.monto_total ??
      o.montoTotal ??
      o.total ??
      o.amount_total ??
      o.amount ??
      0;
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return n;
    return summary.total; // fallback al total calculado
  }, [order, summary.total]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            ¡Pago Exitoso!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-lg">🎉 ¡Gracias por tu compra!</p>
            <p className="text-sm text-gray-600">📦 Tu pedido #{trackingNumber} ha sido confirmado</p>
            <p className="text-sm text-gray-600">📧 Recibirás un correo con los detalles</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Resumen</h3>
            <div className="border rounded-lg divide-y">
              {summary.items.length > 0 ? (
                summary.items.map((it: SummaryItem, idx: number) => (
                  <div key={idx} className="py-2 px-4 flex justify-between text-sm">
                    <span>{it.name} x{it.qty}</span>
                    <span>${(it.qty * it.price).toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <div className="py-3 px-4 text-sm text-gray-500">No hay ítems para mostrar.</div>
              )}
              <div className="py-2 px-4 flex justify-between text-sm">
                <span>Envío:</span>
                <span>${summary.shipping.toLocaleString()}</span>
              </div>
              <div className="py-2 px-4 flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>${totalToPay.toLocaleString()}</span>
              </div>
              <div className="py-2 px-4 text-sm">
                <div>Método: Tarjeta •••• 4242</div>
                <div>Estado: <span className="text-green-600 font-medium">Confirmado ✅</span></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button variant="outline" onClick={() => navigate('/profile/invoices')}>
              <Package className="h-4 w-4 mr-2" />
              Seguir pedido
            </Button>
            <Button onClick={() => navigate('/')}> 
              <Home className="h-4 w-4 mr-2" />
              Volver al inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
