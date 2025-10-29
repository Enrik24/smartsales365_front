import { Product } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { authState } = useAuth();
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (authState.isAuthenticated) {
      addToCart(product, 1);
      // Aquí podrías mostrar una notificación
      alert(`${product.nombre} ha sido añadido al carrito.`);
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <Link to={`/product/${product.id}`}>
          <img src={product.imagenes[0]} alt={product.nombre} className="w-full h-48 object-cover rounded-t-lg" />
        </Link>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardTitle className="text-lg h-12">{product.nombre}</CardTitle>
        <p className="text-sm text-gray-500">{product.marca.nombre}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div>
          <p className="text-xl font-bold text-primary">${product.precioActual.toLocaleString('es-MX')}</p>
          {product.precioRegular > product.precioActual && (
            <p className="text-sm text-gray-500 line-through">${product.precioRegular.toLocaleString('es-MX')}</p>
          )}
        </div>
        <Button 
          size="sm" 
          onClick={handleAddToCart} 
          disabled={!authState.isAuthenticated}
          title={!authState.isAuthenticated ? "Debe iniciar sesión para agregar al carrito" : ""}
        >
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
