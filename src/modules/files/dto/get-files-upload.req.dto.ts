import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsMimeType, IsOptional, Min, MinLength } from 'class-validator';

export enum FileUploadType {
  IMAGE = 'IMAGE',
  FILE = 'FILE',
}

export class GetFilesUploadReqDto {
  @IsEnum(FileUploadType)
  type: FileUploadType;

  @MinLength(1)
  @IsOptional()
  name?: string;

  @IsMimeType()
  mimeType: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  width?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  height?: number;

  constructor(partial: Partial<GetFilesUploadReqDto>) {
    Object.assign(this, partial);
  }
}
