import { useCart } from '@/hooks/useCart';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Trash2, ShoppingCart } from 'lucide-react';
 

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, itemCount, totalPrice, shippingCost } = useCart();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    navigate('/checkout');
  };

  if (itemCount === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingCart className="mx-auto h-24 w-24 text-gray-300" />
        <h2 className="mt-6 text-2xl font-bold">Tu carrito está vacío</h2>
        <p className="mt-2 text-gray-500">Parece que aún no has añadido nada. ¡Explora nuestros productos!</p>
        <Button asChild className="mt-6">
          <Link to="/catalog">Ir al Catálogo</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="lg:w-2/3">
        <h1 className="text-3xl font-bold mb-6">Tu Carrito ({itemCount} {itemCount > 1 ? 'artículos' : 'artículo'})</h1>
        <div className="space-y-4">
          {cartItems.map(item => (
            <Card key={item.product.id} className="flex items-center p-4">
              <img src={item.product.imagenes?.[0] || '/favicon.svg'} alt={item.product.nombre || 'Producto'} className="w-24 h-24 object-cover rounded-md" />
              <div className="flex-grow ml-4">
                <h3 className="font-semibold">{item.product.nombre}</h3>
                <p className="text-sm text-gray-500">${item.product.precioActual.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-md">
                    <Button variant="ghost" size="sm" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>-</Button>
                    <Input 
                        type="number" 
                        className="w-12 h-8 text-center border-l border-r rounded-none" 
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                    />
                    <Button variant="ghost" size="sm" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>+</Button>
                </div>
                <p className="font-semibold w-24 text-right">${(item.product.precioActual * item.quantity).toLocaleString()}</p>
                <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.product.id)}>
                  <Trash2 className="h-5 w-5 text-red-500" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <aside className="lg:w-1/3">
        <Card>
          <CardHeader>
            <CardTitle>Resumen de la Compra</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Envío</span>
              <span>{shippingCost > 0 ? `$${shippingCost.toLocaleString()}` : 'Gratis'}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Impuestos (IVA)</span>
              <span>13%</span>
            </div>
            <hr />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${((totalPrice + shippingCost) * 1.13).toLocaleString()}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" size="lg" onClick={handleCheckout}>
              Procesar pago
            </Button>
          </CardFooter>
        </Card>
      </aside>
    </div>
  );
};

export default CartPage;
