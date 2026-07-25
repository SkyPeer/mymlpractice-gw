import { Controller, Get, Header } from '@nestjs/common';
import { SystemService } from '@app/system/system.service';

@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  // Current memory and CPU usage of the process
  @Get()
  @Header('Cache-Control', 'no-store')
  // @UseGuards(AuthGuard)
  getUsage() {
    return this.systemService.usage;
  }
}
