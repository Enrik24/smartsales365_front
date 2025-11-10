import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import Swal from 'sweetalert2';
import { api } from '@/config';
import { logExitoso, logFallido } from '@/lib/bitacora';

const EditProfile = () => {
  const navigate = useNavigate();
  const { authState, updateUser } = useAuth();
  const { user } = authState;
  
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    telefono: user?.telefono || '',
    direccion: user?.direccion || '',
  });

  const [passwordData, setPasswordData] = useState({
    password_actual: '',
    nuevo_password: '',
    confirmar_password: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showSuccessAlert = (title: string, message: string) => {
    return Swal.fire({
      title: title,
      text: message,
      icon: 'success',
      confirmButtonText: '¡Entendido!',
      confirmButtonColor: '#3b82f6',
      background: '#ffffff',
      customClass: {
        title: 'text-2xl font-bold',
        popup: 'rounded-lg shadow-xl'
      }
    });
  };

  const showErrorAlert = (title: string, message: string) => {
    return Swal.fire({
      title: title,
      text: message,
      icon: 'error',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#ef4444',
      background: '#ffffff',
      customClass: {
        title: 'text-2xl font-bold text-red-600',
        popup: 'rounded-lg shadow-xl'
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validar que las contraseñas coincidan si se está intentando cambiar la contraseña
      if (passwordData.password_actual) {
        if (passwordData.nuevo_password !== passwordData.confirmar_password) {
          throw new Error('Las contraseñas no coinciden');
        }
      }
      
      // Mostrar diálogo de confirmación
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Deseas guardar los cambios en tu perfil?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, guardar cambios',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        customClass: {
          popup: 'rounded-lg shadow-xl'
        }
      });

      if (!result.isConfirmed) {
        setIsLoading(false);
        return;
      }
      
      // Actualizar datos del perfil
      const response = await api.patch('/api/auth/usuarios/me/', formData);
      updateUser(response.data);
      
      // Cambiar contraseña si se proporcionó la contraseña actual
      if (passwordData.password_actual) {
        await api.post('/api/auth/cambiar-password/', {
          password_actual: passwordData.password_actual,
          nuevo_password: passwordData.nuevo_password,
          confirmar_password: passwordData.confirmar_password
        });
        
        // Limpiar campos de contraseña
        setPasswordData({
          password_actual: '',
          nuevo_password: '',
          confirmar_password: ''
        });
        
        await showSuccessAlert('¡Éxito!', 'Tu perfil y contraseña han sido actualizados correctamente.');
      } else {
        await showSuccessAlert('¡Éxito!', 'Tu perfil ha sido actualizado correctamente.');
      }
      // Bitácora
      void logExitoso('PERFIL_EDITADO');
      
      // Navegar de vuelta al perfil
      navigate('/profile');
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar el perfil';
      await showErrorAlert('Error', errorMessage);
      // Bitácora
      void logFallido('PERFIL_EDICION_FALLIDA');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Cargando perfil...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Editar Perfil</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido</Label>
                <Input
                  id="apellido"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="pt-6 space-y-4">
              <h3 className="text-lg font-medium">Cambiar Contraseña</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password_actual">Contraseña Actual</Label>
                  <Input
                    id="password_actual"
                    name="password_actual"
                    type="password"
                    value={passwordData.password_actual}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="opacity-50">
                  <Label>Dejar en blanco si no desea cambiar la contraseña</Label>
                </div>
                {passwordData.password_actual && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="nuevo_password">Nueva Contraseña</Label>
                      <Input
                        id="nuevo_password"
                        name="nuevo_password"
                        type="password"
                        value={passwordData.nuevo_password}
                        onChange={handlePasswordChange}
                        minLength={6}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmar_password">Confirmar Nueva Contraseña</Label>
                      <Input
                        id="confirmar_password"
                        name="confirmar_password"
                        type="password"
                        value={passwordData.confirmar_password}
                        onChange={handlePasswordChange}
                        minLength={6}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/perfil')}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default EditProfile;
