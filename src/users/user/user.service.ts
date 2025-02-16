import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '../entities';
import { PasswordService } from '../password/password.service';
import { CreateUserDto } from '../dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly passwordService: PasswordService,
  ) {}

  public async createUser(userDto: CreateUserDto): Promise<User> {
    const { password, ...rest } = userDto;

    const passwordHash = await this.passwordService.hash(password);

    const user = this.userRepository.create({
      ...rest,
      passwordHash,
    });

    return this.userRepository.save(user);
  }

  public async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  public async findOneById(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  public async findOneByUsername(
    username: string,
  ): Promise<User | null> {
    return this.userRepository.findOneBy({ username });
  }
}
