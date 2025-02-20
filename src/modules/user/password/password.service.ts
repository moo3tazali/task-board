import * as argon from 'argon2';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordService {
  public async hash(password: string): Promise<string> {
    return argon.hash(password);
  }

  public async verify(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return argon.verify(hash, password);
  }
}
