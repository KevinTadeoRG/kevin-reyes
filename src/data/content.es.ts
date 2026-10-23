import type { ContentInput } from './schema.ts';

/** Fuente: Anexo A del plan. No inventar ni ampliar logros. */
export const contentEs = {
  meta: {
    title: 'Kevin Reyes — Full Stack Engineer · Fintech',
    description:
      'Ingeniero Full Stack enfocado en fintech. Construyo productos de punta a punta: el modelo de datos en PostgreSQL, la API serverless en AWS y la app móvil en React Native que la consume.',
  },

  profile: {
    location: 'Monterrey, Nuevo León, México',
    headline: {
      role: 'Full Stack Engineer · Fintech',
      keywords: [
        'React Native · Expo',
        'AWS Lambda · API Gateway · PostgreSQL',
        'Python · Node.js',
      ],
    },
    valueProposition:
      'Construyo productos de punta a punta: el modelo de datos en PostgreSQL, la API serverless en AWS y la app móvil en React Native que la consume.',
  },

  about: {
    paragraphs: [
      'En Taveron desarrollo una plataforma de pagos que procesa transferencias interbancarias (SPEI), pago de servicios y venta de tarjetas de regalo. Trabajo desde funciones almacenadas en PL/pgSQL y Lambdas detrás de API Gateway hasta la capa de datos de la app con Zustand y React Query.',
      'Lo que me diferencia: vengo de la automatización industrial. En una línea de producción un error no se revierte con un rollback; se detiene la planta. Por eso valido en el origen, no confío en el cliente y diseño asumiendo que todo puede fallar. Hoy aplico ese criterio a un sistema que mueve dinero.',
      'Me interesa construir software donde un error tiene consecuencias reales: dinero, datos sensibles o infraestructura física.',
    ],
  },

  stack: [
    {
      id: 'frontend',
      label: 'Frontend',
      secondary: false,
      items: [
        { name: 'React Native' },
        { name: 'Expo' },
        { name: 'React' },
        { name: 'Angular' },
        { name: 'Zustand' },
        { name: 'React Query' },
      ],
    },
    {
      id: 'backend',
      label: 'Backend',
      secondary: false,
      items: [
        { name: 'AWS Lambda' },
        { name: 'API Gateway' },
        { name: 'Python' },
        { name: 'Node.js' },
        { name: 'Express' },
        { name: 'C#' },
      ],
    },
    {
      id: 'data',
      label: 'Datos',
      secondary: false,
      items: [
        {
          name: 'PostgreSQL',
          detail: 'PL/pgSQL, JSONB, paginación determinista, control de privilegios',
        },
        { name: 'Oracle 23ai' },
      ],
    },
    {
      id: 'security',
      label: 'Seguridad',
      secondary: false,
      items: [
        { name: 'Gestión de secretos' },
        { name: 'Validación de webhooks' },
        { name: 'Idempotencia' },
        { name: 'Hashing Argon2id' },
        { name: 'Hardening de APIs' },
      ],
    },
    {
      id: 'realtime',
      label: 'Tiempo real',
      secondary: false,
      items: [{ name: 'WebSockets' }, { name: 'Dashboards IoT' }],
    },
    {
      id: 'industrial',
      label: 'Industrial',
      secondary: true,
      items: [
        { name: 'Ignition' },
        { name: 'ICONICS' },
        { name: 'EcoStruxure' },
        { name: 'PLCs', detail: 'Siemens, Allen-Bradley, Schneider' },
        { name: 'Modbus' },
        { name: 'BACnet' },
        { name: 'EtherNet/IP' },
      ],
    },
  ],

  experience: [
    {
      id: 'taveron',
      name: 'Taveron',
      roles: [
        {
          id: 'full-stack-engineer',
          title: 'Full Stack Engineer',
          period: { start: '2026-06', end: null },
          location: 'Monterrey, N.L.',
          summary:
            'Desarrollo end-to-end de una plataforma de pagos: modelo de datos, API serverless y app móvil.',
          groups: [
            {
              title: 'Backend y datos',
              bullets: [
                'Diseñé esquemas y funciones PL/pgSQL para el ciclo de transferencias SPEI entrantes: dispersión, comisiones y movimientos.',
                'Expuse lógica de negocio de PostgreSQL vía AWS Lambda + API Gateway, separando validación estructural de validación de dominio.',
                'Implementé paginación determinista, agregación JSONB y control explícito de privilegios (SECURITY DEFINER, search_path) en funciones de producción.',
                'Integré la API de un proveedor externo para pago de servicios y venta de tarjetas de regalo/PINs.',
                'Diseño de un módulo que automatiza el reporte mensual a buró de crédito, reemplazando un proceso manual basado en Excel y consultas SQL.',
              ],
            },
            {
              title: 'Frontend móvil',
              bullets: [
                'App en React Native / Expo con Zustand para estado global y React Query para datos de servidor.',
                'Refactoricé la capa de red: moví el fetching de los stores a hooks dedicados, centralicé las claves de caché y paralelicé llamadas secuenciales.',
                'Diagnostiqué bugs de sesión JWT entre dispositivos, desincronización de caché y fallos silenciosos en la consulta de CLABE.',
              ],
            },
            {
              title: 'Seguridad',
              bullets: [
                'Auditoría de la integración con el procesador de pagos: exposición de credenciales en el cliente móvil, firma de webhooks sin validar y riesgo de replay. Propuse remediación con gestor de secretos, llaves de idempotencia, WAF e higiene de logs para datos sensibles.',
                'Análisis de sensibilidad de datos por tabla y guía de consultas seguras para el equipo.',
                // TODO(kevin): agregar la línea de autenticación del portal financiero solo si ya está implementada.
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'zikro-automation',
      name: 'Zikro Automation',
      roles: [
        {
          id: 'junior-engineer',
          title: 'Junior Engineer',
          period: { start: '2026-01', end: '2026-06' },
          location: 'Monterrey, N.L.',
          groups: [
            {
              bullets: [
                'Desarrollo de interfaces HMI/SCADA en Ignition para monitoreo y control de procesos industriales.',
                'Visualización de datos en tiempo real vía WebSockets para dashboards IoT.',
                'Integración de PLCs Siemens, Allen-Bradley y Schneider mediante Modbus, BACnet y EtherNet/IP.',
                'Integración de visión artificial y perfilómetros láser en celdas robóticas.',
                'Gestión técnica de proyectos y comunicación directa con clientes.',
              ],
            },
          ],
        },
        {
          id: 'intern',
          title: 'Practicante Industria 4.0 / IoT / Desarrollo de Software',
          // TODO(kevin): el Anexo dice dic 2024 – jun 2026 y se cruza con Junior Engineer (ene 2026). ¿Terminó en dic 2025?
          period: { start: '2024-12', end: '2026-06' },
          location: 'García, N.L.',
          groups: [
            {
              bullets: [
                'Desarrollo de pantallas en Ignition para monitoreo y control, procesando datos de campo recibidos por protocolos industriales.',
                'Elaboración de cotizaciones técnicas y presentaciones para clientes.',
              ],
            },
          ],
        },
      ],
    },
  ],

  education: [
    {
      id: 'uanl-computer-science',
      institution: 'Universidad Autónoma de Nuevo León',
      degree: 'Lic. en Ciencias Computacionales',
      period: { start: '2021-08', end: '2025-12' },
    },
    {
      id: 'uanl-high-school',
      institution: 'Universidad Autónoma de Nuevo León',
      degree: 'Bachillerato Bilingüe Progresivo',
      period: { start: '2019-08', end: '2021-06' },
    },
  ],
} satisfies ContentInput;
