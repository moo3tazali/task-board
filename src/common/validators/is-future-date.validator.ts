import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

/**
 * Custom validator to check if the date is in the future (at least 1 hour ahead)
 */
@ValidatorConstraint({ name: 'isFutureDate', async: false })
class IsFutureDateConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    const date = new Date(value);

    if (isNaN(date.getTime())) return false;

    const tenMinutesAhead = new Date(Date.now() + 10 * 60 * 1000);
    return date > tenMinutesAhead;
  }

  defaultMessage() {
    return 'dueDate must be in the future (UTC).';
  }
}

/**
 * Custom decorator for future date validation
 */
export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsFutureDateConstraint,
    });
  };
}
