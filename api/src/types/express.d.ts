// Agrega `req.moderador` a las peticiones de Express (lo llena requiereModerador).

export interface ModeradorSesion {
  id: number;
  nombre: string;
  correo: string;
  rol: 'admin' | 'moderador';
  activo: 0 | 1;
  creado_en: Date;
}

declare global {
  namespace Express {
    interface Request {
      /** Moderador autenticado. Solo existe en rutas protegidas con requiereModerador. */
      moderador?: ModeradorSesion;
    }
  }
}
