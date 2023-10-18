import { ValidationPipe, ClassSerializerInterceptor, Logger, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from '@src/app.module';
import RedisStore from 'connect-redis';
import cookieParser from 'cookie-parser';
import express, { Express } from 'express';
import session, { SessionOptions } from 'express-session';
import helmet, { HelmetOptions } from 'helmet';
import http from 'http';
import path from 'path';
import { createClient, RedisClientType } from 'redis';
import { SessionStore } from '@common/types';

export const server: Express = express();
export let application: NestExpressApplication = null;
let redisClient: RedisClientType = null;

async function connectRedis(): Promise<void> {
  const configService: ConfigService = application.get(ConfigService);
  redisClient = createClient(configService.get('redis'));

  await redisClient.connect();
}

async function onDatabaseHandler(): Promise<void> {
  await connectRedis();
}

function createSessionStore(): SessionStore {
  // 720 시간 -> 30일
  const SESSION_COOKIE_MAX_AGE: number = 2592000000;

  const configService: ConfigService = application.get(ConfigService);

  const sessionOptions: SessionOptions = {
    secret: 'afx2vd!03jv(%%&v*%$2',
    resave: false,
    rolling: true,
    saveUninitialized: false,
    store: process.env.NODE_ENV !== 'test' ? new RedisStore({ client: redisClient }) : undefined,
    cookie: {
      secure: ['development', 'production'].includes(process.env.NODE_ENV),
      domain: configService.get('cookieDomain'),
      sameSite: 'strict',
      httpOnly: true,
      maxAge: SESSION_COOKIE_MAX_AGE,
    },
  };

  return {
    userSession: session({ ...sessionOptions, name: 'user.sid' }),
  };
}

function onNetworkHandler(): void {
  const configService: ConfigService = application.get(ConfigService);

  const cors = configService.get('cors');
  if (cors) application.enableCors(cors);

  application.use((request, response, next): void => {
    const helmetOptions: HelmetOptions = {};
    const cspExcludePaths: string[] = configService.get('cspExcludePaths');

    if (cspExcludePaths.includes(request.path)) {
      helmetOptions.contentSecurityPolicy = false;
      helmetOptions.crossOriginEmbedderPolicy = false;
    }

    helmet(helmetOptions)(request, response, next);
  });
}

function onApplicationHandler(): void {
  application.enableShutdownHooks();
}

function onMiddlewareHandler(): void {
  application.use(cookieParser());
  application.useBodyParser('json', { limit: '1mb' });
  application.useStaticAssets(path.join(__dirname, 'public'));
  application.setBaseViewsDir(path.join(__dirname, 'views'));
  application.setViewEngine('ejs');
  application.use((request, response, next): void => {
    if (request.path.startsWith('/admin/')) {
    } else if (request.path.startsWith('/vendor/')) {
    } else {
      const { userSession } = createSessionStore();
      userSession(request, response, next);
    }
  });
  application.disable('etag');
  application.enable('trust proxy');
  application.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: true,
      transform: true,
    }),
  );
  application.useGlobalInterceptors(new ClassSerializerInterceptor(application.get(Reflector)));
}

async function createApplication(): Promise<void> {
  const isLocalEnvironment: boolean = process.env.NODE_ENV === 'localhost';
  application = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    autoFlushLogs: !isLocalEnvironment,
  });
}

function createServer(): void {
  const port: number = Number(process.env.PORT) || 4000;
  const httpServer = http.createServer(server).listen(port, (): void => {
    const address = httpServer.address();
    const bind: string = typeof address === 'string' ? `pipe ${address}` : `port ${address.port}`;
    console.log(`Listening on ${bind}`);
  });
}

async function swaggerInitialize(): Promise<void> {
  if (process.env.NODE_ENV !== 'production') {
  }
}

async function moduleInitialize(): Promise<void> {
  await swaggerInitialize();
}

async function initialize(): Promise<void> {
  await createApplication();
  await createServer();
  await onApplicationHandler();
  await onNetworkHandler();
  await moduleInitialize();
  await onDatabaseHandler();
  await onMiddlewareHandler();
}

export async function startApplication(): Promise<void> {
  await initialize();
  await application.init();
}
