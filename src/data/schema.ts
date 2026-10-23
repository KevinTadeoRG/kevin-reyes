import { z } from 'astro/zod';

/** Idiomas del sitio. El primero es el default (ruta `/`). */
export const LOCALES = ['es', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

/** Anclas de la one-page. Son iguales en ambos idiomas para que el selector de idioma lleve a la misma sección. */
export const SECTION_IDS = [
  'about',
  'experience',
  'stack',
  'projects',
  'education',
  'contact',
] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export const STACK_CATEGORY_IDS = [
  'frontend',
  'backend',
  'data',
  'security',
  'realtime',
  'industrial',
] as const;

// ---------- Piezas comunes ----------

const text = z.string().trim().min(1);
const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Debe ser un slug: minúsculas y guiones');

/** Mes en formato `YYYY-MM`. */
const yearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Debe tener formato YYYY-MM');

/** `end: null` significa "actualidad". */
const period = z
  .strictObject({ start: yearMonth, end: yearMonth.nullable() })
  .refine((p) => p.end === null || p.start <= p.end, {
    message: 'La fecha de inicio es posterior a la de fin',
  });

// ---------- Datos que no dependen del idioma ----------

export const personSchema = z.strictObject({
  name: text,
  links: z.strictObject({
    linkedin: z.url({ protocol: /^https$/ }),
    github: z.url({ protocol: /^https$/ }),
  }),
  /** Partido en dos para que el correo completo no aparezca como texto en el repo ni en el HTML. */
  email: z
    .strictObject({ user: text, domain: text })
    .refine((e) => z.email().safeParse(`${e.user}@${e.domain}`).success, {
      message: 'user + domain no forman un correo válido',
    }),
});
export type Person = z.infer<typeof personSchema>;

// ---------- Contenido por idioma (Anexos A y B) ----------

const role = z.strictObject({
  id: slug,
  title: text,
  period,
  location: text,
  summary: text.optional(),
  /** Grupos de viñetas. Si el puesto no tiene subtítulos, un solo grupo sin `title`. */
  groups: z.array(z.strictObject({ title: text.optional(), bullets: z.array(text).min(1) })).min(1),
});

const company = z.strictObject({
  id: slug,
  name: text,
  /** Del más reciente al más antiguo. */
  roles: z.array(role).min(1),
});

export const contentSchema = z.strictObject({
  meta: z.strictObject({ title: text, description: text }),
  profile: z.strictObject({
    location: text,
    headline: z.strictObject({ role: text, keywords: z.array(text).min(1) }),
    valueProposition: text,
  }),
  about: z.strictObject({ paragraphs: z.array(text).min(1) }),
  stack: z
    .array(
      z.strictObject({
        id: z.enum(STACK_CATEGORY_IDS),
        label: text,
        secondary: z.boolean(),
        items: z.array(z.strictObject({ name: text, detail: text.optional() })).min(1),
      }),
    )
    .min(1),
  experience: z.array(company).min(1),
  education: z.array(z.strictObject({ id: slug, institution: text, degree: text, period })).min(1),
});
export type Content = z.infer<typeof contentSchema>;
export type ContentInput = z.input<typeof contentSchema>;

// ---------- Textos de interfaz ----------

export const uiSchema = z.strictObject({
  /** Nombre del idioma en ese mismo idioma (para el selector). */
  languageName: text,
  /** Meses abreviados, enero → diciembre. */
  months: z.array(text).length(12),
  a11y: z.strictObject({
    skipToContent: text,
    mainNav: text,
    switchLanguage: text,
    themeToDark: text,
    themeToLight: text,
  }),
  nav: z.strictObject({
    about: text,
    experience: text,
    stack: text,
    projects: text,
    education: text,
    contact: text,
  }),
  hero: z.strictObject({ downloadCv: text, contact: text }),
  experience: z.strictObject({ present: text }),
  stack: z.strictObject({ secondaryTag: text }),
  projects: z.strictObject({ placeholder: text }),
  contact: z.strictObject({
    linkedin: text,
    github: text,
    email: text,
    revealEmail: text,
    form: z.strictObject({
      name: text,
      email: text,
      message: text,
      submit: text,
      sending: text,
      success: text,
      error: text,
      unavailable: text,
      /** Etiqueta del campo honeypot (oculto a personas, visible para bots). */
      honeypot: text,
    }),
  }),
});
export type Ui = z.infer<typeof uiSchema>;
export type UiInput = z.input<typeof uiSchema>;
