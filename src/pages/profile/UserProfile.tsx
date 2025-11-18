import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const UserProfile = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { user } = authState;

  if (!user) {
    return <div>Cargando perfil...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalles del Perfil</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium text-gray-500">Nombre</label>
          <p className="text-lg font-medium">{user.nombre}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Apellido</label>
          <p className="text-lg font-medium">{user.apellido}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Documento de identidad</label>
          <p className="text-lg font-medium">{user.documento_identidad || 'No especificado'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Email</label>
          <p className="text-lg font-medium">{user.email}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Teléfono</label>
          <p className="text-lg font-medium">{user.telefono || 'No especificado'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Dirección</label>
          <p className="text-lg font-medium">{user.direccion || 'No especificado'}</p>
        </div>

      </CardContent>
      <CardFooter>
          <Button onClick={() => navigate('/profile/editar')}>
            Editar Perfil
          </Button>
      </CardFooter>
    </Card>
  );
};

export default UserProfile;