import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class GetAuthEmailReqDto {
  @IsEmail()
  @ApiProperty({ format: 'email' })
  email: string;
}
