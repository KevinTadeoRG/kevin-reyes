import { CfnOutput, Duration, RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib';
import { CorsHttpMethod, HttpApi, HttpMethod, HttpStage } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Architecture, Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import type { Construct } from 'constructs';
import { fileURLToPath } from 'node:url';
import type { ContactConfig } from './config.ts';

/** Límite de peticiones de la API: promedio por segundo y ráfaga máxima. */
export const THROTTLE = { rateLimit: 5, burstLimit: 10 } as const;

export type ContactStackProps = StackProps & ContactConfig;

/**
 * Formulario de contacto: HTTP API (POST /contact) → Lambda (Python 3.12) → Amazon SES.
 */
export class ContactStack extends Stack {
  constructor(scope: Construct, id: string, props: ContactStackProps) {
    super(scope, id, props);
    const { contactEmail, allowedOrigins } = props;

    const logGroup = new LogGroup(this, 'ContactFunctionLogs', {
      retention: RetentionDays.ONE_MONTH,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Rol propio, de mínimo privilegio: sin la política administrada genérica de Lambda.
    const role = new Role(this, 'ContactFunctionRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      description:
        'Formulario de contacto: escribir sus logs y enviar con SES desde una sola identidad',
    });
    logGroup.grantWrite(role);
    role.addToPolicy(
      new PolicyStatement({
        actions: ['ses:SendEmail'],
        resources: [
          this.formatArn({ service: 'ses', resource: 'identity', resourceName: contactEmail }),
        ],
        conditions: { StringEquals: { 'ses:FromAddress': contactEmail } },
      }),
    );

    const fn = new Function(this, 'ContactFunction', {
      description: 'Valida el formulario de contacto y lo envía por SES',
      runtime: Runtime.PYTHON_3_12,
      architecture: Architecture.ARM_64,
      handler: 'handler.handler',
      code: Code.fromAsset(fileURLToPath(new URL('../../backend/contact/src', import.meta.url)), {
        exclude: ['__pycache__', '*.pyc'],
      }),
      memorySize: 256,
      timeout: Duration.seconds(10),
      role,
      logGroup,
      environment: {
        SENDER_EMAIL: contactEmail,
        RECIPIENT_EMAIL: contactEmail,
        ALLOWED_ORIGINS: allowedOrigins.join(','),
      },
    });

    const api = new HttpApi(this, 'ContactApi', {
      apiName: 'kevin-reyes-contact',
      description: 'Formulario de contacto del sitio',
      createDefaultStage: false,
      corsPreflight: {
        allowOrigins: allowedOrigins,
        allowMethods: [CorsHttpMethod.POST],
        allowHeaders: ['content-type'],
        maxAge: Duration.days(1),
      },
    });
    api.addRoutes({
      path: '/contact',
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration('ContactIntegration', fn),
    });

    const stage = new HttpStage(this, 'DefaultStage', {
      httpApi: api,
      stageName: '$default',
      autoDeploy: true,
      throttle: THROTTLE,
    });

    new CfnOutput(this, 'ContactEndpoint', {
      description: 'URL para el formulario del sitio (CONTACT_API_URL)',
      value: `${stage.url}contact`,
    });
  }
}
