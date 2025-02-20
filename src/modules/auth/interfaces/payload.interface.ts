import { UserRole } from '@prisma/client';

export class Payload {
  sub: string;
  username: string;
  email: string;
  avatarPath: string;
  roles: UserRole[];
}
