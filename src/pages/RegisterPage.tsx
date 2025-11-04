import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useState } from 'react';
import { registerSchema } from '@/lib/validators';

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (formData: RegisterFormData) => {
    setError(null);
    try {
      const { confirm_password, ...registrationData } = formData;
      const success = await registerUser({
        ...registrationData,
        confirm_password, // Include confirm_password in the registration data
        telefono: '',     // Add empty string for optional fields
        direccion: ''     // Add empty string for optional fields
      });
      
      if (success) {
        navigate('/');
      } else {
        setError('No se pudo completar el registro. Inténtalo de nuevo.');
      }
    } catch (e: any) {
      console.error('Registration error:', e);
      const errorMessage = e.response?.data?.message || e.message || 'Ocurrió un error inesperado.';
      setError(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    }
  };

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Crear una Cuenta</CardTitle>
          <CardDescription>Únete a SmartSales365 y descubre un mundo de tecnología.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input id="nombre" placeholder="John" {...register('nombre')} />
                    {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>}
                </div>
                 <div>
                    <Label htmlFor="apellido">Apellido</Label>
                    <Input id="apellido" placeholder="Doe" {...register('apellido')} />
                    {errors.apellido && <p className="text-red-500 text-sm mt-1">{errors.apellido.message}</p>}
                </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="tu@email.com" {...register('email')} />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" placeholder="Mínimo 8 caracteres" {...register('password')} />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <Label htmlFor="confirm_password">Confirmar Contraseña</Label>
              <Input id="confirm_password" type="password" placeholder="Repite tu contraseña" {...register('confirm_password')} />
              {errors.confirm_password && <p className="text-red-500 text-sm mt-1">{errors.confirm_password.message}</p>}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
            <p className="text-sm">¿Ya tienes cuenta? <Link to="/login" className="text-primary hover:underline">Inicia Sesión</Link></p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterPage;
