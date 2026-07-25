import { Module } from '@nestjs/common';
import { SystemController } from '@app/system/system.controller';
import { SystemService } from '@app/system/system.service';

@Module({
  controllers: [SystemController],
  providers: [SystemService],
  exports: [SystemService],
})
export class SystemModule {}
