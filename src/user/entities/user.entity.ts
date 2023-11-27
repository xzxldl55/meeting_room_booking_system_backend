import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Role } from './role.entity';
import md5 from 'src/utils/md5';

@Entity({
  name: 'user',
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 50,
    comment: '用户名',
  })
  username: string;

  @Column({
    length: 50,
    comment: '密码',
  })
  password: string;

  @Column({
    name: 'nick_name',
    length: 50,
    comment: '昵称',
  })
  nickName: string;

  @Column({
    length: 50,
    comment: '邮箱',
  })
  email: string;

  @Column({
    nullable: true,
    comment: '头像',
    type: 'text',
  })
  headPic: string;

  @Column({
    length: 20,
    nullable: true,
    comment: '手机号',
  })
  phoneNumber: string;

  @Column({
    default: false,
    comment: '是否冻结',
  })
  isFrozen: boolean;

  @Column({
    default: false,
    comment: '是否管理员',
  })
  isAdmin: boolean;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_roles',
  })
  roles: Role[];

  // 插入数据前执行函数（将在 repository/manager save 前执行），对密码进行 hash 算法
  @BeforeInsert()
  @BeforeUpdate()
  updatePwdMd5() {
    this.password = md5(this.password);
  }
}
