import { Injectable } from '@angular/core';
import { IValidator, ValidationResult, ValidationResultHelper } from './validator.interface';

@Injectable({
  providedIn: 'root'
})
export class CpfValidatorService implements IValidator<string> {
  
  validate(cpf: string): ValidationResult {
    const errors: string[] = [];
    
    if (!cpf) {
      errors.push('CPF é obrigatório');
      return ValidationResultHelper.failure(...errors);
    }

    // Remove formatação
    const cleanCpf = cpf.replace(/\D/g, '');
    
    // Validar comprimento
    if (cleanCpf.length !== 11) {
      errors.push('CPF deve ter exatamente 11 dígitos');
    }
    
    // Validar se não são todos números iguais
    if (/^(\d)\1{10}$/.test(cleanCpf)) {
      errors.push('CPF não pode ter todos os dígitos iguais');
    }
    
    // Validar dígitos verificadores
    if (cleanCpf.length === 11 && !this.isValidCpfChecksum(cleanCpf)) {
      errors.push('CPF possui dígitos verificadores inválidos');
    }
    
    return errors.length > 0 ? ValidationResultHelper.failure(...errors) : ValidationResultHelper.success();
  }
  
  private isValidCpfChecksum(cpf: string): boolean {
    // Calcular primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let firstDigit = (sum * 10) % 11;
    if (firstDigit === 10) firstDigit = 0;

    // Calcular segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    let secondDigit = (sum * 10) % 11;
    if (secondDigit === 10) secondDigit = 0;

    return cpf.charAt(9) === firstDigit.toString() && 
           cpf.charAt(10) === secondDigit.toString();
  }
}
