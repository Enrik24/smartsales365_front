import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';
import { showToast } from '@/components/ui/toast/Toast';
import { ordersService } from '@/api/services/ordersService';
import { useAuth } from '@/hooks/useAuth';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const { cartItems } = useCart();

  const order = location?.state?.order;
  const { authState } = useAuth();

  const [shippingAddress, setShippingAddress] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [sameAddress, setSameAddress] = useState(true);

  useEffect(() => {
    if (sameAddress) setBillingAddress(shippingAddress);
  }, [sameAddress, shippingAddress]);

  type SummaryItem = { name: string; qty: number; price: number };
  const summary = useMemo(() => {
    const items: SummaryItem[] = Array.isArray(order?.items) && order.items.length > 0
      ? (order.items as any[]).map((it: any): SummaryItem => ({
          name: it.product?.nombre || it.producto?.nombre || `Producto ${it.producto_id ?? it.product_id ?? ''}`,
          qty: Number(it.cantidad ?? it.quantity ?? 1),
          price: Number(it.product?.precio_original ?? it.product?.precio ?? it.precio ?? 0),
        }))
      : cartItems.map((ci): SummaryItem => ({ name: ci.product.nombre, qty: ci.quantity, price: ci.product.precioActual }));
    const subtotal = items.reduce((s: number, x: SummaryItem) => s + x.qty * x.price, 0);
    const shipping = 15; // fijo por ahora
    const total = subtotal + shipping;
    return { items, subtotal, shipping, total };
  }, [order, cartItems]);

  useEffect(() => {
    const dir = authState.user?.direccion?.trim();
    if (dir) {
      setShippingAddress((prev) => prev || dir);
      if (sameAddress) setBillingAddress((prev) => prev || dir);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.user?.direccion]);

  const handleConfirm = async () => {
    if (!shippingAddress || !billingAddress) {
      showToast({ title: 'Faltan datos', description: 'Completa las direcciones para continuar.', type: 'warning' });
      return;
    }
    const payload = { direccion_envio: shippingAddress, direccion_facturacion: billingAddress, usar_misma: sameAddress };
    const res = await ordersService.create(payload);
    if (res.error) {
      showToast({ title: 'Error al crear pedido', description: res.error.message || 'Intenta nuevamente.', type: 'error' });
      return;
    }
    showToast({ title: 'Pedido creado', description: 'Tu pedido fue creado correctamente.', type: 'success' });
    const pedidoId = res.data?.id;
    if (pedidoId) {
      navigate(`/payment/${pedidoId}`);
    } else {
      navigate('/');
    }
  };

  const handleBack = () => navigate(-1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Información de Envío</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Dirección de Envío</label>
              <Input value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} placeholder="Av. Principal 123, Lima, Perú" />
            </div>
            <div className="flex items-center gap-2">
              <input id="same" type="checkbox" checked={sameAddress} onChange={(e) => setSameAddress(e.target.checked)} />
              <label htmlFor="same" className="text-sm">Usar misma dirección para facturación</label>
            </div>
            <div>
              <label className="block text-sm mb-1">Dirección de Facturación</label>
              <Input value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} placeholder="Av. Principal 123, Lima, Perú" disabled={sameAddress} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Resumen del Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {summary.items.map((it: SummaryItem, idx: number) => (
                <div key={idx} className="py-2 flex justify-between text-sm">
                  <span>{it.name} x{it.qty}</span>
                  <span>${(it.qty * it.price).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Envío</span>
                <span>${summary.shipping.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${summary.total.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>← Volver</Button>
            <Button onClick={handleConfirm}> Confirmar Pedido →</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutPage;
