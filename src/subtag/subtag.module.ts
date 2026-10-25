import { Module } from '@nestjs/common';
import { SubTagController } from '@app/subtag/subtag.controller';
import { SubTagService } from '@app/subtag/subtag.service';

@Module({
  controllers: [SubTagController],
  providers: [SubTagService],
  // exports: [SubTagService],
})
export class SubTagModule {}
