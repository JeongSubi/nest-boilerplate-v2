import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Patch,
  Post,
  Query,
  Req,
  Res,
  Session,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from '@modules/users/users.service';
import { Auth, Public } from '@src/decorators';
import { RequestType, SessionInputData, SessionItem } from '@common/types';
import { PostAuthRegisterResDto } from '@modules/auth/dto/res/post-auth-register.res.dto';
import { PostAuthRegisterReqDto } from '@modules/auth/dto/req/post-auth-register.req.dto';
import { GetUserResDto } from '@modules/users/dto/res/get-user.res.dto';
import { PostAuthResDto } from '@modules/auth/dto/res/post-auth.res.dto';
import { PostAuthReqDto } from '@modules/auth/dto/req/post-auth.req.dto';
import { Response } from 'express';
import { PutAuthReqDto } from '@modules/auth/dto/req/put-auth.req.dto';
import { GetAuthEmailReqDto } from '@modules/auth/dto/req/get-auth-email.req.dto';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: '이메일 회원가입' })
  @ApiResponse({ status: HttpStatus.CREATED, type: PostAuthRegisterResDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  async postRegister(
    @Req() request: RequestType,
    @Session() session: SessionItem,
    @Body() data: PostAuthRegisterReqDto,
  ): Promise<PostAuthRegisterResDto> {
    const userId: string = await this.authService.register(data);
    const user: GetUserResDto = await this.usersService.findOne(userId);
    this.setSession(user, session, request, false);

    return user;
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: '로그인' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: HttpStatus.OK, type: PostAuthResDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'invalid_account - 계정불일치' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'reset_password_required - 계정 이전으로 비밀번호 재설정 필요함.',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'not_found - 계정없음' })
  async postAuth(
    @Req() request: RequestType,
    @Session() session: SessionItem,
    @Body() data: PostAuthReqDto,
  ): Promise<PostAuthResDto> {
    const { id: userId, salt } = await this.authService.validateUserByEmail(
      data.email,
      data.password,
    );

    const user: GetUserResDto = await this.usersService.findOne(userId);

    this.setSession({ ...user, salt }, session, request, data.remember);
    return user;
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: HttpStatus.OK })
  @ApiOperation({ summary: '로그아웃' })
  logout(@Res() response: Response, @Session() session: SessionItem): void {
    session.destroy((): void => {
      response.status(HttpStatus.OK).send();
    });
  }

  @Patch('change-password')
  @Auth({ type: 'user' })
  @ApiOperation({ summary: '패스워드 변경' })
  @ApiResponse({ status: HttpStatus.OK })
  async patchAuth(@Session() session: SessionItem, @Body() data: PutAuthReqDto): Promise<void> {
    session.salt = await this.authService.changePassword({ ...data, userId: session.userId });
  }

  @Public()
  @Get('confirm-duplicate-email')
  @ApiOperation({ summary: '이메일 중복 확인' })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: '이메일 중복' })
  async getEmail(@Query() params: GetAuthEmailReqDto): Promise<boolean> {
    return await this.authService.verifyDuplicate(params.email);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: '로그인 세션 확인' })
  @ApiResponse({ status: HttpStatus.OK, type: PostAuthResDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '세션 유저 아이디 정보 없음' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: '세션 만료' })
  async getAuth(@Session() session: SessionItem): Promise<PostAuthResDto> {
    if (!session.userId) {
      throw new NotFoundException('not_found_session_user_id');
    }

    const user: GetUserResDto = await this.usersService.findOne(session.userId);

    if (user) return user;
    else if (session.userId) {
      session.destroy((): void => {
        new UnauthorizedException('invalid_session');
      });
    }
  }

  private setSession(
    data: SessionInputData,
    session: SessionItem,
    request: RequestType,
    remember: boolean,
  ): void {
    // 10분
    const SESSION_COOKIE_MAX_AGE: number = 600000;

    if (data.salt) session.salt = data.salt;
    session.userId = data.id;
    session.type = 'user';
    session.clientIp = request.ip;
    session.useragent = request.headers['user-agent'];

    if (!remember) request.session.cookie.maxAge = SESSION_COOKIE_MAX_AGE;
  }
}
