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
      if (typeof initialIsFav !== 'undefined') {
        setIsFav(!!initialIsFav);
        setFavoriteId(initialFavoriteId ?? null);
        return;
      }
      try {
        const res = await favoriteService.checkFavorite(Number(product.id));
        if (res.data) {
          setIsFav(res.data.is_favorite);
          setFavoriteId(res.data.favorite_id ?? null);
        }
      } catch (e) {
        // ignore silently
      }
    };
    fetchFavorite();
  }, [authState.isAuthenticated, product.id, initialIsFav, initialFavoriteId]);

  const handleToggleFavorite = async () => {
    if (!authState.isAuthenticated || favLoading) return;
    setFavLoading(true);
    try {
      if (!isFav) {
        const res = await favoriteService.create({ usuario: authState.user?.id_usuario, producto: Number(product.id) } as any);
        if (res.data) {
          setIsFav(true);
          setFavoriteId((res.data as any).id ?? null);
          showToast({ title: 'Guardado en favoritos', description: `${product.nombre} se guardó correctamente.`, type: 'success' });
        }
      } else {
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
            return (typeof raw === 'number' ? Number(raw) : Number(raw?.id)) === Number(product.id);
          });
          targetId = found?.id ?? null;
        }
        if (targetId) {
          await favoriteService.delete(targetId);
          setIsFav(false);
          setFavoriteId(null);
          showToast({ title: 'Quitado de favoritos', description: `${product.nombre} se quitó de favoritos.`, type: 'info' });
          if (onUnfavorite) onUnfavorite(String(product.id));
        }
      }
    } catch (e) {
      showToast({ title: 'Error', description: 'No se pudo actualizar favoritos.', type: 'error' });
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="relative">
        <Link to={`/product/${product.id}`}>
          <img src={product.imagenes[0]} alt={product.nombre} className="w-full h-48 object-cover rounded-t-lg" />
        </Link>
        <button
          type="button"
          disabled={!authState.isAuthenticated || favLoading}
          onClick={handleToggleFavorite}
          title={!authState.isAuthenticated ? 'Inicia sesión para guardar en favoritos' : (isFav ? 'Quitar de favoritos' : 'Guardar en favoritos')}
          className={`absolute top-2 right-2 inline-flex h-9 w-9 items-center justify-center rounded-full shadow bg-white/90 backdrop-blur transition ${!authState.isAuthenticated ? 'opacity-60 cursor-not-allowed' : 'hover:bg-white'}`}
        >
          <Heart className={`h-5 w-5 ${isFav ? 'text-red-500 fill-red-500' : 'text-gray-700'}`} />
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
  );
};

export default ProductCard;
