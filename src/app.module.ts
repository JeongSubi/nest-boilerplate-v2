import { AwsModule } from '@app/aws/aws.module';
import { AwsService } from '@app/aws/aws.service';
import { DatabaseModule } from '@app/database/database.module';
import { DatabaseService } from '@app/database/database.service';
import { LoggerModule } from '@app/logger/logger.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from '@src/app.controller';
import configuration from '@src/config/index';
import Joi from 'joi';
import { UsersModule } from '@modules/users/users.module';
import { User } from '@entities/user.entity';
import { AuthModule } from '@modules/auth/auth.module';
import { ContentsModule } from '@modules/contents/contents.module';
import { Content } from '@entities/content.entity';
import { AuthenticationGuard } from '@guards/authentication.guard';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { UsersRepository } from '@repositories/users.repository';
import { ContentsRepository } from '@repositories/contents.repository';
import { AuthorizationGuard } from '@guards/authorization.guard';
import { ResponseInterceptor } from '@app/middlewares/interceptors/response.interceptor';
import { HttpExceptionFilter } from '@app/middlewares/filters/http-exception.filter';
import { JwtModule, JwtModuleOptions } from '@libs/jwt/src';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'localhost')
          .default('development'),
        PORT: Joi.number().default(4000),
      }),
    }),
    LoggerModule.register({ level: process.env.NODE_ENV === 'production' ? 'info' : 'debug' }),
    JwtModule.forRootAsync({
      imports: [AwsModule],
      inject: [ConfigService, AwsService],
      useFactory: async (
        configService: ConfigService,
        awsService: AwsService,
      ): Promise<JwtModuleOptions> => {
        const rsa = configService.get('aws.secrets.rsa');
        const privateKey = (await awsService.getSecretValue(rsa.private)) ?? 'privateKey';
        const publicKey = (await awsService.getSecretValue(rsa.public)) ?? 'publicKey';
        return { privateKey, publicKey };
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [DatabaseModule, AwsModule],
      inject: [DatabaseService, ConfigService, AwsService],
      useFactory: async (
        dbService: DatabaseService,
        configService: ConfigService,
        awsService: AwsService,
      ): Promise<TypeOrmModuleOptions> => {
        let options = configService.get('database');
        const secretName = configService.get('aws.secrets.rds');
        const { username, password, host, dbname, port } =
          (await awsService.getSecretValue(secretName)) ?? options;
        options = { host, port, username, password, database: dbname, ...options };
        const ret = await dbService.createTypeOrmOptions(options);
        return { ...ret, entities: [`${__dirname}/entities/*.entity{.ts,.js}`] };
      },
    }),
    TypeOrmModule.forFeature([User, Content]),
    UsersModule,
    AuthModule,
    ContentsModule,
  ],
  controllers: [AppController],
  providers: [
    UsersRepository,
    ContentsRepository,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthorizationGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
