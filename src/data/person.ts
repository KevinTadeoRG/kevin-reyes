import type { Person } from './schema.ts';

/** Datos que no cambian entre idiomas. */
export const person = {
  name: 'Kevin Reyes',
  links: {
    linkedin: 'https://www.linkedin.com/in/kevin-tadeorg-20063728b',
    github: 'https://github.com/KevinTadeoRG',
  },
  // El correo se ensambla en el cliente (Fase 2); nunca va completo en el HTML.
  email: { user: 'reyesgarciakevintadeo', domain: 'gmail.com' },
} satisfies Person;
