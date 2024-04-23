import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

const PSW_MIN = 6;
const PSW_MAX = 24;

export class RegisterUserDto {
  @IsNotEmpty({
    message: '用户名不能为空',
  })
  username: string;

  @IsNotEmpty({
    message: '昵称不能为空',
  })
  nickName: string;

  @IsNotEmpty({
    message: '密码不能为空',
  })
  @MinLength(PSW_MIN, {
    message: `密码不能少于 ${PSW_MIN} 位`,
  })
  @MaxLength(PSW_MAX, {
    message: `密码不能多于 ${PSW_MAX} 位`,
  })
  password: string;

  @IsNotEmpty({
    message: '邮箱不能为空',
  })
  email: string;

  @IsNotEmpty({
    message: '验证码不能为空',
  })
  captcha: string;
}

export class LoginUserDto {
  @IsNotEmpty({
    message: '用户名不能为空',
  })
  username: string;

  @IsNotEmpty({
    message: '密码不能为空',
  })
  @MinLength(PSW_MIN, {
    message: `密码不能少于 ${PSW_MIN} 位`,
  })
  @MaxLength(PSW_MAX, {
    message: `密码不能多于 ${PSW_MAX} 位`,
  })
  password: string;
}

export class UpdateUserPasswordDto {
  @IsNotEmpty({
    message: '密码不能为空',
  })
  @MinLength(PSW_MIN, {
    message: `密码不能少于 ${PSW_MIN} 位`,
  })
  @MaxLength(PSW_MAX, {
    message: `密码不能多于 ${PSW_MAX} 位`,
  })
  password: string;

  @IsNotEmpty({
    message: '邮箱不能为空',
  })
  @IsEmail(
    {},
    {
      message: '不是合法的邮箱格式',
    },
  )
  email: string;

  @IsNotEmpty({
    message: '验证码不能为空',
  })
  captcha: string;
}

export class UpdateUserDto {
  headPic: string;

  @IsNotEmpty({
    message: '昵称不能为空',
  })
  nickName: string;

  @IsNotEmpty({
    message: '验证码不能为空',
  })
  captcha: string;
}
