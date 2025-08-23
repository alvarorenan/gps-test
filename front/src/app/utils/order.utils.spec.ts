import { OrderUtils } from './order.utils';

describe('OrderUtils', () => {
  describe('Currency Formatting', () => {
    it('should format currency in BRL', () => {
      const result = OrderUtils.formatCurrency(123.45);
      expect(result).toMatch(/R\$.*123,45/);
    });

    it('should format currency with different currency code', () => {
      const result = OrderUtils.formatCurrency(123.45, 'USD');
      expect(result).toMatch(/US\$.*123.45/);
    });

    it('should handle zero values', () => {
      const result = OrderUtils.formatCurrency(0);
      expect(result).toMatch(/R\$.*0,00/);
    });

    it('should handle negative values', () => {
      const result = OrderUtils.formatCurrency(-50.25);
      expect(result).toMatch(/-R\$.*50,25/);
    });
  });

  describe('Date Formatting', () => {
    it('should format date in Brazilian format', () => {
      const date = new Date('2023-12-25');
      const result = OrderUtils.formatDate(date);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('should handle current date', () => {
      const date = new Date();
      const result = OrderUtils.formatDate(date);
      expect(result).toBeTruthy();
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe('Order Number Generation', () => {
    it('should generate unique order numbers', () => {
      const order1 = OrderUtils.generateOrderNumber();
      const order2 = OrderUtils.generateOrderNumber();
      
      expect(order1).toMatch(/^ORD-\d+-\d+$/);
      expect(order2).toMatch(/^ORD-\d+-\d+$/);
      expect(order1).not.toBe(order2);
    });

    it('should follow correct format pattern', () => {
      const orderNumber = OrderUtils.generateOrderNumber();
      expect(orderNumber).toMatch(/^ORD-\d{13}-\d{1,3}$/);
    });
  });

  describe('Discount Calculations', () => {
    it('should calculate correct discount amount', () => {
      const discount = OrderUtils.calculateDiscount(100, 10);
      expect(discount).toBe(10);
    });

    it('should calculate discount for different percentages', () => {
      expect(OrderUtils.calculateDiscount(200, 25)).toBe(50);
      expect(OrderUtils.calculateDiscount(150, 15)).toBe(22.5);
    });

    it('should handle zero discount', () => {
      const discount = OrderUtils.calculateDiscount(100, 0);
      expect(discount).toBe(0);
    });

    it('should throw error for invalid discount percentage', () => {
      expect(() => OrderUtils.calculateDiscount(100, -5)).toThrow('Discount percentage must be between 0 and 100');
      expect(() => OrderUtils.calculateDiscount(100, 105)).toThrow('Discount percentage must be between 0 and 100');
    });

    it('should apply discount correctly', () => {
      const finalAmount = OrderUtils.applyDiscount(100, 20);
      expect(finalAmount).toBe(80);
    });

    it('should apply 100% discount', () => {
      const finalAmount = OrderUtils.applyDiscount(100, 100);
      expect(finalAmount).toBe(0);
    });
  });

  describe('Email Validation', () => {
    it('should validate correct email addresses', () => {
      expect(OrderUtils.validateEmail('user@example.com')).toBe(true);
      expect(OrderUtils.validateEmail('test.email@domain.com.br')).toBe(true);
      expect(OrderUtils.validateEmail('user123@test-domain.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(OrderUtils.validateEmail('invalid-email')).toBe(false);
      expect(OrderUtils.validateEmail('@domain.com')).toBe(false);
      expect(OrderUtils.validateEmail('user@')).toBe(false);
      expect(OrderUtils.validateEmail('user@domain')).toBe(false);
      expect(OrderUtils.validateEmail('')).toBe(false);
    });
  });

  describe('Phone Validation', () => {
    it('should validate correct Brazilian phone numbers', () => {
      expect(OrderUtils.validatePhone('(11) 99999-9999')).toBe(true);
      expect(OrderUtils.validatePhone('(21) 8888-8888')).toBe(true);
      expect(OrderUtils.validatePhone('(85) 99123-4567')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(OrderUtils.validatePhone('11999999999')).toBe(false);
      expect(OrderUtils.validatePhone('(11) 999-999')).toBe(false);
      expect(OrderUtils.validatePhone('11 99999-9999')).toBe(false);
      expect(OrderUtils.validatePhone('')).toBe(false);
    });
  });

  describe('Business Hours Check', () => {
    beforeEach(() => {
      // Reset any date mocks
      jest.restoreAllMocks();
    });

    it('should return true during business hours on weekdays', () => {
      // Mock Tuesday 10 AM
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(10);
      jest.spyOn(Date.prototype, 'getDay').mockReturnValue(2);
      
      expect(OrderUtils.isBusinessHours()).toBe(true);
    });

    it('should return false during business hours on weekends', () => {
      // Mock Saturday 10 AM
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(10);
      jest.spyOn(Date.prototype, 'getDay').mockReturnValue(6);
      
      expect(OrderUtils.isBusinessHours()).toBe(false);
    });

    it('should return false outside business hours on weekdays', () => {
      // Mock Tuesday 7 AM (before business hours)
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(7);
      jest.spyOn(Date.prototype, 'getDay').mockReturnValue(2);
      
      expect(OrderUtils.isBusinessHours()).toBe(false);

      // Mock Tuesday 6 PM (after business hours)
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(18);
      jest.spyOn(Date.prototype, 'getDay').mockReturnValue(2);
      
      expect(OrderUtils.isBusinessHours()).toBe(false);
    });

    it('should return false on Sunday', () => {
      // Mock Sunday 10 AM
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(10);
      jest.spyOn(Date.prototype, 'getDay').mockReturnValue(0);
      
      expect(OrderUtils.isBusinessHours()).toBe(false);
    });
  });
});
