import { IsObject, IsString, IsUrl } from 'class-validator';

export class GetFilesUploadResDto {
  @IsString()
  path: string;

  @IsUrl()
  url: string;

  @IsObject()
  fields: Record<string, string>;

  constructor(partial: Partial<GetFilesUploadResDto>) {
    Object.assign(this, partial);
  }
}
