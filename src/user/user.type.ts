import { Permission } from './entities/permission.entity';

export interface JwtUserData {
  userId: number;
  username: string;
  roles: string[];
  permissions: Permission[];
}
