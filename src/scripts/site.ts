/**
 * Interactividad mínima del sitio (sin framework):
 * - Toggle de tema claro/oscuro que respeta prefers-color-scheme.
 * - Sección activa: resalta el menú y hace que el selector de idioma lleve a la misma sección.
 * - Correo ofuscado que se ensambla al hacer clic.
 */
import { decodeEmailPart } from '../lib/email.ts';

// ---------- Tema ----------

type Theme = 'light' | 'dark';
const root = document.documentElement;
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

const systemTheme = (): Theme => (darkQuery.matches ? 'dark' : 'light');
const currentTheme = (): Theme => {
  const forced = root.dataset.theme;
  return forced === 'light' || forced === 'dark' ? forced : systemTheme();
};

function storeTheme(theme: Theme | null): void {
  try {
    if (theme) localStorage.setItem('theme', theme);
    else localStorage.removeItem('theme');
  } catch {
    // Almacenamiento bloqueado: el tema solo dura esta visita.
  }
}

const themeToggles = document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]');

function renderThemeToggles(): void {
  const theme = currentTheme();
  for (const button of themeToggles) {
    button.dataset.current = theme;
    const label = theme === 'dark' ? button.dataset.labelLight : button.dataset.labelDark;
    if (label) button.setAttribute('aria-label', label);
    button.hidden = false;
  }
}

for (const button of themeToggles) {
  button.addEventListener('click', () => {
    const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
    // Si el usuario vuelve a lo que dice el sistema, se deja de forzar y se sigue al sistema.
    if (next === systemTheme()) {
      delete root.dataset.theme;
      storeTheme(null);
    } else {
      root.dataset.theme = next;
      storeTheme(next);
    }
    renderThemeToggles();
  });
}
darkQuery.addEventListener('change', renderThemeToggles);
renderThemeToggles();

// ---------- Sección activa ----------

const navLinks = document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]');
const languageLinks = document.querySelectorAll<HTMLAnchorElement>('[data-lang-switch]');

function setCurrentSection(id: string): void {
  for (const link of navLinks) {
    if (link.dataset.navLink === id) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  }
  for (const link of languageLinks) {
    const url = new URL(link.href);
    url.hash = id === 'top' ? '' : id;
    link.href = url.href;
  }
}

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) setCurrentSection(entry.target.id);
    }
  },
  // Una sección es "la actual" cuando cruza la franja central de la pantalla.
  { rootMargin: '-40% 0px -55% 0px' },
);
const sections = [...document.querySelectorAll<HTMLElement>('main section[id]')];
for (const section of sections) observer.observe(section);

// La última sección puede no llegar a la franja central: al tocar el fondo, se marca ella.
const lastSection = sections.at(-1);
window.addEventListener(
  'scroll',
  () => {
    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (atBottom && lastSection) setCurrentSection(lastSection.id);
  },
  { passive: true },
);

// ---------- Correo ofuscado ----------

for (const box of document.querySelectorAll<HTMLElement>('[data-email]')) {
  const button = box.querySelector('button');
  const link = box.querySelector('a');
  const { u, d } = box.dataset;
  if (!button || !link || !u || !d) continue;

  button.hidden = false;
  button.addEventListener('click', () => {
    const address = `${decodeEmailPart(u)}@${decodeEmailPart(d)}`;
    link.href = `mailto:${address}`;
    link.textContent = address;
    link.hidden = false;
    button.hidden = true;
    link.focus();
  });
}
