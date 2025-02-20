import { validate } from 'class-validator';
import { CreateUserDto } from './user.dto';

describe('CreateUserDto', () => {
  let dto = new CreateUserDto();

  beforeEach(() => {
    dto = new CreateUserDto();
    dto.name = 'test';
    dto.email = 'test@test.com';
    dto.password = '123456';
  });

  it('should validate complete valid data', async () => {
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail on invalid email', async () => {
    dto.email = 'test';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('isEmail');
  });
});
