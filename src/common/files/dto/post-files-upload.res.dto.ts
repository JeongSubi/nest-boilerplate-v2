import { IsUrl } from 'class-validator';

export class PostFilesUploadResDto {
  @IsUrl()
  url: string;

  constructor(partial: Partial<PostFilesUploadResDto>) {
    Object.assign(this, partial);
  }
}
