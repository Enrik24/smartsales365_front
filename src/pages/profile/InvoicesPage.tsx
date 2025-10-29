import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

const InvoicesPage = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis Facturas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-gray-500">
            <p>No se encontraron facturas.</p>
            <p className="text-sm">Tus facturas aparecerán aquí después de cada compra.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoicesPage;
