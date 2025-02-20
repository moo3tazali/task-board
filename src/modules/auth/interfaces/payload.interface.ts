import { Role } from '@prisma/client';

export class Payload {
  sub: string;
  username: string;
  email: string;
  avatarPath: string;
  roles: Role[];
}
