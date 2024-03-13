import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  LoginUserDto,
  RegisterUserDto,
  UpdateUserDto,
  UpdateUserPasswordDto,
} from './user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { GetUserParam, RequireLogin } from 'src/decorators';
import { ParseIntCnPipe } from 'src/pipes/parse-int-cn.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { extname } from 'path';
import { storage } from 'src/utils/file-storage';
import { imageFileExtensions } from 'src/utils/common';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  register(@Body() registerUser: RegisterUserDto) {
    return this.userService.register(registerUser);
  }

  @Get('captcha/register')
  async captcha(@Query('address') address: string) {
    return this.userService.captcha(
      address,
      'captcha_',
      true,
      '注册验证码',
      (code) => `<h2>您的注册验证码是 ${code} </h2>`,
    );
  }

  @Post('login')
  async userLogin(@Body() loginUser: LoginUserDto) {
    return await this.userService.login(loginUser);
  }

  @Post('admin/login')
  async adminLogin(@Body() loginUser: LoginUserDto) {
    return await this.userService.login(loginUser, true);
  }

  @Get('refresh')
  async refresh(@Query('refreshToken') _refreshToken: string) {
    return await this.userService.genTokenByRefreshToken(_refreshToken, false);
  }

  @Get('admin/refresh')
  async adminRefresh(@Query('refreshToken') _refreshToken: string) {
    return await this.userService.genTokenByRefreshToken(_refreshToken, true);
  }

  @Get('info')
  @RequireLogin()
  async info(@GetUserParam('userId') userId: number) {
    return await this.userService.findUserDetailById(userId);
  }

  @Post(['update', 'admin/update'])
  @RequireLogin()
  async update(
    @GetUserParam('userId') userId: number,
    @GetUserParam('email') email: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.update(userId, email, updateUserDto);
  }

  @Get('captcha/update_user')
  @RequireLogin()
  async updateUserCaptcha(@GetUserParam('email') email: string) {
    return this.userService.captcha(
      email,
      'update_user_captcha_',
      false,
      '修改用户信息验证码',
      (code) => `<h2>您的验证码是 ${code}</h2>`,
    );
  }

  @Post(['update_password', 'admin/update_password'])
  async updatePassword(@Body() passwordDto: UpdateUserPasswordDto) {
    return await this.userService.updatePassword(passwordDto);
  }

  @Get('captcha/update_password')
  async updatePasswordCaptcha(@Query('address') address: string) {
    return this.userService.captcha(
      address,
      'update_password_captcha_',
      false,
      '修改密码验证码',
      (code) => `<h2>您的修改密码验证码是 ${code} </h2>`,
    );
  }

  @Get('freeze')
  async freeze(@Query('id') userId: number) {
    return await this.userService.freezeUserById(userId);
  }

  @Get('list')
  @RequireLogin()
  async list(
    @Query('pageIndex', new ParseIntCnPipe({ key: 'pageIndex' }))
    pageIndex: number,
    @Query(
      'pageSize',
      new DefaultValuePipe(10),
      new ParseIntCnPipe({ key: 'pageSize' }),
    )
    pageSize: number,
    @Query('username') username?: string,
    @Query('nickName') nickName?: string,
  ) {
    return await this.userService.findUsersByPage(
      pageIndex,
      pageSize,
      username,
      nickName,
    );
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: 'uploads',
      limits: {
        fileSize: 1024 * 1024 * 3, // 3MB限制
      },
      storage: storage, // 使用自定义的存储设置
      fileFilter(req, file, callback) {
        const type = extname(file.originalname);
        if (imageFileExtensions.includes(type.toLocaleLowerCase())) {
          callback(null, true);
        } else {
          callback(new BadRequestException('只能上传图片'), false);
        }
      },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    console.log('file: ', file);
    return file.path;
  }
}
