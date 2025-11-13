import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ordersService } from '@/api/services/ordersService';
import { showToast } from '@/components/ui/toast/Toast';
import { CreditCard, Loader2 } from 'lucide-react';

const PaymentPage = () => {
  const { pedidoId } = useParams<{ pedidoId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [order, setOrder] = useState<{ numero_seguimiento?: string; monto_total?: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const trackingNumber = (() => {
    const o: any = order || {};
    return (
      o.numero_seguimiento ||
      o.numeroSeguimiento ||
      o.tracking_number ||
      o.trackingNumber ||
      o.numero ||
      pedidoId
    );
  })();

  const totalToPay = (() => {
    const o: any = order || {};
    const raw =
      o.monto_total ??
      o.montoTotal ??
      o.total ??
      o.amount_total ??
      o.amount ??
      0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  })();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!pedidoId) {
        showToast({ title: 'Error', description: 'ID de pedido no válido.', type: 'error' });
        navigate('/');
        return;
      }

      setLoading(true);
      const res = await ordersService.getById(pedidoId);
      setLoading(false);

      if (res.error) {
        showToast({ title: 'Error', description: res.error.message || 'No se pudo cargar el pedido.', type: 'error' });
        navigate('/');
        return;
      }

      if (res.data) {
        setOrder(res.data);
      }
    };

    fetchOrder();
  }, [pedidoId, navigate]);

  
  const handleProcessPayment = async () => {
    if (!pedidoId) {
      showToast({ title: 'Error', description: 'ID de pedido no válido.', type: 'error' });
      return;
    }

    setProcessing(true);
    // Guardar el pedidoId para que la página de éxito pueda usarlo si Stripe no devuelve query/params
    try {
      localStorage.setItem('lastPedidoId', String(pedidoId));
    } catch {}
    const res = await ordersService.createStripeCheckout(pedidoId);

    // --- INICIO DEL BLOQUE DE DEPURACIÓN ---
    console.log("--- INICIANDO DEPURACIÓN ---");
    console.log("1. El objeto 'res' es:", res);

    if (res.error) {
      console.log("2. Se encontró un error en 'res.error'. Entrando al bloque de error.");
      showToast({ title: 'Error al procesar pago', description: res.error.message || 'Intenta nuevamente.', type: 'error' });
      setProcessing(false);
      return;
    }

    console.log("3. No se encontró error. 'res.data' es:", res.data);
    console.log("4. El valor de 'res.data?.checkoutUrl' es:", res.data?.checkoutUrl || res.data?.checkout_url);
    console.log("5. ¿Es 'res.data?.checkoutUrl|checkout_url' truthy? (Boolean):", !!(res.data?.checkoutUrl || res.data?.checkout_url));

    if (res.data?.checkoutUrl || res.data?.checkout_url) {
      console.log("6. La condición es VERDADERA. Redirigiendo a Stripe...");
      window.location.href = (res.data as any).checkoutUrl || (res.data as any).checkout_url;
    } else {
      console.log("6. La condición es FALSA. Entrando al bloque 'else'.");
      showToast({ title: 'Error', description: 'No se pudo obtener la URL de pago de Stripe.', type: 'error' });
      setProcessing(false);
    }
    // --- FIN DEL BLOQUE DE DEPURACIÓN ---
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-500">No se pudo cargar la información del pedido.</p>
        <Button className="mt-4" onClick={() => navigate('/')}>
          Volver al inicio
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Método de Pago
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2 py-4">
            <p className="text-lg">
              Pedido #{trackingNumber} confirmado{' '}
              <span className="text-green-500">✅</span>
            </p>
            <p className="text-xl font-semibold">
              Total a pagar: ${totalToPay.toLocaleString()}
            </p>
          </div>

          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  <span className="font-semibold">Tarjeta de Crédito/Débito (Stripe)</span>
                </div>
                <p className="text-sm text-gray-500">Pago seguro con Stripe</p>
              </div>
              <div>
                <select
                  name="metodo_pago"
                  id="metodo_pago"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="card">Tarjeta</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              onClick={handleProcessPayment}
              disabled={processing}
              size="lg"
              className="w-full sm:w-auto"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Procesar con Stripe →
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentPage;

