import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

const SavedItemsPage = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Artículos Guardados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-gray-500">
            <p>Aún no tienes artículos guardados.</p>
            <p className="text-sm">Explora el catálogo y guarda tus productos favoritos.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SavedItemsPage;
