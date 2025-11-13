import { useEffect, useMemo, useState } from 'react';
import AdminPageHeader from '@/components/admin/shared/AdminPageHeader';
import ProductsTable, { ProductRow } from '@/components/admin/products/ProductsTable';
import ProductForm, { ProductFormData, Option } from '@/components/admin/products/ProductForm';
import DeleteConfirmationDialog from '@/components/admin/shared/DeleteConfirmationDialog';
import { productService } from '@/api/services/productService';
import { inventoryService } from '@/api/services/inventoryService';
import { categoryService as catSvc } from '@/api/services/categoryService';
import { brandService as brSvc } from '@/api/services/brandService';
import { showToast } from '@/components/ui/toast/Toast';
import { logExitoso, logFallido } from '@/lib/bitacora';

const AdminProducts = () => {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<ProductRow | null>(null);
  const [categorias, setCategorias] = useState<Option[]>([]);
  const [marcas, setMarcas] = useState<Option[]>([]);

  const catMap = useMemo(() => Object.fromEntries(categorias.map(c => [String(c.id), c.nombre])), [categorias]);
  const brandMap = useMemo(() => Object.fromEntries(marcas.map(m => [String(m.id), m.nombre])), [marcas]);

  const openForm = (p: ProductRow | null = null) => {
    setSelected(p);
    setIsFormOpen(true);
  };

  const openDelete = (p: ProductRow) => {
    setSelected(p);
    setIsDeleteOpen(true);
  };

  const fetchLookups = async () => {
    try {
      const [cats, brands] = await Promise.all([catSvc.list(), brSvc.list()]);
      if (cats.data) setCategorias(cats.data.map((c: any) => ({ id: c.id, nombre: c.nombre || c.nombre_categoria })));
      if (brands.data) setMarcas(brands.data.map((b: any) => ({ id: b.id, nombre: b.nombre || b.nombre_marca })));
    } catch (e) {
      // no-op
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await productService.getAll();
      if ('error' in res && res.error) throw new Error(res.error.message || 'Error al listar productos');
      const payload: any = res.data as any;
      const list: any[] = Array.isArray(payload)
        ? payload
        : (Array.isArray(payload?.results) ? payload.results : (Array.isArray(payload?.data) ? payload.data : []));
      const rows: ProductRow[] = list.map((p: any) => {
        const categoriaId = p?.categoria && typeof p.categoria === 'object' ? p.categoria.id : p.categoria;
        const marcaId = p?.marca && typeof p.marca === 'object' ? p.marca.id : p.marca;
        const categoriaNombre = p?.categoria_nombre
          ? p.categoria_nombre
          : (p?.categoria && typeof p.categoria === 'object'
              ? (p.categoria.nombre || p.categoria.nombre_categoria)
              : (categoriaId != null ? catMap[String(categoriaId)] : undefined));
        const marcaNombre = p?.marca_nombre
          ? p.marca_nombre
          : (p?.marca && typeof p.marca === 'object'
              ? (p.marca.nombre || p.marca.nombre_marca)
              : (marcaId != null ? brandMap[String(marcaId)] : undefined));

        return {
          id: String(p.id),
          slug: p.slug,
          sku: p.sku,
          nombre: p.nombre,
          precio: Number(p.precio),
          imagen_url: p.imagen_url || null,
          descripcion: p.descripcion || '',
          categoria: categoriaId != null ? Number(categoriaId) : null,
          categoriaNombre,
          marca: marcaId != null ? Number(marcaId) : null,
          marcaNombre,
          stock_inicial: p.stock_actual != null ? Number(p.stock_actual) : undefined,
          stock_minimo: p.stock_minimo != null ? Number(p.stock_minimo) : undefined,
          estado: (p.estado as 'activo' | 'inactivo' | 'agotado'),
          // nuevos atributos
          precio_original: p.precio_original,
          modelo: p.modelo,
          voltaje: p.voltaje,
          garantia_meses: p.garantia_meses != null ? Number(p.garantia_meses) : undefined,
          eficiencia_energetica: p.eficiencia_energetica,
          color: p.color,
          peso: p.peso,
          alto: p.alto,
          ancho: p.ancho,
          profundidad: p.profundidad,
          costo: p.costo,
          envio_gratis: p.envio_gratis,
          destacado: p.destacado,
        } as ProductRow;
      });
      setProducts(rows);
    } catch (e: any) {
      showToast({ title: 'Error', description: e.message || 'No se pudieron cargar los productos', type: 'error' });
    }
  };

  useEffect(() => {
    (async () => {
      await fetchLookups();
      await fetchProducts();
    })();
  }, []);

  useEffect(() => {
    // rehydrate names when lookups change
    setProducts(prev => prev.map(p => ({
      ...p,
      categoriaNombre: (p as any).categoria != null ? catMap[String((p as any).categoria)] : p.categoriaNombre,
      marcaNombre: (p as any).marca != null ? brandMap[String((p as any).marca)] : p.marcaNombre,
    })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorias, marcas]);

  const handleSubmit = async (data: ProductFormData) => {
    try {
      if (selected) {
        const res = await productService.updateMultipart(selected.slug ?? selected.id, {
          sku: data.sku,
          nombre: data.nombre,
          descripcion: data.descripcion,
          precio: data.precio,
          precio_original: data.precio_original,
          categoria: data.categoria,
          marca: data.marca,
          estado: data.estado,
          modelo: data.modelo,
          voltaje: data.voltaje,
          garantia_meses: data.garantia_meses,
          eficiencia_energetica: data.eficiencia_energetica,
          color: data.color,
          peso: data.peso,
          alto: data.alto,
          ancho: data.ancho,
          profundidad: data.profundidad,
          costo: data.costo,
          envio_gratis: data.envio_gratis,
          destacado: data.destacado,
          imagen_file: data.imagen_file,
          ficha_tecnica_file: data.ficha_tecnica_file,
        });
        if ('error' in res && res.error) throw new Error(res.error.message || 'Error al actualizar producto');
        // Update inventory fields (only stock_minimo for edit; stock_actual shown as stock_inicial is disabled)
        if (data.stock_minimo != null) {
          const invRes = await inventoryService.updateMinStock(Number(selected.id), data.stock_minimo);
          if ('error' in invRes && invRes.error) throw new Error(invRes.error.message || 'Error al actualizar inventario');
        }
        await fetchProducts();
        showToast({ title: '¡Éxito!', description: 'Producto actualizado', type: 'success' });
        void logExitoso('PRODUCTO_EDITADO');
      } else {
        const res = await productService.createMultipart({
          sku: data.sku,
          nombre: data.nombre,
          descripcion: data.descripcion,
          precio: data.precio,
          precio_original: data.precio_original,
          categoria: data.categoria,
          marca: data.marca,
          estado: data.estado,
          stock_inicial: data.stock_inicial,
          stock_minimo: data.stock_minimo,
          modelo: data.modelo,
          voltaje: data.voltaje,
          garantia_meses: data.garantia_meses,
          eficiencia_energetica: data.eficiencia_energetica,
          color: data.color,
          peso: data.peso,
          alto: data.alto,
          ancho: data.ancho,
          profundidad: data.profundidad,
          costo: data.costo,
          envio_gratis: data.envio_gratis,
          destacado: data.destacado,
          imagen_file: data.imagen_file,
          ficha_tecnica_file: data.ficha_tecnica_file,
        });
        if ('error' in res && res.error) throw new Error(res.error.message || 'Error al crear producto');
        await fetchProducts();
        showToast({ title: '¡Éxito!', description: 'Producto creado', type: 'success' });
        void logExitoso('PRODUCTO_CREADO');
      }
      setIsFormOpen(false);
      setSelected(null);
    } catch (e: any) {
      showToast({ title: 'Error', description: e.message || 'Operación fallida', type: 'error' });
      void logFallido(selected ? 'PRODUCTO_EDICION_FALLIDA' : 'PRODUCTO_CREACION_FALLIDA');
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      const res = await productService.delete(selected.slug ?? selected.id);
      if ('error' in res && res.error) throw new Error(res.error.message || 'Error al eliminar producto');
      setProducts(prev => prev.filter(p => p.id !== selected.id));
      showToast({ title: '¡Eliminado!', description: 'Producto eliminado', type: 'success' });
      void logExitoso('PRODUCTO_ELIMINADO');
    } catch (e: any) {
      showToast({ title: 'Error', description: e.message || 'Error al eliminar', type: 'error' });
      void logFallido('PRODUCTO_ELIMINACION_FALLIDA');
    } finally {
      setIsDeleteOpen(false);
      setSelected(null);
    }
  };

  // Defaults for edit
  const defaultValues = selected
    ? {
        sku: selected.sku,
        nombre: selected.nombre,
        descripcion: selected.descripcion,
        precio: selected.precio,
        precio_original: selected.precio_original,
        categoria: selected.categoria ?? null,
        marca: selected.marca ?? null,
        stock_inicial: selected.stock_inicial,
        stock_minimo: selected.stock_minimo,
        estado: selected.estado,
        modelo: selected.modelo,
        voltaje: selected.voltaje,
        garantia_meses: selected.garantia_meses,
        eficiencia_energetica: selected.eficiencia_energetica,
        color: selected.color,
        peso: selected.peso,
        alto: selected.alto,
        ancho: selected.ancho,
        profundidad: selected.profundidad,
        costo: selected.costo,
        envio_gratis: selected.envio_gratis,
        destacado: selected.destacado,
      }
    : null;

  return (
    <>
      <AdminPageHeader title="Gestionar Productos" buttonLabel="Añadir Producto" onButtonClick={() => openForm()} />

      <ProductsTable products={products} onEdit={openForm} onDelete={openDelete} />

      <ProductForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        defaultValues={defaultValues}
        categorias={categorias}
        marcas={marcas}
      />

      <DeleteConfirmationDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDelete}
        itemName={selected ? `${selected.nombre}` : ''}
      />
    </>
  );
};

export default AdminProducts;
