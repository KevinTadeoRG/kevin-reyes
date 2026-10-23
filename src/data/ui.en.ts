import type { UiInput } from './schema.ts';

export const uiEn = {
  languageName: 'English',
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  a11y: {
    skipToContent: 'Skip to content',
    mainNav: 'Main navigation',
    switchLanguage: 'View this page in Spanish',
    themeToDark: 'Switch to dark mode',
    themeToLight: 'Switch to light mode',
  },
  nav: {
    about: 'About',
    experience: 'Experience',
    stack: 'Stack',
    projects: 'Projects',
    education: 'Education',
    contact: 'Contact',
  },
  hero: {
    downloadCv: 'Download CV',
    contact: 'Contact',
  },
  experience: {
    present: 'Present',
  },
  stack: {
    secondaryTag: 'secondary',
  },
  projects: {
    placeholder: 'Case studies in progress.',
  },
  notFound: {
    title: 'Page not found',
    message: "The page you're looking for doesn't exist or has moved.",
    backHome: 'Back to home',
  },
  contact: {
    linkedin: 'LinkedIn',
    github: 'GitHub',
    email: 'Email',
    revealEmail: 'Show email',
    form: {
      name: 'Name',
      email: 'Email',
      message: 'Message',
      submit: 'Send',
      sending: 'Sending…',
      success: 'Message sent. Thanks for reaching out.',
      error: 'The message could not be sent. Please try again later.',
      unavailable: 'The contact form will be available soon.',
      honeypot: 'Leave this field empty',
    },
  },
} satisfies UiInput;
