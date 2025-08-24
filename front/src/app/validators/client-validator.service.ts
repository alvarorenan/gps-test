import { Injectable, inject } from '@angular/core';
import { IValidator, ValidationResult, ValidationResultHelper } from './validator.interface';
import { CpfValidatorService } from './cpf-validator.service';
import { NameValidatorService } from './name-validator.service';

export interface ClientValidationDto {
  name: string;
  cpf: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientValidatorService implements IValidator<ClientValidationDto> {
  
  private nameValidator = inject(NameValidatorService);
  private cpfValidator = inject(CpfValidatorService);
  
  validate(client: ClientValidationDto): ValidationResult {
    const allErrors: string[] = [];
    
    const nameResult = this.nameValidator.validate(client.name);
    if (!nameResult.isValid) {
      allErrors.push(...nameResult.errors);
    }
    
    const cpfResult = this.cpfValidator.validate(client.cpf);
    if (!cpfResult.isValid) {
      allErrors.push(...cpfResult.errors);
    }
    
    return allErrors.length > 0 ? ValidationResultHelper.failure(...allErrors) : ValidationResultHelper.success();
  }
}
