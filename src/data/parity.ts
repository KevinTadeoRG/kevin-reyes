/**
 * Compara la forma de dos versiones del contenido (p. ej. ES y EN).
 *
 * Exige: mismas llaves en cada objeto, mismo largo en cada arreglo y mismo tipo en cada valor.
 * Además, las llaves de `MUST_MATCH` deben tener exactamente el mismo valor en ambos idiomas
 * (ids, fechas), porque son datos, no traducciones.
 */
const MUST_MATCH = new Set(['id', 'start', 'end', 'secondary']);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function kind(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

export function findShapeMismatches(
  a: unknown,
  b: unknown,
  names: readonly [string, string] = ['a', 'b'],
  path = '$',
): string[] {
  if (kind(a) !== kind(b)) {
    return [`${path}: ${names[0]} es ${kind(a)}, ${names[1]} es ${kind(b)}`];
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return [`${path}: ${names[0]} tiene ${a.length} elementos, ${names[1]} tiene ${b.length}`];
    }
    return a.flatMap((item, i) => findShapeMismatches(item, b[i], names, `${path}[${i}]`));
  }

  if (isPlainObject(a) && isPlainObject(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    return [...keys].flatMap((key) => {
      const childPath = `${path}.${key}`;
      if (!(key in a)) return [`${childPath}: falta en ${names[0]}`];
      if (!(key in b)) return [`${childPath}: falta en ${names[1]}`];
      if (MUST_MATCH.has(key) && a[key] !== b[key]) {
        return [
          `${childPath}: debe ser igual en ambos idiomas (${names[0]}=${String(a[key])}, ${names[1]}=${String(b[key])})`,
        ];
      }
      return findShapeMismatches(a[key], b[key], names, childPath);
    });
  }

  return [];
}
