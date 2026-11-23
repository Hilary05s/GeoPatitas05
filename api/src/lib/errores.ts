/**
 * Error con status HTTP y mensaje para el cliente.
 * Se lanza desde los controladores (throw new ErrorHttp(404, 'Reporte no encontrado'))
 * y lo convierte en JSON el middleware de errores.
 * `campos` (opcional) indica qué campo del formulario falló: { zona_id: 'La zona no existe' }.
 */
export class ErrorHttp extends Error {
  readonly status: number;
  readonly campos: Record<string, string> | undefined;

  constructor(status: number, mensaje: string, campos?: Record<string, string>) {
    super(mensaje);
    this.name = 'ErrorHttp';
    this.status = status;
    this.campos = campos;
  }
}
