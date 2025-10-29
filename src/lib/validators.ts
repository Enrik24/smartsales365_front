import { z } from 'zod';

// Esquema para el formulario de registro de nuevos usuarios
export const registerSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  apellido: z.string().min(2, { message: "El apellido debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, introduce un email válido." }),
  password: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres." }),
  confirm_password: z.string(),
}).refine(data => data.password === data.confirm_password, {
  message: "Las contraseñas no coinciden.",
  path: ["confirm_password"],
});

// Esquema para el formulario de edición de usuarios en el panel de admin
export const userAdminSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  apellido: z.string().min(2, { message: "El apellido debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, introduce un email válido." }),
  telefono: z.string().optional(),
  rol: z.enum(['Cliente', 'Administrador']),
  password: z.string().optional(),
  confirm_password: z.string().optional(),
}).refine(data => {
  // Solo valida la contraseña si se ha introducido una nueva
  if (data.password || data.confirm_password) {
    return data.password === data.confirm_password;
  }
  return true;
}, {
  message: "Las contraseñas no coinciden.",
  path: ["confirm_password"],
}).refine(data => {
    if (data.password && data.password.length > 0 && data.password.length < 8) {
        return false;
    }
    return true;
}, {
    message: "La contraseña debe tener al menos 8 caracteres.",
    path: ["password"],
});


export const roleSchema = z.object({
  nombre: z.string().min(3, { message: "El nombre del rol debe tener al menos 3 caracteres." }),
  descripcion: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres." }),
  activo: z.boolean(),
  permissionIds: z.array(z.string()).optional(),
});

export const permissionSchema = z.object({
  nombre: z.string().min(3, { message: "El nombre del permiso debe tener al menos 3 caracteres." }),
  descripcion: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres." }),
});

export const categorySchema = z.object({
    nombre: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
    descripcion: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres." }),
    activo: z.boolean(),
});

export const brandSchema = z.object({
    nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
    descripcion: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres." }),
    activo: z.boolean(),
});
