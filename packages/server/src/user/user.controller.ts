import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
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
import { Express, Response } from 'express';
import { extname } from 'path';
import { storage } from 'src/utils/file-storage';
import { imageFileExtensions } from 'src/utils/common';
import { AuthGuard } from '@nestjs/passport';
import { LoginUserVo, UserInfo } from './user.vo';

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

  // 使用 passport 实现登录（这里调用 local.strategy.ts 的 validate 函数）
  //    user 平台使用 passport 登录，admin 平台还是不用
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async userLogin(@GetUserParam() vo: LoginUserVo) {
    return vo;
  }

  @Post('admin/login')
  async adminLogin(@Body() loginUser: LoginUserDto) {
    return await this.userService.login(loginUser, true);
  }

  // 使用守卫触发跳转 github 登录
  @Get('github/login')
  @UseGuards(AuthGuard('github'))
  async githubLogin() {}

  // 接收 github 登录回调
  @Get('callback/github')
  @UseGuards(AuthGuard('github'))
  async githubRedirect(@Req() req, @Res() res: Response) {
    if (!req.user) {
      throw new BadRequestException('github 登录失败');
    }
    const foundUser = await this.userService.findUserDetailById(req.user.id);

    let userInfo: UserInfo;

    // 已注册过
    if (foundUser) {
      userInfo = foundUser;
    } else {
      // 未注册过
      const { _json: githubProfile } = req.user;

      // 注册账号
      const registerUser = await this.userService.registerByGithubInfo(
        githubProfile.id,
        githubProfile.name,
        githubProfile.avatar_url,
      );

      userInfo = {
        id: registerUser.id,
        username: registerUser.username,
        nickName: registerUser.nickName,
        email: registerUser.email,
        phoneNumber: registerUser.phoneNumber,
        headPic: registerUser.headPic,
        createTime: registerUser.createTime.getTime(),
        isFrozen: registerUser.isFrozen,
        isAdmin: registerUser.isAdmin,
        roles: [],
        permissions: [],
      };
    }

    const vo = this.userService._genJWTUserInfo(userInfo);

    // 通过 cookie 返回认证数据，然后重定向到登录页面提取 cookie 自动登录
    res.cookie('userInfo', JSON.stringify(vo.userInfo));
    res.cookie('accessToken', vo.accessToken);
    res.cookie('refreshToken', vo.refreshToken);
    res.redirect('http://localhost:3000/login?loginType=github');
  }

  // Google登录
  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {}

  @Get('callback/google')
  @UseGuards(AuthGuard('google'))
  async googleRedirect(@Req() req, @Res() res: Response) {
    if (!req.user) {
      throw new BadRequestException('Google 登录失败');
    }

    const foundUser = await this.userService.findUserDetailByEmail(
      req.user.email,
    );

    let userInfo: UserInfo;

    // 已注册过
    if (foundUser) {
      userInfo = foundUser;
    } else {
      // 未注册过
      const { user: googleProfile } = req;

      // 注册账号
      const registerUser = await this.userService.registerByGoogleInfo(
        googleProfile.email,
        googleProfile.firstName + ' ' + googleProfile.lastName,
        googleProfile.picture,
      );

      userInfo = {
        id: registerUser.id,
        username: registerUser.username,
        nickName: registerUser.nickName,
        email: registerUser.email,
        phoneNumber: registerUser.phoneNumber,
        headPic: registerUser.headPic,
        createTime: registerUser.createTime.getTime(),
        isFrozen: registerUser.isFrozen,
        isAdmin: registerUser.isAdmin,
        roles: [],
        permissions: [],
      };
    }

    const vo = this.userService._genJWTUserInfo(userInfo);

    // 通过 cookie 返回认证数据，然后重定向到登录页面提取 cookie 自动登录
    res.cookie('userInfo', JSON.stringify(vo.userInfo));
    res.cookie('accessToken', vo.accessToken);
    res.cookie('refreshToken', vo.refreshToken);
    res.redirect('http://localhost:3000/login?loginType=google');
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
