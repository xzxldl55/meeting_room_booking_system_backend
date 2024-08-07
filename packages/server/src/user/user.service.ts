import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginType, User } from './entities/user.entity';
import { Repository, Like } from 'typeorm';
import {
  LoginUserDto,
  RegisterUserDto,
  UpdateUserDto,
  UpdateUserPasswordDto,
} from './user.dto';
import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import md5 from 'src/utils/md5';
import { LoginUserVo, UserInfo } from './user.vo';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtUserData } from './user.type';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);

  // 直接通过 ORM 注入数据库服务对象的 User 表对象
  @InjectRepository(User)
  private userRepository: Repository<User>;

  @InjectRepository(Role)
  private roleRepository: Repository<Role>;

  @InjectRepository(Permission)
  private permissionRepository: Repository<Permission>;

  // 注入 Redis 服务
  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(EmailService)
  private emailService: EmailService;

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(ConfigService)
  private configService: ConfigService;

  async register(user: RegisterUserDto) {
    // 取出存在 redis 中的该用户验证码
    const captcha = await this.redisService.get(`captcha_${user.email}`);

    // ======= 异常边界处理 =========

    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }

    if (user.captcha !== captcha) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }

    const foundUser = await this.userRepository.findOneBy({
      username: user.username,
    });

    if (foundUser) {
      throw new HttpException(
        `用户${user.username}已存在`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // ======= 正常逻辑处理 =========

    /**
     * TypeOrm 有两种模式
     * 1. 是 Active Record 模式，他直接在模型自身内部定义好了所有数据库方法，可以直接只通过模型来操作数据库的增删改查，如下：
     */
    // const newUser = new User();
    // newUser.username = user.username;
    // newUser.password = user.password;
    // newUser.email = user.email;
    // newUser.nickName = user.nickName;
    // await newUser.save();

    /**
     * 2. Data Mapper/Repository 模式，数据映射模式，该模式将方法都统一定义在存储库中，如这里的 this.userRepository 所有操作统一通过存储库进行。
     *
     * 一般来说更加推荐使用这种方式，
     *    因为他更加可控，在模型 （model）与数据库在耦合的背景下，从操作类型上进行了拆分，模型仅负责数据的定义与限制，而真正的数据库操作则放到存储库上进行。
     *    而 Active Record 将会使得模型与存储库同时混合工作，你将无法知道他们具体的工作内容划分。
     */
    const newUser = this.userRepository.create(user);

    try {
      // 利用 ORM 保存用户到数据库
      await this.userRepository.save(newUser);

      await this.redisService.del(`captcha_${user.email}`);
      return '注册成功';
    } catch (e) {
      this.logger.error(e, UserService);
      return '注册失败';
    }
  }

  async registerByGithubInfo(id: number, username: string, headPic: string) {
    const user = new User();
    user.id = id;
    user.username = username + Math.random().toString().slice(2, 8);
    user.headPic = headPic;
    user.nickName = username;
    user.loginType = LoginType.GITHUB;
    user.isAdmin = false;
    user.password = Math.random().toString().slice(2, 8);
    user.email = ''; // github 登录进来的没有 email 信息，默认置为空值，用户登录后自行修改

    return this.userRepository.save(user);
  }

  async registerByGoogleInfo(email: string, nickName: string, headPic: string) {
    const newUser = new User();
    newUser.email = email;
    newUser.nickName = nickName;
    newUser.headPic = headPic;
    newUser.password = '';
    newUser.username = email + Math.random().toString().slice(2, 10);
    newUser.loginType = LoginType.GOOGLE;
    newUser.isAdmin = false;

    return this.userRepository.save(newUser);
  }

  async captcha(
    address: string,
    prefix: string,
    checkOccupied?: boolean,
    subject?: string,
    html?: (code: string) => string,
  ) {
    const code = Math.random().toString().slice(2, 8);

    // 是否检查邮箱占用情况
    if (checkOccupied) {
      const user = await this.userRepository.findOneBy({
        email: address,
      });
      if (user) {
        return '当前邮箱已被占用';
      }
    }

    try {
      // 将随机生成验证码存到 redis
      await this.redisService.set(`${prefix}${address}`, code, 5 * 60);

      // 发送邮件
      await this.emailService.sendMail({
        to: address,
        subject: subject || '验证码',
        html: html(code) || `<h2>您的验证码是 ${code} </h2>`,
      });

      return '发送成功';
    } catch (e) {
      this.logger.error(e, UserService);
      throw new HttpException('发送验证码失败', HttpStatus.BAD_REQUEST);
    }
  }

  async login(loginUser: LoginUserDto, isAdmin = false) {
    const user = await this.userRepository.findOne({
      where: {
        username: loginUser.username,
        loginType: LoginType.LOCAL,
        isAdmin,
      },
      relations: ['roles', 'roles.permissions'], // 级联查询 roles 和 roles.permissions
    });

    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }

    if (user.password !== md5(loginUser.password)) {
      throw new HttpException('密码错误', HttpStatus.BAD_REQUEST);
    }

    const userInfo: UserInfo = {
      id: user.id,
      username: user.username,
      nickName: user.nickName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      headPic: user.headPic,
      createTime: user.createTime.getTime(),
      isFrozen: user.isFrozen,
      isAdmin: user.isAdmin,
      roles: user.roles.map((v) => v.name),
      permissions: user.roles.reduce((arr, item) => {
        item.permissions.forEach((permission) => {
          if (arr.indexOf(permission) === -1) {
            arr.push(permission);
          }
        });
        return arr;
      }, []),
    };

    return this._genJWTUserInfo(userInfo);
  }

  _genJWTUserInfo(userInfo: UserInfo) {
    const vo = new LoginUserVo();

    vo.userInfo = userInfo;

    // 使用 JWT 生成 Token 参与后续接口认证识别
    vo.accessToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        roles: vo.userInfo.roles,
        permissions: vo.userInfo.permissions,
        email: vo.userInfo.email,
      },
      {
        expiresIn: this.configService.get('jwt_access_token_expires_time'),
      },
    );

    vo.refreshToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
      },
      {
        expiresIn: this.configService.get('jwt_refresh_token_expires_time'),
      },
    );

    return vo;
  }

  async genTokenByRefreshToken(_refreshToken: string, isAdmin: boolean) {
    try {
      const data = this.jwtService.verify(_refreshToken);

      const user = await this.userRepository.findOne({
        where: {
          id: data.userId,
          isAdmin,
        },
        relations: ['roles', 'roles.permissions'],
      });

      const jwtData: JwtUserData = {
        userId: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles.map((v) => v.name),
        permissions: user.roles.reduce((arr, item) => {
          item.permissions.forEach((permission) => {
            if (arr.indexOf(permission) === -1) {
              arr.push(permission);
            }
          });
          return arr;
        }, []),
      };

      const accessToken = this.jwtService.sign(jwtData, {
        expiresIn: this.configService.get('jwt_access_token_expires_time'),
      });

      const refreshToken = this.jwtService.sign(
        {
          userId: user.id,
        },
        {
          expiresIn: this.configService.get('jwt_refresh_token_expires_time'),
        },
      );

      return {
        accessToken,
        refreshToken,
      };
    } catch (e) {
      throw new UnauthorizedException('token 失效，重新登录');
    }
  }

  async findUserDetailById(userId: number) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      return;
    }

    const detailVo: UserInfo = {
      id: user.id,
      username: user.username,
      nickName: user.nickName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      headPic: user.headPic,
      createTime: user.createTime.getTime(),
      isFrozen: user.isFrozen,
      isAdmin: user.isAdmin,
      roles: user?.roles?.map((v) => v.name) || [],
      permissions:
        user?.roles?.reduce((arr, item) => {
          item.permissions.forEach((permission) => {
            if (arr.indexOf(permission) === -1) {
              arr.push(permission);
            }
          });
          return arr;
        }, []) || [],
    };

    return detailVo;
  }

  async findUserDetailByEmail(email: string) {
    const user = await this.userRepository.findOneBy({
      email,
    });

    if (!user) {
      return;
    }

    const detailVo: UserInfo = {
      id: user.id,
      username: user.username,
      nickName: user.nickName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      headPic: user.headPic,
      createTime: user.createTime.getTime(),
      isFrozen: user.isFrozen,
      isAdmin: user.isAdmin,
      roles: user.roles.map((v) => v.name),
      permissions: user.roles.reduce((arr, item) => {
        item.permissions.forEach((permission) => {
          if (arr.indexOf(permission) === -1) {
            arr.push(permission);
          }
        });
        return arr;
      }, []),
    };

    return detailVo;
  }

  async updatePassword(passwordDto: UpdateUserPasswordDto) {
    const captcha = await this.redisService.get(
      `update_password_captcha_${passwordDto.email}`,
    );

    if (!captcha) {
      throw new HttpException('验证码失效', HttpStatus.BAD_REQUEST);
    }

    if (passwordDto.captcha !== captcha) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }

    const foundUser = await this.userRepository.findOneBy({
      email: passwordDto.email,
    });

    foundUser.password = passwordDto.password;

    try {
      await this.userRepository.save(foundUser);
      await this.redisService.del(
        `update_password_captcha_${passwordDto.email}`,
      );
      return '修改成功';
    } catch (e) {
      this.logger.error(e, UserService);
      return '修改失败';
    }
  }

  async update(
    userId: number,
    email: string,
    { headPic, nickName, captcha }: UpdateUserDto,
  ) {
    const code = await this.redisService.get(`update_user_captcha_${email}`);
    if (code !== captcha) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }

    const foundUser = await this.userRepository.findOneBy({
      id: userId,
    });

    foundUser.headPic = headPic || foundUser.headPic;
    foundUser.nickName = nickName || foundUser.nickName;

    try {
      await this.userRepository.save(foundUser);
      await this.redisService.del(`update_user_captcha_${email}`);
      return '用户信息修改成功';
    } catch (e) {
      this.logger.error(e, UserService);
      return '用户信息修改失败';
    }
  }

  async freezeUserById(userId: number) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }

    user.isFrozen = true;

    try {
      await this.userRepository.save(user);
      return '冻结成功';
    } catch (e) {
      this.logger.error(e, UserService);
      return '冻结失败';
    }
  }

  async findUsersByPage(
    pageIndex: number,
    pageSize: number,
    username = '',
    nickName = '',
  ) {
    try {
      const conditions: Record<string, any> = {};
      username && (conditions.username = Like(`%${username}%`));
      nickName && (conditions.nickName = Like(`%${nickName}%`));

      const [list, total] = await this.userRepository.findAndCount({
        where: conditions,
        skip: (pageIndex - 1) * pageSize,
        take: pageSize,
        select: [
          'id',
          'username',
          'nickName',
          'email',
          'phoneNumber',
          'isFrozen',
          'headPic',
          'createTime',
        ],
      });
      return {
        list,
        pageIndex,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      };
    } catch (e) {
      this.logger.error(e, UserService);
      return '查询失败';
    }
  }
}
