// Utility functions for order calculations and validations
export class OrderUtils {
  static formatCurrency(value: number, currency: string = 'BRL'): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(value);
  }

  static formatDate(date: Date): string {
    return date.toLocaleDateString('pt-BR');
  }

  static generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${random}`;
  }

  static calculateDiscount(totalAmount: number, discountPercent: number): number {
    if (discountPercent < 0 || discountPercent > 100) {
      throw new Error('Discount percentage must be between 0 and 100');
    }
    return totalAmount * (discountPercent / 100);
  }

  static applyDiscount(totalAmount: number, discountPercent: number): number {
    const discount = this.calculateDiscount(totalAmount, discountPercent);
    return totalAmount - discount;
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePhone(phone: string): boolean {
    // Brazilian phone number format
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone);
  }

  static isBusinessHours(): boolean {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Monday to Friday, 8 AM to 6 PM
    return day >= 1 && day <= 5 && hour >= 8 && hour < 18;
  }
}
