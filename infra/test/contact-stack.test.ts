import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { DEFAULT_ALLOWED_ORIGINS, loadConfig } from '../lib/config.ts';
import { ContactStack, THROTTLE } from '../lib/contact-stack.ts';

const EMAIL = 'identidad@example.com';
const ORIGINS = ['https://kevin-reyes.pages.dev'];

function synth() {
  const app = new App();
  const stack = new ContactStack(app, 'Test', {
    env: { account: '123456789012', region: 'us-east-1' },
    contactEmail: EMAIL,
    allowedOrigins: ORIGINS,
  });
  return Template.fromStack(stack);
}

const template = synth();

describe('Lambda', () => {
  it('Python 3.12 en ARM, con la configuración en variables de entorno', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'python3.12',
      Architectures: ['arm64'],
      Handler: 'handler.handler',
      Timeout: 10,
      Environment: {
        Variables: {
          SENDER_EMAIL: EMAIL,
          RECIPIENT_EMAIL: EMAIL,
          ALLOWED_ORIGINS: ORIGINS.join(','),
        },
      },
    });
  });

  it('logs con retención de 30 días', () => {
    template.hasResourceProperties('AWS::Logs::LogGroup', { RetentionInDays: 30 });
  });
});

describe('IAM (mínimo privilegio)', () => {
  it('el rol no tiene políticas administradas (ni AWSLambdaBasicExecutionRole)', () => {
    const roles = template.findResources('AWS::IAM::Role');
    for (const role of Object.values(roles)) {
      assert.equal(role.Properties.ManagedPolicyArns, undefined);
    }
  });

  it('solo ses:SendEmail sobre la identidad verificada, con FromAddress fijo', () => {
    const policies = Object.values(template.findResources('AWS::IAM::Policy'));
    const statements = policies.flatMap((p) => p.Properties.PolicyDocument.Statement);
    const ses = statements.filter((s) => JSON.stringify(s.Action).includes('ses:'));
    assert.equal(ses.length, 1);
    assert.equal(ses[0].Action, 'ses:SendEmail');
    assert.match(
      JSON.stringify(ses[0].Resource),
      new RegExp(`:identity/${EMAIL.replace('.', '\\.')}`),
    );
    assert.deepEqual(ses[0].Condition, { StringEquals: { 'ses:FromAddress': EMAIL } });
  });

  it('ninguna acción ni recurso con comodín total', () => {
    const policies = Object.values(template.findResources('AWS::IAM::Policy'));
    const statements = policies.flatMap((p) => p.Properties.PolicyDocument.Statement);
    for (const s of statements) {
      assert.notEqual(s.Resource, '*');
      assert.ok(
        ![s.Action].flat().some((a: string) => a === '*' || a.endsWith(':*')),
        JSON.stringify(s.Action),
      );
    }
  });
});

describe('API Gateway', () => {
  it('una sola ruta: POST /contact', () => {
    const routes = Object.values(template.findResources('AWS::ApiGatewayV2::Route'));
    assert.deepEqual(
      routes.map((r) => r.Properties.RouteKey),
      ['POST /contact'],
    );
  });

  it('CORS restringido al sitio', () => {
    template.hasResourceProperties('AWS::ApiGatewayV2::Api', {
      ProtocolType: 'HTTP',
      CorsConfiguration: {
        AllowOrigins: ORIGINS,
        AllowMethods: ['POST'],
        AllowHeaders: ['content-type'],
      },
    });
  });

  it(`throttling de ${THROTTLE.rateLimit} req/s con ráfaga de ${THROTTLE.burstLimit}`, () => {
    template.hasResourceProperties('AWS::ApiGatewayV2::Stage', {
      StageName: '$default',
      AutoDeploy: true,
      DefaultRouteSettings: Match.objectLike({
        ThrottlingRateLimit: 5,
        ThrottlingBurstLimit: 10,
      }),
    });
  });

  it('expone la URL del endpoint como salida', () => {
    template.hasOutput('ContactEndpoint', {});
  });
});

describe('loadConfig', () => {
  it('exige CONTACT_EMAIL', () => {
    assert.throws(() => loadConfig({}), /CONTACT_EMAIL/);
    assert.throws(() => loadConfig({ CONTACT_EMAIL: 'no-es-correo' }), /CONTACT_EMAIL/);
  });

  it('usa el sitio publicado como origen por defecto', () => {
    assert.deepEqual(loadConfig({ CONTACT_EMAIL: EMAIL }).allowedOrigins, DEFAULT_ALLOWED_ORIGINS);
  });

  it('acepta una lista de orígenes y rechaza los mal formados', () => {
    const cfg = loadConfig({
      CONTACT_EMAIL: EMAIL,
      ALLOWED_ORIGINS: 'https://a.example, http://localhost:4321',
    });
    assert.deepEqual(cfg.allowedOrigins, ['https://a.example', 'http://localhost:4321']);
    for (const bad of ['http://a.example', 'https://a.example/', 'https://a.example/ruta', '*']) {
      assert.throws(
        () => loadConfig({ CONTACT_EMAIL: EMAIL, ALLOWED_ORIGINS: bad }),
        /inválido|Invalid URL/,
        bad,
      );
    }
  });
});
