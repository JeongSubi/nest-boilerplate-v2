import { AwsService } from '@app/aws/aws.service';
import { GetFilesUploadReqDto } from '@modules/files/dto/get-files-upload.req.dto';
import { GetFilesUploadResDto } from '@modules/files/dto/get-files-upload.res.dto';
import { PostFilesUploadReqDto } from '@modules/files/dto/post-files-upload.req.dto';
import { PostFilesUploadResDto } from '@modules/files/dto/post-files-upload.res.dto';
import { Public } from '@decorators/public.decorator';
import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import mime from 'mime-types';
import { v4 as uuid } from 'uuid';

@Public()
@ApiTags('파일 업로드')
@Controller('files')
export class FilesController {
  constructor(private awsService: AwsService) {}

  @Post('upload')
  @ApiOperation({ summary: '임시 파일 저장' })
  @ApiResponse({ status: 201, type: PostFilesUploadResDto })
  async postUpload(@Body() data: PostFilesUploadReqDto): Promise<PostFilesUploadResDto> {
    const url = await this.awsService.copyTempObject(data.path, `${data.type}s/${data.kind}`);

    return { url };
  }

  @Get('upload')
  @ApiOperation({ summary: 'Get pre-signed url' })
  @ApiResponse({ status: 200, type: GetFilesUploadResDto })
  async getUpload(@Query() params: GetFilesUploadReqDto): Promise<GetFilesUploadResDto> {
    const { mimeType, name, type, width, height } = params;
    const extensions = mime.extensions[mimeType];

    if (type === 'IMAGE' && !mimeType.startsWith('image/')) {
      throw new BadRequestException('bad_mimeType');
    }

    const key: string = name ? `${uuid()}/${name}` : `${uuid()}.${extensions[0]}`;

    return await this.awsService.generatePreSignedUrl(params.type, key, { width, height });
  }
}
