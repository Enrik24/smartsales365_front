import { useEffect, useMemo, useState } from 'react';
import { productService } from '@/api/services/productService';
import { categoryService } from '@/api/services/categoryService';
import { brandService } from '@/api/services/brandService';
import ProductCard from '@/components/product/ProductCard';
import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui/Label';
import { Slider } from '@/components/ui/Slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Product } from '@/types';

const Catalog = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([15000]);
  const [sortBy, setSortBy] = useState('relevance');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; nombre: string }[]>([]);
  const [brands, setBrands] = useState<{ id: string; nombre: string }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        // Load products
        const res = await productService.getAll();
        if ('error' in res && res.error) throw new Error(res.error.message || 'No se pudieron cargar productos');
        const payload: any = res.data as any;
        const list: any[] = Array.isArray(payload)
          ? payload
          : (Array.isArray(payload?.results) ? payload.results : (Array.isArray(payload?.data) ? payload.data : []));
        const mapped: Product[] = list.map((p: any) => ({
          id: String(p.slug || p.id),
          numericId: typeof p.id === 'number' ? p.id : (Number(p.id) || undefined),
          nombre: p.nombre,
          modelo: p.sku || '',
          descripcion: p.descripcion || '',
          precioRegular: Number(p.precio_original ?? p.precio ?? 0),
          precioActual: Number(p.precio_original ?? p.precio ?? 0),
          stock: Number(p.stock_actual ?? 0),
          imagenes: [p.imagen_url || ''],
          categoria: { id: String(p.categoria ?? ''), nombre: p.categoria_nombre || '', descripcion: '' },
          marca: { id: String(p.marca ?? ''), nombre: p.marca_nombre || '', descripcion: '' },
          rating: Number(p.rating ?? 0),
        }));
        setProducts(mapped);
        const maxPrice = Math.max(0, ...mapped.map(p => (isFinite(p.precioActual) ? p.precioActual : 0)));
        setPriceRange([maxPrice || 0]);

        // Load categories and brands
        const [cats, brs] = await Promise.all([categoryService.list(), brandService.list()]);
        if (cats.data) setCategories((cats.data as any[]).map((c: any) => ({ id: String(c.id), nombre: c.nombre || c.nombre_categoria })));

        // Build fallback brands from products
        const derivedMap = new Map<string, { id: string; nombre: string }>();
        for (const p of mapped) {
          if (p.marca?.id && p.marca?.nombre && !derivedMap.has(p.marca.id)) {
            derivedMap.set(p.marca.id, { id: p.marca.id, nombre: p.marca.nombre });
          }
        }
        const derived = Array.from(derivedMap.values());

        // Merge API brands (if any) with derived, keeping API names when present
        const apiBrands = (brs.data as any[] | undefined)?.map((b: any) => ({ id: String(b.id), nombre: b.nombre || b.nombre_marca })) || [];
        const mergedMap = new Map<string, { id: string; nombre: string }>();
        for (const b of [...apiBrands, ...derived]) {
          if (!mergedMap.has(b.id)) mergedMap.set(b.id, b);
        }
        setBrands(Array.from(mergedMap.values()));
      } catch {
        setProducts([]);
        setCategories([]);
        setBrands([]);
      }
    })();
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleBrandChange = (brandId: string) => {
    setSelectedBrands(prev =>
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  const filteredAndSortedProducts = useMemo(() => {
    let list = products.filter(p => p.precioActual <= priceRange[0]);

    if (selectedCategories.length > 0) {
      list = list.filter(p => selectedCategories.includes(p.categoria.id));
    }

    if (selectedBrands.length > 0) {
      list = list.filter(p => selectedBrands.includes(p.marca.id));
    }

    switch (sortBy) {
      case 'price-asc':
        list.sort((a, b) => a.precioActual - b.precioActual);
        break;
      case 'price-desc':
        list.sort((a, b) => b.precioActual - a.precioActual);
        break;
      case 'rating-desc':
         list.sort((a, b) => b.rating - a.rating);
        break;
      default: // relevance
        break;
    }

    return list;
  }, [products, selectedCategories, selectedBrands, priceRange, sortBy]);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Filters Sidebar */}
      <aside className="w-full md:w-1/4 lg:w-1/5">
        <h2 className="text-2xl font-bold mb-4">Filtros</h2>
        
        {/* Category Filter */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Categorías</h3>
          <div className="space-y-2">
            {categories.map(category => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox id={`cat-${category.id}`} onCheckedChange={() => handleCategoryChange(category.id)} />
                <Label htmlFor={`cat-${category.id}`} className="font-normal">{category.nombre}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Brand Filter */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Marcas</h3>
          <div className="space-y-2">
            {brands.map(brand => (
              <div key={brand.id} className="flex items-center space-x-2">
                <Checkbox id={`brand-${brand.id}`} onCheckedChange={() => handleBrandChange(brand.id)} />
                <Label htmlFor={`brand-${brand.id}`} className="font-normal">{brand.nombre}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Filter */}
        <div>
          <h3 className="font-semibold mb-2">Precio</h3>
          <Slider
            value={priceRange}
            max={15000}
            step={100}
            onValueChange={setPriceRange}
          />
          <p className="text-sm text-gray-600 mt-2">Hasta Bs. {priceRange[0].toLocaleString()}</p>
        </div>
      </aside>

      {/* Products Grid */}
      <main className="w-full md:w-3/4 lg:w-4/5">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Catálogo</h1>
          <Select onValueChange={setSortBy} defaultValue="relevance">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevancia</SelectItem>
              <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
              <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
              <SelectItem value="rating-desc">Mejor Calificados</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">No se encontraron productos que coincidan con tu búsqueda.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Catalog;
