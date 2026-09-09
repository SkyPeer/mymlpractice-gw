import { Controller, Get, Header, UseGuards } from '@nestjs/common';
import { SystemService } from '@app/system/system.service';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { AdminGuard } from '@app/user/guards/admin.guard';

@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  // Current memory and CPU usage of the process
  @Get()
  @UseGuards(AuthGuard, AdminGuard)
  @Header('Cache-Control', 'no-store')
  // @UseGuards(AuthGuard)
  getUsage() {
    return this.systemService.usage;
  }
}
