import { Injectable } from '@angular/core';
import { IValidator, ValidationResult, ValidationResultHelper } from './validator.interface';

@Injectable({
  providedIn: 'root'
})
export class NameValidatorService implements IValidator<string> {
  
  validate(name: string): ValidationResult {
    const errors: string[] = [];
    
    if (!name || !name.trim()) {
      errors.push('Nome é obrigatório');
    } else {
      const trimmedName = name.trim();
      
      if (trimmedName.length < 2) {
        errors.push('Nome deve ter pelo menos 2 caracteres');
      }
      
      if (trimmedName.length > 100) {
        errors.push('Nome deve ter no máximo 100 caracteres');
      }
    }
    
    return errors.length > 0 ? ValidationResultHelper.failure(...errors) : ValidationResultHelper.success();
  }
}
