import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { CartItem, Product } from '@/types';
import { cartService } from '@/api/services/cartService';
import { useAuth } from '@/hooks/useAuth';
import { showToast } from '@/components/ui/toast/Toast';
import { API_BASE_URL } from '@/config';

// Helper para construir URL absoluta de imagen
const makeImg = (u: any): string => {
  let s = String(u ?? '').trim();
  if (!s) return '';
  // Quita backticks y comillas al inicio/fin
  s = s.replace(/^[`'\"]+|[`'\"]+$/g, '').trim();
  const isAbs = /^https?:\/\//i.test(s);
  if (isAbs) return s;
  const base = String(API_BASE_URL || '').replace(/\/+$/, '');
  return `${base}${s.startsWith('/') ? '' : '/'}${s}`;
};

// ===================================================================================
// NUEVA FUNCIÓN DE AYUDA (HELPER)
// ===================================================================================
// Centraliza la lógica para convertir un item del carrito de la API a nuestro formato CartItem.
// Esto elimina la duplicación de código y hace que la lógica sea más fácil de mantener.
// Basado en tu JSON, los detalles del producto están en `producto_detalle`.
const mapApiItemToCartItem = async (it: any): Promise<CartItem | null> => {
  const productData = it.producto_detalle;
  if (!productData) {
    console.error('Item del carrito sin producto_detalle:', it);
    return null;
  }

  const quantity = Number(it.cantidad ?? 1);
  if (quantity <= 0) {
    return null;
  }

  const mappedProduct: Product = {
    id: String(productData.slug || productData.id),
    numericId: productData.id,
    nombre: String(productData.nombre),
    modelo: productData.sku || '',
    descripcion: productData.descripcion || '',
    precioRegular: Number(productData.precio_original || productData.precio || 0),
    precioActual: Number(productData.precio || 0),
    stock: Number(productData.stock_actual || 0),
    imagenes: [makeImg(productData.imagen_url)],
    categoria: { id: String(productData.categoria), nombre: productData.categoria_nombre || '', descripcion: '' },
    marca: { id: String(productData.marca), nombre: productData.marca_nombre || '', descripcion: '' },
    rating: 0, // Tu API no lo devuelve, lo dejamos en 0
  };

  return { product: mappedProduct, quantity };
};


interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  totalPrice: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { authState } = useAuth();

  // ===================================================================================
  // useEffect REFACTORIZADO
  // ===================================================================================
  // Ahora es mucho más simple y directo. Accedemos a `res.data.items` directamente
  // y usamos nuestra nueva función de ayuda para mapear los datos.
  useEffect(() => {
    const load = async () => {
      if (authState.loading) return;
      if (!authState.isAuthenticated) {
        setCartItems([]);
        return;
      }
      try {
        const res = await cartService.getCart();
        if (!res.data || !Array.isArray(res.data.items)) {
          setCartItems([]);
          return;
        }

        const items = await Promise.all(
          res.data.items.map(mapApiItemToCartItem)
        );

        setCartItems(items.filter(Boolean) as CartItem[]);

      } catch (error) {
        console.error('Error al cargar el carrito:', error);
        setCartItems([]);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.isAuthenticated, authState.loading]);

  // ===================================================================================
  // addToCart REFACTORIZADO
  // ===================================================================================
  // Se eliminó el código duplicado. Ahora, al agregar un producto, simplemente
  // volvemos a obtener el carrito completo del servidor para sincronizar el estado.
  const addToCart = async (product: Product, quantity: number) => {
    const pid = product.numericId ?? (Number(product.id) || undefined);

    if (authState.isAuthenticated && pid) {
      try {
        const res = await cartService.add(pid, quantity);
        if (res.error) {
          showToast({ title: 'No se pudo agregar', description: res.error.message || 'Intenta nuevamente.', type: 'error' });
          return;
        }

        // Sincronizar con el estado del servidor
        const refreshed = await cartService.getCart();
        if (refreshed.data && Array.isArray(refreshed.data.items)) {
          const items = await Promise.all(
            refreshed.data.items.map(mapApiItemToCartItem)
          );
          setCartItems(items.filter(Boolean) as CartItem[]);
        }
      } catch (error) {
        showToast({ title: 'Error de conexión', description: 'No se pudo contactar con el servidor.', type: 'error' });
      }
    } else {
      // Lógica para usuarios no autenticados (manejo local)
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.product.id === product.id);
        if (existingItem) {
          return prevItems.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prevItems, { product, quantity }];
      });
    }
  };

  // ===================================================================================
  // removeFromCart y updateQuantity SIMPLIFICADOS
  // ===================================================================================
  // La lógica para encontrar el `numericId` ahora es más clara y segura.
  const removeFromCart = async (productId: string) => {
    if (authState.isAuthenticated) {
      const itemToRemove = cartItems.find(item => item.product.id === productId);
      if (itemToRemove && itemToRemove.product.numericId) {
        await cartService.remove(itemToRemove.product.numericId);
      }
    }
    setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    if (authState.isAuthenticated) {
      const itemToUpdate = cartItems.find(item => item.product.id === productId);
      if (itemToUpdate && itemToUpdate.product.numericId) {
        await cartService.updateQuantity(itemToUpdate.product.numericId, quantity);
      }
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = async () => {
    if (authState.isAuthenticated) {
      await cartService.clear();
    }
    setCartItems([]);
  };

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.product.precioActual * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, itemCount, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};