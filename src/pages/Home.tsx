import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import ProductCard from '@/components/product/ProductCard';
import { Product } from '@/types';

const mockProducts: Product[] = [
    // Usando placehold.co para las imágenes
    { id: '1', nombre: 'Refrigerador Inteligente', modelo: 'RFG-2000', descripcion: '...', precioRegular: 1200, precioActual: 999, stock: 15, imagenes: ['https://img-wrapper.vercel.app/image?url=https://placehold.co/400x400/e2e8f0/334155?text=Refrigerador'], categoria: {id: 'c1', nombre: 'Refrigeradores', descripcion: '', activo: true}, marca: {id: 'm1', nombre: 'Samsung', descripcion: '', activo: true} },
    { id: '2', nombre: 'Lavadora Carga Frontal', modelo: 'LAV-850', descripcion: '...', precioRegular: 800, precioActual: 650, stock: 20, imagenes: ['https://img-wrapper.vercel.app/image?url=https://placehold.co/400x400/e2e8f0/334155?text=Lavadora'], categoria: {id: 'c2', nombre: 'Lavado', descripcion: '', activo: true}, marca: {id: 'm2', nombre: 'LG', descripcion: '', activo: true} },
    { id: '3', nombre: 'TV OLED 4K 65"', modelo: 'OLED65-C1', descripcion: '...', precioRegular: 2500, precioActual: 2199, stock: 8, imagenes: ['https://img-wrapper.vercel.app/image?url=https://placehold.co/400x400/e2e8f0/334155?text=TV+OLED'], categoria: {id: 'c3', nombre: 'Televisores', descripcion: '', activo: true}, marca: {id: 'm2', nombre: 'LG', descripcion: '', activo: true} },
    { id: '4', nombre: 'Horno de Microondas', modelo: 'MW-300', descripcion: '...', precioRegular: 150, precioActual: 120, stock: 30, imagenes: ['https://img-wrapper.vercel.app/image?url=https://placehold.co/400x400/e2e8f0/334155?text=Microondas'], categoria: {id: 'c4', nombre: 'Cocina', descripcion: '', activo: true}, marca: {id: 'm3', nombre: 'Panasonic', descripcion: '', activo: true} },
];

const Home = () => {
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
          {mockProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
