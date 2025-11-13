import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import ProductCard from '@/components/product/ProductCard';
import { favoriteService } from '@/api/services/productService';
import { FavoriteProduct } from '@/api/services/productService';
import { useAuth } from '@/hooks/useAuth';
import { Product } from '@/types';
import { productService } from '@/api/services/productService';

const SavedItemsPage = () => {
  const { authState } = useAuth();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Product[]>([]);
  const [favoritesMap, setFavoritesMap] = useState<Record<string, number>>({});

  const loadFavorites = async () => {
    if (!authState.isAuthenticated) return;
    setLoading(true);
    try {
      const res = await favoriteService.getAll();
      const payload: any = res.data as any;
      const list: FavoriteProduct[] = Array.isArray(payload)
        ? payload
        : (Array.isArray(payload?.results) ? payload.results : (Array.isArray(payload?.data) ? payload.data : []));

      // construir mapa de favoritos producto->favoriteId
      const map: Record<string, number> = {};
      for (const f of list) {
        const raw = (f as any)?.product ?? (f as any)?.producto;
        const favId = (f as any)?.id;
        const pid = typeof raw === 'number' ? raw : raw?.id;
        if (pid && favId) map[String(pid)] = favId;
      }
      setFavoritesMap(map);

      const detailed: Product[] = (await Promise.all(list.map(async (f) => {
        const raw = (f as any)?.product ?? (f as any)?.producto;
        let p: any = raw;
        if (!raw) return null;
        const fetchByIdWithFallback = async (idOrSlug: string | number) => {
          const r = await productService.getById(idOrSlug);
          if (!('error' in r) || !r.error) return r.data as any;
          // fallback: si falla por id, intenta obtener desde listado
          if (r.status === 404) {
            const all = await productService.getAll();
            const payload: any = all.data as any;
            const arr: any[] = Array.isArray(payload)
              ? payload
              : (Array.isArray(payload?.results) ? payload.results : (Array.isArray(payload?.data) ? payload.data : []));
            const found = arr.find((x: any) => String(x.id) === String(idOrSlug) || String(x.slug) === String(idOrSlug));
            return found || null;
          }
          return null;
        };

        if (typeof raw === 'number') {
          const data = await fetchByIdWithFallback(raw);
          if (!data) return null;
          p = data;
        } else if (raw && typeof raw === 'object' && 'id' in raw && Object.keys(raw).length <= 3) {
          const data = await fetchByIdWithFallback((raw as any).id);
          if (!data) return null;
          p = data;
        }
        return {
          id: String(p.slug || p.id),
          numericId: typeof p.id === 'number' ? p.id : (Number(p.id) || undefined),
          nombre: p.nombre,
          modelo: p.sku || '',
          descripcion: p.descripcion || '',
          precioRegular: Number(p.precio_original ?? p.precio),
          precioActual: Number(p.precio_original ?? p.precio),
          stock: Number(p.stock_actual ?? 0),
          imagenes: [p.imagen_url || ''],
          categoria: { id: String(p.categoria ?? ''), nombre: p.categoria_nombre || '', descripcion: '', activo: true } as any,
          marca: { id: String(p.marca ?? ''), nombre: p.marca_nombre || '', descripcion: '', activo: true } as any,
          rating: Number(p.rating ?? 0),
        } as Product;
      }))).filter(Boolean) as Product[];
      setItems(detailed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.isAuthenticated]);

  if (!authState.isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Artículos Guardados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <p>Inicia sesión para ver tus favoritos.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Artículos Guardados</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-12 text-gray-500">Cargando...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Aún no tienes artículos guardados.</p>
            <p className="text-sm">Explora el catálogo y guarda tus productos favoritos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                initialIsFav={Boolean(favoritesMap[String(product.numericId ?? product.id)])}
                initialFavoriteId={favoritesMap[String(product.numericId ?? product.id)] ?? null}
                onUnfavorite={(productId) => {
                  setItems((prev) => prev.filter((p) => p.id !== productId));
                  setFavoritesMap((prev) => {
                    const { [productId]: _, ...rest } = prev;
                    return rest;
                  });
                }}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedItemsPage;
