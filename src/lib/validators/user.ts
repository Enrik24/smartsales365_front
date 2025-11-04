import { z } from 'zod';

export const userAdminSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  apellido: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('Correo electrónico inválido'),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  rol: z.enum(['Administrador', 'Cliente', 'Empleado']).default('Cliente'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .optional()
    .or(z.literal('')),
  confirm_password: z
    .string()
    .optional()
    .or(z.literal(''))
}).refine(
  (data) => {
    // Only validate password if it's a new user or password is being changed
    if (!data.password && !data.confirm_password) return true;
    return data.password === data.confirm_password;
  },
  {
    message: 'Las contraseñas no coinciden',
    path: ['confirm_password'],
  }
);

export type UserAdminFormData = z.infer<typeof userAdminSchema>;
