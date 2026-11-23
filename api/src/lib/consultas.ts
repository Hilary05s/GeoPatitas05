/**
 * Ayuda para armar filtros opcionales de forma SEGURA.
 * Los fragmentos de SQL son textos fijos escritos en el código; los valores
 * que manda el usuario SIEMPRE van como parámetros `?` (nunca concatenados).
 *
 *   const f = new Filtros();
 *   if (q.estado) f.agregar('estado_caso = ?', q.estado);
 *   pool.query(`SELECT ... ${f.where()}`, f.valores);
 */
export class Filtros {
  private readonly condiciones: string[] = [];
  readonly valores: unknown[] = [];

  agregar(condicion: string, ...valores: unknown[]) {
    this.condiciones.push(condicion);
    this.valores.push(...valores);
    return this;
  }

  where() {
    return this.condiciones.length ? `WHERE ${this.condiciones.join(' AND ')}` : '';
  }
}
