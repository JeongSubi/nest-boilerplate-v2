import { DatabaseService } from '@app/database/database.service';
import { GenerateSampleDataModule } from '@app/database/generate-sample-data/generate-sample-data.module';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import path from 'path';
import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { runSeeders } from 'typeorm-extension';

(async (): Promise<void> => {
  /**
   * @description
   * Generate Localhost env sample data (for DataBase)
   */

  const app: INestApplication<any> = await NestFactory.create(GenerateSampleDataModule, {
    bufferLogs: true,
  });
  const configService = app.get(ConfigService);
  const options = configService.get('database');

  if (options.host !== 'localhost' || process.env.NODE_ENV !== 'localhost') {
    throw new Error('Your Env is not localhost');
  }

  const dbService: DatabaseService = app.get(DatabaseService);
  const dataSourceOptions: DataSourceOptions = (await dbService.createTypeOrmOptions(
    options,
  )) as DataSourceOptions;

  try {
    await runSeeders(new DataSource(dataSourceOptions), {
      seeds: [
        path.join(
          'libs',
          'database',
          'src',
          'generate-sample-data',
          'seeding',
          'seeds',
          '**',
          '*.ts',
        ),
      ],
      factories: [
        path.join(
          'libs',
          'database',
          'src',
          'generate-sample-data',
          'seeding',
          'factories',
          '**',
          '*.ts',
        ),
      ],
    });

    console.log('success generate sample data');
    process.exit(0);
  } catch (error: unknown) {
    console.error(`failed generate sample data ${error}`);
    process.exit(1);
  }
})();
