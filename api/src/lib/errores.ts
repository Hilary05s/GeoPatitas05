/**
 * Error con status HTTP y mensaje para el cliente.
 * Se lanza desde los controladores (throw new ErrorHttp(404, 'Reporte no encontrado'))
 * y lo convierte en JSON el middleware de errores.
 */
export class ErrorHttp extends Error {
  readonly status: number;

  constructor(status: number, mensaje: string) {
    super(mensaje);
    this.name = 'ErrorHttp';
    this.status = status;
  }
}
