import { SetMetadata } from '@nestjs/common';
import { BoardPermission } from '@prisma/client';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: BoardPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
