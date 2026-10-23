import type { UiInput } from './schema.ts';

export const uiEs = {
  languageName: 'Español',
  months: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  a11y: {
    skipToContent: 'Saltar al contenido',
    mainNav: 'Navegación principal',
    switchLanguage: 'Ver esta página en inglés',
    themeToDark: 'Cambiar a modo oscuro',
    themeToLight: 'Cambiar a modo claro',
  },
  nav: {
    about: 'Sobre mí',
    experience: 'Experiencia',
    stack: 'Stack',
    projects: 'Proyectos',
    education: 'Educación',
    contact: 'Contacto',
  },
  hero: {
    downloadCv: 'Descargar CV',
    contact: 'Contacto',
  },
  experience: {
    present: 'Actualidad',
  },
  stack: {
    secondaryTag: 'secundario',
  },
  projects: {
    placeholder: 'Casos de estudio en preparación.',
  },
  notFound: {
    title: 'Página no encontrada',
    message: 'La página que buscas no existe o cambió de dirección.',
    backHome: 'Volver al inicio',
  },
  contact: {
    linkedin: 'LinkedIn',
    github: 'GitHub',
    email: 'Correo',
    revealEmail: 'Mostrar correo',
    form: {
      name: 'Nombre',
      email: 'Correo',
      message: 'Mensaje',
      submit: 'Enviar',
      sending: 'Enviando…',
      success: 'Mensaje enviado. Gracias por escribir.',
      error: 'No se pudo enviar el mensaje. Intenta de nuevo más tarde.',
      unavailable: 'El formulario de contacto estará disponible pronto.',
      honeypot: 'No llenes este campo',
    },
  },
} satisfies UiInput;
