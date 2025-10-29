import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const salesData = [
  { name: 'Ene', ventas: 4000 },
  { name: 'Feb', ventas: 3000 },
  { name: 'Mar', ventas: 5000 },
  { name: 'Abr', ventas: 4500 },
  { name: 'May', ventas: 6000 },
  { name: 'Jun', ventas: 5500 },
];

const topProductsData = [
    { name: 'TV OLED', ventas: 120 },
    { name: 'Refrigerador', ventas: 98 },
    { name: 'Lavadora', ventas: 86 },
    { name: 'Microondas', ventas: 75 },
    { name: 'Aspiradora', ventas: 60 },
];

const AdminDashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
            <CardHeader><CardTitle>Ventas Totales</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">$1,250,450</p></CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Nuevos Clientes</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">342</p></CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Órdenes Pendientes</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">23</p></CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Alertas de Stock</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-red-500">5</p></CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ventas" stroke="#3b82f6" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Productos Más Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProductsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="ventas" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
