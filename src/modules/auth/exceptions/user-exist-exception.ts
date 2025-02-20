export class UserExistException extends Error {
  constructor() {
    super('User already exist');

    this.name = 'UserExistException';
  }
}
