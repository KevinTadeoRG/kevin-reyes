/**
 * Ofuscación simple del correo: base64 invertido. No es cifrado; solo evita que el correo
 * aparezca como texto (ni como `usuario@dominio`) en el HTML. Se ensambla en el cliente al hacer clic.
 */
export function encodeEmailPart(value: string): string {
  return [...btoa(value)].reverse().join('');
}

export function decodeEmailPart(value: string): string {
  return atob([...value].reverse().join(''));
}
