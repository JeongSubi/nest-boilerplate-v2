import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule, OpenAPIObject } from '@nestjs/swagger';
import basicAuth from 'express-basic-auth';
import { UsersModule } from '@modules/users/users.module';
import { ContentsModule } from '@modules/contents/contents.module';
import { AuthModule } from '@modules/auth/auth.module';

export default async function (app: INestApplication): Promise<void> {
  if (process.env.NODE_ENV === 'localhost' || process.env.NODE_ENV === 'development') {
    const packageJson = await import('../package.json');
    const swaggerConfig = app.get(ConfigService).get('swagger');

    app.use(
      '/swagger',
      basicAuth({
        users: { [swaggerConfig.id]: swaggerConfig.password },
        challenge: true,
        realm: `${packageJson.name} ${process.env.NODE_ENV}`,
      }),
    );

    const description = `- [${packageJson.name} sample API](/swagger)\n`;

    const userConfig = new DocumentBuilder()
      .setTitle(`${packageJson.name} sample API`)
      .setDescription(description)
      .setVersion(packageJson.version)
      .setExternalDoc('swagger.json', '/swagger-json')
      .addSecurity('cookieAuth', {
        type: 'apiKey',
        in: 'cookie',
        name: 'session.id',
      })
      .build();

    const userDoc: OpenAPIObject = SwaggerModule.createDocument(app, userConfig, {
      include: [UsersModule, ContentsModule, AuthModule],
      deepScanRoutes: true,
      ignoreGlobalPrefix: true,
    });
    SwaggerModule.setup('/swagger', app, userDoc);
  }
}
