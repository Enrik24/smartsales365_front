import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import ProductCard from '@/components/product/ProductCard';
import { Product } from '@/types';
import { useEffect, useState } from 'react';
import { productService } from '@/api/services/productService';

const Home = () => {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await productService.getAll();
        if ('error' in res && res.error) throw new Error(res.error.message || 'No se pudieron cargar productos');
        const payload: any = res.data as any;
        const list: any[] = Array.isArray(payload)
          ? payload
          : (Array.isArray(payload?.results) ? payload.results : (Array.isArray(payload?.data) ? payload.data : []));

        const mapped: Product[] = list.map((p: any) => ({
          id: String(p.id),
          nombre: p.nombre,
          modelo: p.sku || '',
          descripcion: p.descripcion || '',
          // usamos un solo precio por ahora
          precioRegular: Number(p.precio),
          precioActual: Number(p.precio),
          stock: Number(p.stock_actual ?? 0),
          imagenes: [p.imagen_url || ''],
          categoria: { id: String(p.categoria ?? ''), nombre: p.categoria_nombre || '', descripcion: '', activo: true },
          marca: { id: String(p.marca ?? ''), nombre: p.marca_nombre || '', descripcion: '', activo: true },
          rating: Number(p.rating ?? 0),
        }));
        setItems(mapped);
      } catch {
        setItems([]);
      }
    })();
  }, []);

  return (
    <div>
      <section className="text-center bg-gray-100 dark:bg-gray-800 p-12 rounded-lg">
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white">Bienvenido a SmartSales365</h1>
        <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">La tecnología que tu hogar necesita, a un clic de distancia.</p>
        <Button asChild size="lg" className="mt-8">
          <Link to="/catalog">Explorar Catálogo</Link>
        </Button>
      </section>

      <section className="mt-12">
        <h2 className="text-3xl font-bold text-center mb-8">Productos Destacados</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
