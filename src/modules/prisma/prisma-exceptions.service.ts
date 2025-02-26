import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaExceptionOptions } from './interfaces';

@Injectable()
export class PrismaExceptionsService {
  /**
   * Handles prisma known request errors.
   * Unique constraint violations (P2002), throw conflict exception (409).
   * Foreign key constraint violations (P2003), throw bad request exception (400).
   * Record not found errors (P2025), throw not found exception (404).
   */
  public async handle<T>(
    fn: () => Promise<T>,
    options?: PrismaExceptionOptions,
  ) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        const code = error.code;
        const causes = (error.meta?.target as string[]) || [];
        const cause = options?.field || causes.reverse().join('_');
        const errorMsg = this.getErrorMessage(error.code, cause);
        const message = options?.message || errorMsg;

        this.throwPrismaException(code, message, cause);
      }
      throw new InternalServerErrorException(
        'unknown database error',
      );
    }
  }

  private getErrorMessage(code: string, cause: string): string {
    switch (code) {
      case 'P2002':
        return `${cause} field already exists`.trim();
      case 'P2003':
        return `${cause} foreign key reference is invalid`.trim();
      case 'P2025':
        return `${cause} record not found`.trim();
      default:
        return 'unknown database error';
    }
  }

  private throwPrismaException(
    code: string,
    message: string,
    cause?: string,
  ): never {
    switch (code) {
      case 'P2002':
        throw new ConflictException(message, { cause });
      case 'P2003':
        throw new BadRequestException(message, { cause });
      case 'P2025':
        throw new NotFoundException(message, { cause });
      default:
        throw new InternalServerErrorException(message);
    }
  }
}
