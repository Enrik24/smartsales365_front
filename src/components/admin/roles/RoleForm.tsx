import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { roleSchema } from '@/lib/validators';
import { Role } from '@/types';
import { PermissionDTO } from '@/api/services/permissionService';
import { permissionService } from '@/api/services/permissionService';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Checkbox } from '@/components/ui/Checkbox';
import Swal from 'sweetalert2';

// Función para mostrar notificaciones de éxito
export const showSuccessAlert = (title: string, message: string) => {
  return Swal.fire({
    title: title,
    text: message,
    icon: 'success',
    confirmButtonText: 'Aceptar',
    confirmButtonColor: '#2563eb',
  });
};

// Función para mostrar notificaciones de error
export const showErrorAlert = (title: string, message: string) => {
  return Swal.fire({
    title: title,
    text: message,
    icon: 'error',
    confirmButtonText: 'Aceptar',
    confirmButtonColor: '#dc2626',
  });
};

type RoleFormData = z.infer<typeof roleSchema>;

interface RoleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RoleFormData) => void;
  defaultValues: Role | null;
}

const RoleForm = ({ open, onOpenChange, onSubmit, defaultValues }: RoleFormProps) => {
  const [permissions, setPermissions] = useState<PermissionDTO[]>([]);

  // Helper function to extract permissions from different response formats
  const extractPermissions = (response: any): PermissionDTO[] => {
    if (!response) return [];
    
    // If response is already an array
    if (Array.isArray(response)) return response;
    
    // If response has a data property that's an array
    if (response.data && Array.isArray(response.data)) return response.data;
    
    // If response has a results property that's an array
    if (response.results && Array.isArray(response.results)) return response.results;
    
    // If response is an object with numeric keys (like a dictionary)
    if (typeof response === 'object' && response !== null) {
      const values = Object.values(response);
      if (values.length > 0 && typeof values[0] === 'object' && values[0] !== null) {
        return values as PermissionDTO[];
      }
    }
    
    console.warn('Unexpected permissions response format:', response);
    return [];
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      nombre_rol: '',
      descripcion: '',
      permissionIds: [] as string[]
    }
  });

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);
        console.log('Fetching permissions...');
        const response = await permissionService.list();
        console.log('Permissions API response:', response);
        
        if (response.error) {
          throw new Error(response.error.message || 'Error al cargar los permisos');
        }
        
        // Log the raw data to understand its structure
        console.log('Raw permissions data:', response.data);
        
        // Try different ways to extract permissions
        let permissionsList: PermissionDTO[] = [];
        
        // If data is an array, use it directly
        if (Array.isArray(response.data)) {
          permissionsList = response.data;
        } 
        // If data is an object with a 'results' array (pagination)
        else if (response.data && typeof response.data === 'object' && response.data !== null && 'results' in response.data) {
          const results = (response.data as { results?: unknown }).results;
          permissionsList = Array.isArray(results) ? results as PermissionDTO[] : [];
        }
        // If data is an object with numeric keys
        else if (response.data && typeof response.data === 'object') {
          const values = Object.values(response.data);
          if (values.length > 0 && typeof values[0] === 'object' && values[0] !== null) {
            permissionsList = values as PermissionDTO[];
          }
        }
        
        console.log('Extracted permissions:', permissionsList);
        setPermissions(permissionsList);
        
        if (permissionsList.length === 0) {
          console.warn('No se encontraron permisos en la respuesta:', response);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido al cargar permisos');
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchPermissions();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (defaultValues) {
        reset(defaultValues);
      } else {
        reset({ nombre_rol: '', descripcion: '', permissionIds: [] });
      }
    }
  }, [defaultValues, reset, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{defaultValues ? 'Editar Rol' : 'Añadir Rol'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="nombre_rol">Nombre del Rol</Label>
            <Input id="nombre_rol" {...register('nombre_rol')} />
            {errors.nombre_rol && <p className="text-red-500 text-sm mt-1">{errors.nombre_rol.message}</p>}
          </div>
          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Input id="descripcion" {...register('descripcion')} />
            {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion.message}</p>}
          </div>
          
          <div>
            <Label>Permisos</Label>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
              {loading ? (
                <div className="col-span-2 text-sm text-muted-foreground">Cargando permisos...</div>
              ) : error ? (
                <div className="col-span-2 text-sm text-red-500">{error}</div>
              ) : !Array.isArray(permissions) || permissions.length === 0 ? (
                <div className="col-span-2 text-sm text-muted-foreground">No hay permisos disponibles</div>
              ) : (
                <Controller
                  name="permissionIds"
                  control={control}
                  render={({ field }) => (
                    <>
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`perm-${permission.id}`}
                            checked={field.value?.includes(permission.id.toString())}
                            onCheckedChange={(checked) => {
                              const permissionId = permission.id.toString();
                              const newValue = checked
                                ? [...(field.value || []), permissionId]
                                : (field.value || []).filter((id) => id !== permissionId);
                              field.onChange(newValue);
                            }}
                          />
                          <div className="flex flex-col">
                            <Label htmlFor={`perm-${permission.id}`} className="font-normal">
                              {permission.nombre_permiso}
                            </Label>
                            {permission.descripcion && (
                              <span className="text-xs text-muted-foreground">
                                {permission.descripcion}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                />
              )}
            </div>
          </div>


          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RoleForm;
