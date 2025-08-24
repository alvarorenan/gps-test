import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CpfFormatterService {
  
  format(cpf: string): string {
    if (!cpf) return '';
    
    const cleaned = cpf.replace(/\D/g, '');
    
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return cleaned.replace(/(\d{3})(\d+)/, '$1.$2');
    } else if (cleaned.length <= 9) {
      return cleaned.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    } else {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    }
  }
  
  formatForDisplay(cpf: string): string {
    if (!cpf) return '';
    
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return cpf;
  }
  
  clean(cpf: string): string {
    return cpf.replace(/\D/g, '');
  }
  
  limitTo11Digits(cpf: string): string {
    const cleaned = cpf.replace(/\D/g, '');
    return cleaned.substring(0, 11);
  }
}
