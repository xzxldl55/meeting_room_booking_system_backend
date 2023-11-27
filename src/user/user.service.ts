import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
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
import { LoginUserVo, UserDetailVo } from './user.vo';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtUserData } from './user.type';
import { isEmail } from 'class-validator';

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

    const newUser = new User(); // 实例化 DTO 对象
    newUser.username = user.username;
    newUser.password = user.password;
    newUser.email = user.email;
    newUser.nickName = user.nickName;

    try {
      // 利用 ORM 保存用户到数据库
      await this.userRepository.save(newUser);
      return '注册成功';
    } catch (e) {
      this.logger.error(e, UserService);
      return '注册失败';
    }
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
      return '发送验证码失败';
    }
  }

  async login(loginUser: LoginUserDto, isAdmin = false) {
    const user = await this.userRepository.findOne({
      where: {
        username: loginUser.username,
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

    const vo = new LoginUserVo();

    vo.userInfo = {
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

    vo.accessToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        roles: vo.userInfo.roles,
        permissions: vo.userInfo.permissions,
      },
      {
        expiresIn:
          this.configService.get('jwt_access_token_expires_time') || '30m',
      },
    );

    vo.refreshToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
      },
      {
        expiresIn:
          this.configService.get('jwt_refresh_token_expires_time') || '1d',
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
        expiresIn:
          this.configService.get('jwt_access_token_expires_time') || '30m',
      });

      const refreshToken = this.jwtService.sign(
        {
          userId: user.id,
        },
        {
          expiresIn:
            this.configService.get('jwt_refresh_token_expires_time') || '1d',
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
    try {
      const user = await this.userRepository.findOneBy({
        id: userId,
      });

      const detailVo = new UserDetailVo();
      detailVo.id = user.id;
      detailVo.username = user.username;
      detailVo.nickName = user.nickName;
      detailVo.email = user.email;
      detailVo.phoneNumber = user.phoneNumber;
      detailVo.headPic = user.headPic;
      detailVo.createTime = user.createTime;
      detailVo.isFrozen = user.isFrozen;

      return detailVo;
    } catch (e) {
      return '未查询到该用户信息';
    }
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
      return '修改成功';
    } catch (e) {
      this.logger.error(e, UserService);
      return '修改失败';
    }
  }

  async update(userId: number, { email, headPic, nickName }: UpdateUserDto) {
    const foundUser = await this.userRepository.findOneBy({
      id: userId,
    });

    if (email && !isEmail(email)) {
      throw new HttpException('邮箱格式非法', HttpStatus.BAD_REQUEST);
    }

    foundUser.headPic = headPic || foundUser.headPic;
    foundUser.email = email || foundUser.email;
    foundUser.nickName = nickName || foundUser.nickName;

    try {
      await this.userRepository.save(foundUser);
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
      const [list, total] = await this.userRepository.findAndCount({
        where: {
          username: Like(`%${username}%`),
          nickName: Like(`%${nickName}%`),
        },
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
