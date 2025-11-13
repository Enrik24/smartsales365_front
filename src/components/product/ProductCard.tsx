import { Product } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { showToast } from '@/components/ui/toast/Toast';
import { favoriteService } from '@/api/services/productService';

interface ProductCardProps {
  product: Product;
  onUnfavorite?: (productId: string) => void;
  initialIsFav?: boolean;
  initialFavoriteId?: number | null;
}

const ProductCard = ({ product, onUnfavorite, initialIsFav, initialFavoriteId }: ProductCardProps) => {
  const { authState } = useAuth();
  const { addToCart } = useCart();
  const [isFav, setIsFav] = useState<boolean>(!!initialIsFav);
  const [favoriteId, setFavoriteId] = useState<number | null>(initialFavoriteId ?? null);
  const [favLoading, setFavLoading] = useState(false);

  const handleAddToCart = () => {
    if (authState.isAuthenticated) {
      addToCart(product, 1);
      showToast({ title: 'Añadido al carrito', description: `${product.nombre} ha sido añadido al carrito.`, type: 'success' });
    }
  };

  useEffect(() => {
    const fetchFavorite = async () => {
      if (!authState.isAuthenticated) {
        setIsFav(false);
        setFavoriteId(null);
        return;
      }
      const pid = product.numericId ?? (Number(product.id) || undefined);
      if (!pid) {
        setIsFav(false);
        setFavoriteId(null);
        return;
      }
      if (typeof initialIsFav !== 'undefined') {
        setIsFav(!!initialIsFav);
        setFavoriteId(initialFavoriteId ?? null);
        return;
      }
      try {
        const res = await favoriteService.checkFavorite(pid);
        if (res.data) {
          setIsFav(res.data.is_favorite);
          setFavoriteId(res.data.favorite_id ?? null);
        }
      } catch (e) {
        // ignore silently
      }
    };
    fetchFavorite();
  }, [authState.isAuthenticated, product.id, product.numericId, initialIsFav, initialFavoriteId]);

  const [favPulse, setFavPulse] = useState(false);

  const handleToggleFavorite = async () => {
    if (!authState.isAuthenticated || favLoading) return;
    setFavLoading(true);
    // Optimistic UI: alternar color y estado inmediatamente
    const prev = isFav;
    setIsFav(!isFav);
    // disparar pulso visual inmediato al click
    setFavPulse(true);
    const stopPulse = () => setTimeout(() => setFavPulse(false), 600);
    try {
      const pid = product.numericId ?? (Number(product.id) || undefined);
      if (!pid) throw new Error('Producto sin identificador numérico');
      if (!prev) {
        // estaba en false, ahora marcando como favorito
        const res = await favoriteService.create({ usuario: authState.user?.id_usuario, producto: pid } as any);
        if (res.data) {
          setFavoriteId((res.data as any).id ?? null);
          showToast({ title: 'Guardado en favoritos', description: `${product.nombre} se guardó correctamente.`, type: 'success' });
        } else {
          throw new Error('Sin respuesta');
        }
      } else {
        // estaba en true, ahora quitando
        let targetId = favoriteId;
        if (!targetId) {
          // fallback: buscar en la lista de favoritos
          const all = await favoriteService.getAll();
          const payload: any = all.data as any;
          const list: any[] = Array.isArray(payload)
            ? payload
            : (Array.isArray(payload?.results) ? payload.results : (Array.isArray(payload?.data) ? payload.data : []));
          const found = list.find((f) => {
            const raw = f?.product ?? f?.producto;
            return (typeof raw === 'number' ? Number(raw) : Number(raw?.id)) === pid;
          });
          targetId = found?.id ?? null;
        }
        if (targetId) {
          await favoriteService.delete(targetId);
          setFavoriteId(null);
          showToast({ title: 'Quitado de favoritos', description: `${product.nombre} se quitó de favoritos.`, type: 'info' });
          if (onUnfavorite) onUnfavorite(String(product.id));
        } else {
          throw new Error('No se encontró favorito');
        }
      }
    } catch (e) {
      // revertir en error
      setIsFav(prev);
      showToast({ title: 'Error', description: 'No se pudo actualizar favoritos.', type: 'error' });
    } finally {
      setFavLoading(false);
      stopPulse();
    }
  };

  return (
    <>
    <Card className="flex flex-col rounded-lg transition-all duration-300 border-2 border-transparent hover:-translate-y-2 hover:border-primary hover:shadow-lg">
      <CardHeader className="relative">
        <Link to={`/product/${product.id}`}>
          <img src={product.imagenes[0]} alt={product.nombre} className="w-full h-48 object-cover rounded-t-lg" />
        </Link>
        <button
          type="button"
          disabled={!authState.isAuthenticated || favLoading}
          onClick={handleToggleFavorite}
          title={!authState.isAuthenticated ? 'Inicia sesión para guardar en favoritos' : (isFav ? 'Quitar de favoritos' : 'Guardar en favoritos')}
          className={`absolute top-2 right-2 inline-flex h-9 w-9 items-center justify-center rounded-full shadow border bg-white/90 ${isFav ? 'border-red-500' : 'border-gray-200'} transition ${!authState.isAuthenticated ? 'opacity-60 cursor-not-allowed' : 'hover:bg-white'} ${favPulse ? 'animate-heartbeat' : ''}`}
        >
          <Heart className={`h-5 w-5 ${isFav ? 'text-red-500' : 'text-gray-700'}`} fill={isFav ? 'currentColor' : 'none'} />
        </button>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardTitle className="text-lg h-12">{product.nombre}</CardTitle>
        <p className="text-sm text-gray-500">{product.marca.nombre}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div>
          <p className="text-xl font-bold text-primary">${product.precioActual.toLocaleString('es-MX')}</p>
          {/** Comparación de precios desactivada temporalmente **/}
          {false && product.precioRegular > product.precioActual && (
            <p className="text-sm text-gray-500 line-through">${product.precioRegular.toLocaleString('es-MX')}</p>
          )}
        </div>
        <Button 
          size="sm" 
          onClick={handleAddToCart} 
          disabled={!authState.isAuthenticated}
          title={!authState.isAuthenticated ? "Debe iniciar sesión para agregar al carrito" : ""}
        >
          <ShoppingCart className="h-4 w-4" /> Agregar
        </Button>
      </CardFooter>
    </Card>
    <style>
      {`
        @keyframes heartbeat { 0%, 100% { transform: scale(1); } 25% { transform: scale(1.25); } 50% { transform: scale(1.1); } }
        .animate-heartbeat { animation: heartbeat 0.5s ease-in-out; }
      `}
    </style>
    </>
  );
};

export default ProductCard;
