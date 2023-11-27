import { Permission } from './entities/permission.entity';

interface UserInfo {
  id: number;
  username: string;
  nickName: string;
  email: string;
  headPic: string;
  phoneNumber: string;
  isFrozen: boolean;
  isAdmin: boolean;
  createTime: number;
  roles: string[];
  permissions: Permission[];
}

class LoginUserVo {
  userInfo: UserInfo;

  accessToken: string;

  refreshToken: string;
}

class UserDetailVo {
  id: number;
  username: string;
  nickName: string;
  email: string;
  headPic: string;
  phoneNumber: string;
  isFrozen: boolean;
  createTime: Date;
}

export { UserInfo, LoginUserVo, UserDetailVo };
