import type { ContentInput } from './schema.ts';

/** Source: Anexo B of the plan. Do not invent or expand achievements. */
export const contentEn = {
  meta: {
    title: 'Kevin Reyes — Full Stack Engineer · Fintech',
    description:
      'Full Stack Engineer focused on fintech. I build products end to end: the PostgreSQL data model, the serverless API on AWS, and the React Native mobile app that consumes it.',
  },

  profile: {
    location: 'Monterrey, Nuevo León, Mexico',
    headline: {
      role: 'Full Stack Engineer · Fintech',
      keywords: [
        'React Native · Expo',
        'AWS Lambda · API Gateway · PostgreSQL',
        'Python · Node.js',
      ],
    },
    valueProposition:
      'I build products end to end: the PostgreSQL data model, the serverless API on AWS, and the React Native mobile app that consumes it.',
  },

  about: {
    paragraphs: [
      'Full Stack Engineer focused on fintech. I build products end to end: the PostgreSQL data model, the serverless API on AWS, and the React Native mobile app that consumes it.',
      "At Taveron I'm building a payments platform that handles interbank transfers (SPEI, Mexico's real-time payment system), bill payments, and gift card sales. My work spans PL/pgSQL stored functions and Lambdas behind API Gateway all the way to the app's data layer with Zustand and React Query.",
      "What sets me apart: I come from industrial automation. On a production line, you don't fix a mistake with a rollback — the plant stops. That's why I validate at the source, never trust the client, and design assuming everything can fail. Today I apply that mindset to a system that moves money.",
      "I'm drawn to software where mistakes have real consequences: money, sensitive data, or physical infrastructure.",
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
      label: 'Data',
      secondary: false,
      items: [
        {
          name: 'PostgreSQL',
          detail: 'PL/pgSQL, JSONB, deterministic pagination, privilege control',
        },
        { name: 'Oracle 23ai' },
      ],
    },
    {
      id: 'security',
      label: 'Security',
      secondary: false,
      items: [
        { name: 'Secrets management' },
        { name: 'Webhook signature validation' },
        { name: 'Idempotency' },
        { name: 'Argon2id hashing' },
        { name: 'API hardening' },
      ],
    },
    {
      id: 'realtime',
      label: 'Real-time',
      secondary: false,
      items: [{ name: 'WebSockets' }, { name: 'IoT dashboards' }],
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
          location: 'Monterrey, Mexico',
          summary:
            'End-to-end development of a payments platform: data model, serverless API, and mobile app.',
          groups: [
            {
              title: 'Backend & data',
              bullets: [
                'Designed PostgreSQL schemas and PL/pgSQL functions for the incoming SPEI transfer lifecycle: dispatch, fees, and ledger movements.',
                'Exposed PostgreSQL business logic through AWS Lambda + API Gateway, separating structural validation from domain validation.',
                'Implemented deterministic pagination, JSONB aggregation, and explicit privilege control (SECURITY DEFINER, search_path) in production functions.',
                "Integrated a third-party provider's API for bill payments and gift card/PIN sales.",
                'Designing a module that automates the monthly credit bureau report, replacing a manual process based on Excel and SQL queries.',
              ],
            },
            {
              title: 'Mobile frontend',
              bullets: [
                'React Native / Expo app using Zustand for global state and React Query for server data.',
                'Refactored the network layer: moved data fetching out of state stores into dedicated hooks, centralized cache keys, and parallelized sequential requests.',
                'Diagnosed JWT session bugs across devices, cache desynchronization, and silent failures in bank account (CLABE) lookups.',
              ],
            },
            {
              title: 'Security',
              bullets: [
                'Audited the payment processor integration: credentials exposed in the mobile client, unverified webhook signatures, and replay risk. Proposed remediation with a managed secrets store, idempotency keys, WAF rules, and log hygiene for sensitive data.',
                'Ran a per-table data sensitivity analysis and wrote safe-query guidelines for the team.',
                // TODO(kevin): add the financial portal authentication line only if it is already implemented.
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
          location: 'Monterrey, Mexico',
          groups: [
            {
              bullets: [
                'Built HMI/SCADA interfaces in Ignition for monitoring and controlling industrial processes.',
                'Real-time data visualization over WebSockets for IoT dashboards.',
                'Integrated Siemens, Allen-Bradley, and Schneider PLCs over Modbus, BACnet, and EtherNet/IP.',
                'Integrated machine vision and laser profilometers into robotic cells.',
                'Technical project management and direct client communication.',
              ],
            },
          ],
        },
        {
          id: 'intern',
          title: 'Industry 4.0 / IoT / Software Development Intern',
          // TODO(kevin): Anexo says Dec 2024 – Jun 2026, overlapping Junior Engineer (Jan 2026). Did it end in Dec 2025?
          period: { start: '2024-12', end: '2026-06' },
          location: 'García, Mexico',
          groups: [
            {
              bullets: [
                'Built Ignition screens for monitoring and control, processing field data received over industrial protocols.',
                'Prepared technical quotes and client presentations.',
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
      degree: 'B.S. in Computer Science',
      period: { start: '2021-08', end: '2025-12' },
    },
    {
      id: 'uanl-high-school',
      institution: 'Universidad Autónoma de Nuevo León',
      degree: 'Progressive Bilingual High School Program',
      period: { start: '2019-08', end: '2021-06' },
    },
  ],
} satisfies ContentInput;
