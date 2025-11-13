import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { productService } from '@/api/services/productService';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';

type BackendProduct = {
  id: number | string;
  sku: string;
  nombre: string;
  slug?: string;
  descripcion?: string | null;
  precio?: string | number; // no mostrar
  precio_original?: string | number; // mostrar
  categoria?: number | { id: number; nombre?: string } | null;
  marca?: number | { id: number; nombre?: string } | null;
  categoria_nombre?: string;
  marca_nombre?: string;
  imagen_url?: string | null;
  ficha_tecnica_url?: string | null;
  modelo?: string | null;
  voltaje?: string | null;
  garantia_meses?: number | null;
  eficiencia_energetica?: string | null;
  color?: string | null;
  peso?: string | number | null;
  alto?: string | number | null;
  ancho?: string | number | null;
  profundidad?: string | number | null;
};

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [p, setP] = useState<BackendProduct | null>(null);
  const [qty, setQty] = useState<number>(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await productService.getById(id);
        if ('error' in res && res.error) {
          // Fallback: si el backend busca por slug y no por id
          if (res.status === 404) {
            const list = await productService.getAll();
            if (!('error' in list)) {
              const payload: any = list.data as any;
              const arr: any[] = Array.isArray(payload)
                ? payload
                : (Array.isArray(payload?.results) ? payload.results : (Array.isArray(payload?.data) ? payload.data : []));
              const found: any = arr.find((x: any) => String(x.id) === String(id) || String(x.slug) === String(id));
              if (found) {
                if (found.slug) {
                  const bySlug = await productService.getById(found.slug);
                  if (!('error' in bySlug) && bySlug.data) {
                    setP(bySlug.data as any);
                    return;
                  }
                }
                setP(found as BackendProduct);
                return;
              }
            }
            throw new Error('Producto no encontrado');
          }
          throw new Error(res.error.message || 'No se pudo cargar el producto');
        }
        const payload: any = res.data as any;
        setP(payload as BackendProduct);
      } catch (e: any) {
        setError(e.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const fmt = (v?: string | number | null, suffix = '') => {
    if (v === null || v === undefined || v === '') return '-';
    return `${v}${suffix}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <p>Cargando...</p>
      </div>
    );
  }

  if (error || !p) {
    return (
      <div className="container mx-auto px-4 py-10">
        <p className="text-red-600">{error || 'Producto no encontrado'}</p>
      </div>
    );
  }

  const categoriaNombre = p.categoria_nombre || (typeof p.categoria === 'object' ? (p.categoria?.nombre || '') : '');
  const marcaNombre = p.marca_nombre || (typeof p.marca === 'object' ? (p.marca?.nombre || '') : '');
  const precioMostrar = p.precio_original != null ? Number(p.precio_original) : undefined;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:underline">Inicio</Link>
        <span className="mx-2">/</span>
        <Link to="/catalog" className="hover:underline">Electrodomésticos</Link>
        {categoriaNombre && (<>
          <span className="mx-2">/</span>
          <span>{categoriaNombre}</span>
        </>)}
        <span className="mx-2">/</span>
        <span className="text-gray-700">{p.nombre}</span>
      </nav>

      {/* Main card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Image */}
          <div>
            {p.imagen_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.imagen_url} alt={p.nombre} className="w-full h-auto rounded border" />
            ) : (
              <div className="w-full h-64 rounded bg-muted" />
            )}
          </div>

          {/* Info */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{p.nombre}</h1>
            {precioMostrar !== undefined && (
              <p className="text-3xl font-semibold text-primary mb-4">${precioMostrar.toLocaleString('es-MX')}</p>
            )}
            {p.descripcion && (
              <p className="text-gray-700 mb-6 leading-relaxed">{p.descripcion}</p>
            )}

            <h2 className="text-lg font-semibold mb-2">Características técnicas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 mb-6">
              <div className="text-sm"><span className="font-medium text-gray-600">SKU:</span> {fmt(p.sku)}</div>
              <div className="text-sm"><span className="font-medium text-gray-600">Modelo:</span> {fmt(p.modelo)}</div>
              <div className="text-sm"><span className="font-medium text-gray-600">Voltaje:</span> {fmt(p.voltaje)}</div>
              <div className="text-sm"><span className="font-medium text-gray-600">Eficiencia:</span> {fmt(p.eficiencia_energetica)}</div>
              <div className="text-sm"><span className="font-medium text-gray-600">Peso:</span> {fmt(p.peso, ' kg')}</div>
              <div className="text-sm"><span className="font-medium text-gray-600">Dimensiones:</span> {`${fmt(p.alto)} x ${fmt(p.ancho)} x ${fmt(p.profundidad)} cm`}</div>
            </div>

            {/* Quantity + Actions */}
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center border rounded overflow-hidden">
                <button type="button" className="px-3 py-1 text-lg" onClick={() => setQty(q => Math.max(1, q - 1))}>-</button>
                <span className="px-4 select-none">{qty}</span>
                <button type="button" className="px-3 py-1 text-lg" onClick={() => setQty(q => q + 1)}>+</button>
              </div>
              <Button onClick={() => addToCart({
                id: String(p.slug || p.id),
                nombre: p.nombre,
                modelo: p.sku || '',
                descripcion: p.descripcion || '',
                precioRegular: Number(precioMostrar || 0),
                precioActual: Number(precioMostrar || 0),
                stock: 0,
                imagenes: [p.imagen_url || ''],
                categoria: { id: String((p as any).categoria ?? ''), nombre: categoriaNombre || '', descripcion: '' } as any,
                marca: { id: String((p as any).marca ?? ''), nombre: marcaNombre || '', descripcion: '' } as any,
                rating: 0,
              }, qty)}>Agregar al carrito</Button>
              <Button variant="outline" onClick={() => navigate(-1)}>Volver</Button>
            </div>

            {p.ficha_tecnica_url && (
              <div className="mt-4">
                <a href={p.ficha_tecnica_url} target="_blank" rel="noreferrer" className="text-primary underline">
                  Ver ficha técnica (PDF)
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Specs section */}
      <div className="mt-8">
        <div className="border-b mb-4">
          <button className="px-4 py-2 text-primary border-b-2 border-primary -mb-[2px]">Especificaciones</button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Especificaciones técnicas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3">
            <div className="text-sm text-gray-600">SKU</div>
            <div className="text-sm">{fmt(p.sku)}</div>
            <div className="text-sm text-gray-600">Modelo</div>
            <div className="text-sm">{fmt(p.modelo)}</div>
            <div className="text-sm text-gray-600">Voltaje</div>
            <div className="text-sm">{fmt(p.voltaje)}</div>
            <div className="text-sm text-gray-600">Eficiencia energética</div>
            <div className="text-sm">{fmt(p.eficiencia_energetica)}</div>
            <div className="text-sm text-gray-600">Peso</div>
            <div className="text-sm">{fmt(p.peso, ' kg')}</div>
            <div className="text-sm text-gray-600">Dimensiones (Alto x Ancho x Profundo)</div>
            <div className="text-sm">{`${fmt(p.alto, ' cm')} x ${fmt(p.ancho, ' cm')} x ${fmt(p.profundidad, ' cm')}`}</div>
            <div className="text-sm text-gray-600">Color</div>
            <div className="text-sm">{fmt(p.color)}</div>
            <div className="text-sm text-gray-600">Garantía</div>
            <div className="text-sm">{p.garantia_meses ? `${p.garantia_meses / 12 >= 1 ? (p.garantia_meses / 12) + ' años' : p.garantia_meses + ' meses'}` : '-'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
