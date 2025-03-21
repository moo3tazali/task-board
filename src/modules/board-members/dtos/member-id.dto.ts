import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class MemberIdDto {
  /**
   * memberId should be a valid UUID
   * @example '6006b460-46b6-451b-b07d-59d15a38657f'
   */
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  memberId: string;
}
