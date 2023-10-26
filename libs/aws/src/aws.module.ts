import { AwsService } from '@app/aws/aws.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [AwsService],
  exports: [AwsService],
})
export class AwsModule {}
