import { DatabaseService } from '@app/database/database.service';
import { MigrationModule } from '@app/database/migration/migration.module';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

const Entities = '@entities';
/**
 * @description
 * Only development, production database migration
 */
export const MigrationDataSource: Promise<DataSource> = (async (): Promise<DataSource> => {
  const app: INestApplication<any> = await NestFactory.create(MigrationModule, {
    bufferLogs: true,
  });
  const configService = app.get(ConfigService);
  const dbService: DatabaseService = app.get(DatabaseService);
  const configOptions = configService.get('database');
  const options = await dbService.createTypeOrmOptions(configOptions);

  return new DataSource({ ...options, entities: Object.values(Entities) });
})();
