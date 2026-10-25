import { Injectable } from '@nestjs/common';

@Injectable()
export class SubTagService {
  findAll(): string[] {
    return ['Tag1', 'Tag2', 'Tag3'];
  }
}
