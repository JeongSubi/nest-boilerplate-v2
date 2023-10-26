import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Content } from '@entities/content.entity';

@Injectable()
export class ContentsRepository extends Repository<Content> {
  constructor(dataSource: DataSource) {
    super(Content, dataSource.createEntityManager());
  }
}
