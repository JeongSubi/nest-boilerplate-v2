import { IsOptional, IsString, IsUrl, Length } from 'class-validator';
import { Column, Entity } from 'typeorm';
import { CoreEntity } from '@entities/core.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'content' })
export class Content extends CoreEntity {
  @ApiProperty({ minLength: 1, maxLength: 10 })
  @IsString()
  @Length(1, 10)
  @Column({ length: 10, comment: '제목' })
  title: string;

  @ApiProperty({ minLength: 1, maxLength: 10 })
  @IsString()
  @Length(1, 10)
  @Column({ name: 'sub_title', length: 10, comment: '부제목' })
  subTitle?: string;

  @ApiProperty({ minLength: 1, maxLength: 200 })
  @IsString()
  @Length(1, 200)
  @Column({ length: 200, comment: '설명' })
  description: string;

  @ApiProperty({ format: 'url', required: false })
  @IsUrl()
  @IsOptional()
  @Column({
    name: 'image',
    nullable: true,
    comment: '이미지',
  })
  image: string;

  constructor(partial: Partial<Content>) {
    super();

    Object.assign(this, partial);
  }
}
