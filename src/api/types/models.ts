// User related interfaces
export interface User {
  id_usuario: number;
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono: string;
  direccion: string;
  estado: string;
  fecha_registro: string;
  ultimo_login: string | null;
}

export interface Role {
  id_rol: number;
  nombre_rol: string;
  descripcion: string;
}

export interface Permission {
  id_permiso: number;
  nombre_permiso: string;
  descripcion: string;
}

export interface UserRole {
  id_usuario: number;
  id_rol: number;
}

export interface RolePermission {
  id_rol: number;
  id_permiso: number;
}

// Product related interfaces
export interface Category {
  id_categoria: number;
  nombre_categoria: string;
}

export interface Brand {
  id_marca: number;
  nombre_marca: string;
}

export interface Product {
  id_producto: number;
  sku: string;
  nombre: string;
  descripcion: string;
  precio: number;
  id_categoria: number;
  id_marca: number;
  imagen_url: string;
  ficha_tecnica_url: string;
  estado: string;
  fecha_creacion: string;
  // Relations
  categoria?: Category;
  marca?: Brand;
  inventario?: Inventory;
}

export interface Inventory {
  id_inventario: number;
  id_producto: number;
  stock_actual: number;
  stock_minimo: number;
  ubicacion_almacen: string;
  ultima_actualizacion: string;
}

// Order related interfaces
export interface Order {
  id_pedido: number;
  id_usuario: number;
  fecha_pedido: string;
  monto_total: number;
  estado_pedido: string;
  direccion_envio: string;
  direccion_facturacion: string;
  numero_seguimiento: string;
  // Relations
  usuario?: User;
  detalles?: OrderDetail[];
  comprobante?: Receipt;
  pago?: Payment;
  seguimientos?: OrderTracking[];
  devoluciones?: Return[];
}

export interface OrderDetail {
  id_detalle: number;
  id_pedido: number;
  id_producto: number;
  cantidad: number;
  precio_unitario_en_el_momento: number;
  // Relations
  producto?: Product;
}

export interface Receipt {
  id_comprobante: number;
  id_pedido: number;
  tipo_comprobante: string;
  url_pdf: string;
  fecha_emision: string;
}

export interface Payment {
  id_pago: number;
  id_pedido: number;
  stripe_payment_intent_id: string;
  monto: number;
  moneda: string;
  estado_pago: string;
  fecha_pago: string;
  metodo_pago: string;
  respuesta_stripe: Record<string, any>;
}

export interface Return {
  id_devolucion: number;
  id_pedido: number;
  id_producto: number;
  motivo: string;
  estado: string;
  fecha_solicitud: string;
  // Relations
  producto?: Product;
  pedido?: Order;
}

// Cart related interfaces
export interface Cart {
  id_carrito: number;
  id_usuario: number;
  fecha_ultima_actualizacion: string;
  // Relations
  detalles?: CartItem[];
}

export interface CartItem {
  id_detalle_carrito: number;
  id_carrito: number;
  id_producto: number;
  cantidad: number;
  // Relations
  producto?: Product;
}

export interface Favorite {
  id_usuario: number;
  id_producto: number;
  fecha_agregado: string;
  // Relations
  producto?: Product;
  usuario?: User;
}

export interface OrderTracking {
  id_seguimiento: number;
  id_pedido: number;
  estado_anterior: string;
  estado_nuevo: string;
  fecha_cambio: string;
  comentario: string;
}

// System related interfaces
export interface SystemLog {
  id_bitacora: number;
  id_usuario: number;
  fecha_accion: string;
  accion: string;
  estado: 'exitoso' | 'fallido' | 'advertencia';
  ip: string;
  // Relations
  usuario?: User;
}

export interface SystemConfig {
  id_config: number;
  clave: string;
  valor: string;
  descripcion: string;
}

// AI related interfaces
export interface AIModel {
  id_modelo: number;
  nombre_modelo: string;
  version: string;
  ruta_modelo: string;
  fecha_entrenamiento: string;
  parametros: Record<string, any>;
}

// Notification related interfaces
export interface Notification {
  id_notificacion: number;
  id_usuario: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  fecha_envio: string;
  estado: string;
  // Relations
  usuario?: User;
}

export interface NotificationPreference {
  id_preferencia: number;
  id_usuario: number;
  tipo_notificacion: string;
  activo: boolean;
  // Relations
  usuario?: User;
}

// Voice command related interfaces
export interface VoiceCommand {
  id_comando: number;
  id_usuario: number;
  transcript_original: string;
  tipo_comando: string;
  contexto_aplicacion: string;
  fecha_ejecucion: string;
  duracion_procesamiento: number;
  // Relations
  usuario?: User;
  reportes_generados?: GeneratedReport[];
}

export interface TextCommand {
  id_comando_texto: number;
  id_usuario: number;
  texto_original: string;
  tipo_comando: string;
  contexto_aplicacion: string;
  fecha_ejecucion: string;
  // Relations
  usuario?: User;
  reportes_generados?: GeneratedReport[];
}

export interface GeneratedReport {
  id_reporte: number;
  id_usuario: number;
  id_comando?: number;
  id_comando_texto?: number;
  tipo_comando: string;
  tipo_reporte: string;
  formato_salida: string;
  parametros: Record<string, any>;
  consulta_sql: string;
  url_descarga: string;
  fecha_generacion: string;
  estado: string;
  // Relations
  usuario?: User;
  comando_voz?: VoiceCommand;
  comando_texto?: TextCommand;
}

// Enums
export enum OrderStatus {
  PENDING = 'pendiente',
  PROCESSING = 'procesando',
  SHIPPED = 'enviado',
  DELIVERED = 'entregado',
  CANCELLED = 'cancelado',
  RETURNED = 'devuelto',
}

export enum PaymentStatus {
  PENDING = 'pendiente',
  COMPLETED = 'completado',
  FAILED = 'fallido',
  REFUNDED = 'reembolsado',
  PARTIALLY_REFUNDED = 'reembolsado_parcialmente',
}

export enum NotificationType {
  ORDER_UPDATE = 'actualizacion_pedido',
  PAYMENT_CONFIRMATION = 'confirmacion_pago',
  SHIPPING_UPDATE = 'actualizacion_envio',
  PROMOTION = 'promocion',
  SYSTEM = 'sistema',
}

export enum CommandType {
  SEARCH_PRODUCT = 'buscar_producto',
  CREATE_ORDER = 'crear_pedido',
  CHECK_ORDER = 'ver_pedido',
  CANCEL_ORDER = 'cancelar_pedido',
  GENERATE_REPORT = 'generar_reporte',
  SYSTEM_COMMAND = 'comando_sistema',
}

// Request/Response DTOs
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refresh_token: string;
  user: User;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
  details?: Record<string, any>;
}

// Utility types
export type Nullable<T> = T | null;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
