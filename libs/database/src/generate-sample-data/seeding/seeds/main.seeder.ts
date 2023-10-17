import { User } from '@entities/user.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export default class MainSeeder implements Seeder {
  async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
    const NUMBER_OF_DATA_TO_CREATE: number = 50;

    const userFactory = factoryManager.get(User);
    await userFactory.saveMany(NUMBER_OF_DATA_TO_CREATE);
  }
}
