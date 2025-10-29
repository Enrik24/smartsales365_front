import { useState, useMemo } from 'react';
import { mockProducts, mockCategories, mockBrands } from '@/lib/mock-data';
import ProductCard from '@/components/product/ProductCard';
import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui/Label';
import { Slider } from '@/components/ui/Slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

const Catalog = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([5000]);
  const [sortBy, setSortBy] = useState('relevance');

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
    let products = mockProducts.filter(p => p.precioActual <= priceRange[0]);

    if (selectedCategories.length > 0) {
      products = products.filter(p => selectedCategories.includes(p.categoria.id));
    }

    if (selectedBrands.length > 0) {
      products = products.filter(p => selectedBrands.includes(p.marca.id));
    }

    switch (sortBy) {
      case 'price-asc':
        products.sort((a, b) => a.precioActual - b.precioActual);
        break;
      case 'price-desc':
        products.sort((a, b) => b.precioActual - a.precioActual);
        break;
      case 'rating-desc':
         products.sort((a, b) => b.rating - a.rating);
        break;
      default: // relevance
        break;
    }

    return products;
  }, [selectedCategories, selectedBrands, priceRange, sortBy]);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Filters Sidebar */}
      <aside className="w-full md:w-1/4 lg:w-1/5">
        <h2 className="text-2xl font-bold mb-4">Filtros</h2>
        
        {/* Category Filter */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Categorías</h3>
          <div className="space-y-2">
            {mockCategories.filter(c => c.activo).map(category => (
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
            {mockBrands.filter(b => b.activo).map(brand => (
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
            defaultValue={[5000]}
            max={5000}
            step={100}
            onValueChange={setPriceRange}
          />
          <p className="text-sm text-gray-600 mt-2">Hasta ${priceRange[0].toLocaleString()}</p>
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
