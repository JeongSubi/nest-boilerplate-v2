import { FileUploadType } from '@modules/files/dto/get-files-upload.req.dto';
import { IsEnum, IsString } from 'class-validator';

export enum PostFilesUploadReqDtoKind {
  USER = 'USER',
  BANNER = 'BANNER',
  POST = 'POST',
  SERVICE = 'SERVICE',
  PROGRAM = 'PROGRAM',
  PRODUCT = 'PRODUCT',
  ETC = 'ETC',
}

export class PostFilesUploadReqDto {
  @IsEnum(FileUploadType)
  type: FileUploadType;

  @IsEnum(PostFilesUploadReqDtoKind)
  kind: PostFilesUploadReqDtoKind;

  @IsString()
  path: string;

  constructor(partial: Partial<PostFilesUploadReqDto>) {
    Object.assign(this, partial);
  }
}
