import { App } from 'aws-cdk-lib';
import { loadConfig } from '../lib/config.ts';
import { ContactStack } from '../lib/contact-stack.ts';

const app = new App();

new ContactStack(app, 'KevinReyesContact', {
  description: 'Formulario de contacto de kevin-reyes.pages.dev (API Gateway + Lambda + SES)',
  // us-east-1: misma región que el certificado de CloudFront de la Fase 6.
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' },
  ...loadConfig(process.env),
});
