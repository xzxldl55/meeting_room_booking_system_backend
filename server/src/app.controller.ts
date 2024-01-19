import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { GetUserParam, RequireLogin, RequirePermission } from './decorators';

@Controller()
@RequireLogin()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('access-home')
  @RequirePermission('access_home')
  accessHome(@GetUserParam('username') username: string) {
    return 'This is Home.' + username;
  }
}
