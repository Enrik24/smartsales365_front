import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ordersService } from '@/api/services/ordersService';
import { CheckCircle2, Clock, Package, Home, Download, AlertCircle } from 'lucide-react';

const OrderDetailPage = () => {
  const { pedidoId } = useParams<{ pedidoId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [tracking, setTracking] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Debug: Imprimir información sobre la URL actual
        console.log('URL actual:', location.pathname);
        console.log('Query params:', location.search);
        console.log('Parámetros de ruta:', { pedidoId });
        
        // Determinar cómo obtener el ID del pedido
        let effectivePedidoId: string | undefined = pedidoId;
        let orderData = null;
        
        // Si no hay pedidoId en los parámetros de ruta, verificar si hay un session_id en los query params
        if (!effectivePedidoId) {
          const searchParams = new URLSearchParams(location.search);
          const sessionId = searchParams.get('session_id');
          
          if (sessionId) {
            console.log('Session ID encontrado:', sessionId);
            
            try {
              // Usar la nueva ruta para obtener el pedido a partir del session_id
              const sessionRes = await ordersService.getOrderBySessionId(sessionId);
              
              if (sessionRes.error) {
                setError(`Error al obtener el pedido: ${sessionRes.error.message || sessionRes.error}`);
                return;
              }
              
              // Verificar que sessionRes.data exista antes de acceder a él
              if (!sessionRes.data) {
                setError('No se encontraron datos del pedido para el session_id proporcionado.');
                return;
              }
              
              // Obtener el ID del pedido de la respuesta y convertirlo a string
              const pedidoIdFromSession = sessionRes.data.id?.toString();
              
              if (!pedidoIdFromSession) {
                setError('El pedido obtenido no contiene un ID válido.');
                return;
              }
              
              effectivePedidoId = pedidoIdFromSession;
              orderData = sessionRes.data;
              
              console.log('ID del pedido obtenido desde session_id:', effectivePedidoId);
              
              // Establecer el pedido directamente desde la respuesta
              setOrder(orderData);
              
              // Actualizar la URL para reflejar el ID del pedido
              window.history.replaceState(null, '', `/profile/invoices/${effectivePedidoId}`);
            } catch (err) {
              console.error('Error al obtener el pedido desde session_id:', err);
              setError('No se pudo obtener el pedido a partir del session_id proporcionado.');
              return;
            }
          } else {
            // Verificar si hay un pedidoId en los query params como alternativa
            const qsPedidoId = searchParams.get('pedidoId') || '';
            if (qsPedidoId) {
              effectivePedidoId = qsPedidoId;
              console.log('ID del pedido desde query params:', effectivePedidoId);
            }
          }
        }
        
        if (!effectivePedidoId) {
          setError('No se proporcionó un ID de pedido válido');
          setLoading(false);
          return;
        }
        
        console.log(`Cargando pedido con ID: ${effectivePedidoId}`);
        
        // Si ya tenemos el pedido (del caso de session_id), solo necesitamos el seguimiento
        if (orderData && orderData.id?.toString() === effectivePedidoId) {
          const trackRes = await ordersService.getTracking(effectivePedidoId);
          
          if (trackRes.error) {
            console.warn('Error al cargar el seguimiento:', trackRes.error);
          } else {
            // Procesamiento de los datos de seguimiento
            const payload: any = trackRes.data as any;
            let trackingList: any[] = [];
            
            if (Array.isArray(payload)) {
              trackingList = payload;
            } else if (payload && typeof payload === 'object') {
              if (Array.isArray(payload.results)) {
                trackingList = payload.results;
              } else if (Array.isArray(payload.data)) {
                trackingList = payload.data;
              } else if (Array.isArray(payload.tracking)) {
                trackingList = payload.tracking;
              }
            }
            
            setTracking(trackingList);
            
            if (trackingList.length === 0) {
              console.warn('No se encontraron datos de seguimiento para este pedido');
            }
          }
        } else {
          // Si no tenemos el pedido, lo cargamos junto con el seguimiento
          const [orderRes, trackRes] = await Promise.all([
            ordersService.getById(effectivePedidoId),
            ordersService.getTracking(effectivePedidoId),
          ]);
          
          console.log('Respuesta del pedido:', orderRes);
          console.log('Respuesta del seguimiento:', trackRes);
          
          if (orderRes.error) {
            setError(`Error al cargar el pedido: ${orderRes.error.message || orderRes.error}`);
            return;
          }
          
          // Verificar que orderRes.data exista antes de asignarlo
          if (!orderRes.data) {
            setError('No se encontraron datos del pedido.');
            return;
          }
          
          setOrder(orderRes.data);
          
          // Procesamiento de los datos de seguimiento
          const payload: any = trackRes.data as any;
          let trackingList: any[] = [];
          
          if (Array.isArray(payload)) {
            trackingList = payload;
          } else if (payload && typeof payload === 'object') {
            if (Array.isArray(payload.results)) {
              trackingList = payload.results;
            } else if (Array.isArray(payload.data)) {
              trackingList = payload.data;
            } else if (Array.isArray(payload.tracking)) {
              trackingList = payload.tracking;
            }
          }
          
          setTracking(trackingList);
          
          if (trackingList.length === 0) {
            console.warn('No se encontraron datos de seguimiento para este pedido');
          }
        }
      } catch (err) {
        console.error('Error al cargar los datos del pedido:', err);
        setError('Ocurrió un error al cargar los datos del pedido. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    load();
  }, [pedidoId, location.search, location.pathname, navigate, order]);

  const summary = useMemo(() => {
    const o: any = order || {};
    const detalles: any[] = Array.isArray(o.detalles) ? o.detalles : (Array.isArray(o.items) ? o.items : []);
    const items = detalles.map((it: any) => {
      const prod = it.producto_detalle || it.product || it.producto || {};
      const name = prod.nombre || prod.name || `Producto ${it.producto_id ?? it.product_id ?? ''}`;
      const qty = Number(it.cantidad ?? it.quantity ?? 1);
      // Usar el subtotal directamente si está disponible, o calcularlo
      const subtotal = Number(it.subtotal ?? (qty * (prod.precio_original ?? prod.precio ?? it.precio_unitario_en_el_momento ?? it.precio ?? 0)));
      return { name, qty, subtotal };
    });
    const total = items.reduce((s, x) => s + x.subtotal, 0);
    return { items, total };
  }, [order]);

  const trackingSteps = useMemo(() => {
    const list: any[] = tracking || [];
    return list.map((st: any) => {
      const estado = st.estado_nuevo || st.estado || st.status || '';
      const fechaRaw = st.fecha_cambio || st.fecha || st.created_at || '';
      let fechaLabel = '';
      if (fechaRaw) {
        try {
          const d = new Date(fechaRaw);
          if (!isNaN(d.getTime())) {
            const day = d.getDate().toString().padStart(2, '0');
            const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
            const month = monthNames[d.getMonth()];
            const hours = d.getHours().toString().padStart(2, '0');
            const mins = d.getMinutes().toString().padStart(2, '0');
            fechaLabel = `${day} ${month} - ${hours}:${mins}`;
          }
        } catch {
          fechaLabel = String(fechaRaw);
        }
      }
      return { estado, fechaLabel };
    });
  }, [tracking]);

  const pedidoNumero = useMemo(() => {
    const o: any = order || {};
    return o.id?.toString() ?? o.numero_seguimiento ?? o.numeroSeguimiento ?? pedidoId ?? '—';
  }, [order, pedidoId]);

  const estadoPedido = useMemo(() => {
    const o: any = order || {};
    return o.estado_pedido || o.estado || 'Confirmado';
  }, [order]);

  const fechaPedidoLabel = useMemo(() => {
    const o: any = order || {};
    const raw = o.fecha_pedido || o.created_at || o.fecha || '';
    if (!raw) return '';
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return String(raw);
      const day = d.getDate().toString().padStart(2, '0');
      const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      const month = monthNames[d.getMonth()];
      const year = d.getFullYear();
      const hours = d.getHours().toString().padStart(2, '0');
      const mins = d.getMinutes().toString().padStart(2, '0');
      return `${day} ${month} ${year} - ${hours}:${mins}`;
    } catch {
      return String(raw);
    }
  }, [order]);

  const direccionEnvio = useMemo(() => {
    const o: any = order || {};
    return o.direccion_envio || o.direccionEnvio || o.shipping_address || '';
  }, [order]);

  // Función para obtener el ícono según el estado
  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('confirmado') || statusLower.includes('aprobado')) {
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    } else if (statusLower.includes('preparación') || statusLower.includes('procesando')) {
      return <Package className="h-4 w-4 text-blue-600" />;
    } else if (statusLower.includes('enviado') || statusLower.includes('camino')) {
      return <Package className="h-4 w-4 text-orange-600" />;
    } else if (statusLower.includes('entregado')) {
      return <Home className="h-4 w-4 text-green-600" />;
    } else {
      return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Package className="h-8 w-8 animate-pulse text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-500">
                  URL actual: <code className="bg-gray-100 px-2 py-1 rounded">{location.pathname}</code>
                </p>
                <p className="text-sm text-gray-500">
                  Query params: <code className="bg-gray-100 px-2 py-1 rounded">{location.search}</code>
                </p>
                <p className="text-sm text-gray-500">
                  ID desde params: <code className="bg-gray-100 px-2 py-1 rounded">{pedidoId || 'null'}</code>
                </p>
                <p className="text-sm text-gray-500">
                  ID desde query: <code className="bg-gray-100 px-2 py-1 rounded">{new URLSearchParams(location.search).get('pedidoId') || 'null'}</code>
                </p>
                <p className="text-sm text-gray-500">
                  Session ID: <code className="bg-gray-100 px-2 py-1 rounded">{new URLSearchParams(location.search).get('session_id') || 'null'}</code>
                </p>
              </div>
              <Button onClick={() => navigate('/profile/invoices')} className="mt-4">
                Volver al historial de pedidos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <span>Pedido #{pedidoNumero} - {estadoPedido}</span>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm flex items-center gap-2">
              <span>Estado:</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 px-3 py-1 text-xs font-medium">
                {getStatusIcon(estadoPedido)}
                <span>{estadoPedido}</span>
              </span>
            </p>
            {fechaPedidoLabel && (
              <p className="text-sm text-gray-600 mt-1">Fecha: {fechaPedidoLabel}</p>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-1">Dirección de envío:</h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">{direccionEnvio || 'Sin dirección registrada'}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Seguimiento
            </h3>
            <div className="border rounded-lg divide-y">
              {trackingSteps.length > 0 ? (
                trackingSteps.map((st, idx) => (
                  <div key={idx} className="px-4 py-2 flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      {getStatusIcon(st.estado)}
                      {st.estado || 'Estado actualizado'}
                    </span>
                    <span className="text-gray-500">{st.fechaLabel || 'Próximamente'}</span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">Aún no hay eventos de seguimiento para este pedido.</div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Productos</h3>
            <div className="border rounded-lg divide-y">
              {summary.items.length > 0 ? (
                summary.items.map((it, idx) => (
                  <div key={idx} className="px-4 py-2 flex justify-between text-sm">
                    <span>{it.name} x{it.qty}</span>
                    <span>${it.subtotal.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">No hay productos para mostrar.</div>
              )}
            </div>
            {summary.items.length > 0 && (
              <div className="mt-2 px-4 py-2 bg-gray-50 rounded flex justify-between font-semibold">
                <span>Total:</span>
                <span>${summary.total.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => navigate('/profile/invoices')}>
              <Clock className="h-4 w-4 mr-2" />
              Historial de pedidos
            </Button>
            <Button onClick={() => navigate(`/profile/invoices/${pedidoId}/receipt`)}>
              <Download className="h-4 w-4 mr-2" />
              Descargar comprobante
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetailPage;