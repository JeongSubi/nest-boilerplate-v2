import { AwsModule } from '@app/aws/aws.module';
import { FilesController } from '@modules/files/files.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [AwsModule],
  controllers: [FilesController],
  providers: [],
})
export class FilesModule {}
