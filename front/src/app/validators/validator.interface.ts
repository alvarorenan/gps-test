export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface IValidator<T> {
  validate(value: T): ValidationResult;
}

export class ValidationResultHelper {
  static success(): ValidationResult {
    return { isValid: true, errors: [] };
  }
  
  static failure(...errors: string[]): ValidationResult {
    return { isValid: false, errors };
  }
}
