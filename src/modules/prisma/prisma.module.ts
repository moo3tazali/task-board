import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaExceptionsService } from './prisma-exceptions.service';

@Global()
@Module({
  providers: [PrismaService, PrismaExceptionsService],
  exports: [PrismaService, PrismaExceptionsService],
})
export class PrismaModule {}
