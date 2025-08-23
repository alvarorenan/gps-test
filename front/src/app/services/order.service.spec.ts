import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OrderService } from './order.service';
import { Order, OrderItem } from '../models/order.model';

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;

  // Mock data for testing
  const mockOrderItems: OrderItem[] = [
    {
      productId: '1',
      productName: 'Product 1',
      quantity: 2,
      unitPrice: 10.0,
      totalPrice: 20.0
    },
    {
      productId: '2',
      productName: 'Product 2',
      quantity: 1,
      unitPrice: 15.0,
      totalPrice: 15.0
    }
  ];

  const mockOrder: Order = {
    id: '123',
    clientId: 'client-1',
    clientName: 'John Doe',
    items: mockOrderItems,
    totalAmount: 35.0,
    status: 'pending',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrderService]
    });
    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('HTTP Operations', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should fetch all orders', () => {
      const mockOrders = [mockOrder];

      service.getAllOrders().subscribe(orders => {
        expect(orders).toEqual(mockOrders);
        expect(orders.length).toBe(1);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/orders');
      expect(req.request.method).toBe('GET');
      req.flush(mockOrders);
    });

    it('should fetch order by id', () => {
      const orderId = '123';

      service.getOrderById(orderId).subscribe(order => {
        expect(order).toEqual(mockOrder);
        expect(order?.id).toBe(orderId);
      });

      const req = httpMock.expectOne(`http://localhost:8080/api/orders/${orderId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockOrder);
    });

    it('should create new order', () => {
      const newOrder = { ...mockOrder };
      delete (newOrder as any).id;

      service.createOrder(newOrder).subscribe(order => {
        expect(order).toEqual(mockOrder);
        expect(order.id).toBeTruthy();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/orders');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newOrder);
      req.flush(mockOrder);
    });

    it('should pay order', () => {
      const paidOrder = { ...mockOrder, status: 'paid' as const };

      service.payOrder(mockOrder.id).subscribe(order => {
        expect(order.status).toBe('paid');
        expect(order.id).toBe(mockOrder.id);
      });

      const req = httpMock.expectOne(`http://localhost:8080/api/orders/${mockOrder.id}/pay`);
      expect(req.request.method).toBe('POST');
      req.flush(paidOrder);
    });

    it('should cancel order', () => {
      const canceledOrder = { ...mockOrder, status: 'canceled' as const };

      service.cancelOrder(mockOrder.id).subscribe(order => {
        expect(order.status).toBe('canceled');
        expect(order.id).toBe(mockOrder.id);
      });

      const req = httpMock.expectOne(`http://localhost:8080/api/orders/${mockOrder.id}/cancel`);
      expect(req.request.method).toBe('POST');
      req.flush(canceledOrder);
    });
  });

  describe('Business Logic - Order Calculations', () => {
    it('should calculate order total correctly', () => {
      const total = service.calculateOrderTotal(mockOrderItems);
      expect(total).toBe(35.0);
    });

    it('should calculate total for empty items', () => {
      const total = service.calculateOrderTotal([]);
      expect(total).toBe(0);
    });

    it('should calculate total for single item', () => {
      const singleItem: OrderItem[] = [{
        productId: '1',
        productName: 'Test Product',
        quantity: 3,
        unitPrice: 12.50,
        totalPrice: 37.50
      }];
      
      const total = service.calculateOrderTotal(singleItem);
      expect(total).toBe(37.50);
    });
  });

  describe('Business Logic - Order Validation', () => {
    it('should validate correct order items', () => {
      const isValid = service.validateOrderItems(mockOrderItems);
      expect(isValid).toBe(true);
    });

    it('should reject empty order items', () => {
      const isValid = service.validateOrderItems([]);
      expect(isValid).toBe(false);
    });

    it('should reject items with zero quantity', () => {
      const invalidItems: OrderItem[] = [{
        productId: '1',
        productName: 'Test Product',
        quantity: 0,
        unitPrice: 10.0,
        totalPrice: 0
      }];

      const isValid = service.validateOrderItems(invalidItems);
      expect(isValid).toBe(false);
    });

    it('should reject items with negative price', () => {
      const invalidItems: OrderItem[] = [{
        productId: '1',
        productName: 'Test Product',
        quantity: 1,
        unitPrice: -10.0,
        totalPrice: -10.0
      }];

      const isValid = service.validateOrderItems(invalidItems);
      expect(isValid).toBe(false);
    });

    it('should reject items without product info', () => {
      const invalidItems: OrderItem[] = [{
        productId: '',
        productName: '',
        quantity: 1,
        unitPrice: 10.0,
        totalPrice: 10.0
      }];

      const isValid = service.validateOrderItems(invalidItems);
      expect(isValid).toBe(false);
    });
  });

  describe('Business Logic - Order Status Rules', () => {
    it('should allow canceling pending orders', () => {
      const pendingOrder = { ...mockOrder, status: 'pending' as const };
      expect(service.canCancelOrder(pendingOrder)).toBe(true);
    });

    it('should not allow canceling paid orders', () => {
      const paidOrder = { ...mockOrder, status: 'paid' as const };
      expect(service.canCancelOrder(paidOrder)).toBe(false);
    });

    it('should not allow canceling already canceled orders', () => {
      const canceledOrder = { ...mockOrder, status: 'canceled' as const };
      expect(service.canCancelOrder(canceledOrder)).toBe(false);
    });

    it('should allow paying pending orders', () => {
      const pendingOrder = { ...mockOrder, status: 'pending' as const };
      expect(service.canPayOrder(pendingOrder)).toBe(true);
    });

    it('should not allow paying already paid orders', () => {
      const paidOrder = { ...mockOrder, status: 'paid' as const };
      expect(service.canPayOrder(paidOrder)).toBe(false);
    });

    it('should not allow paying canceled orders', () => {
      const canceledOrder = { ...mockOrder, status: 'canceled' as const };
      expect(service.canPayOrder(canceledOrder)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle HTTP errors gracefully', () => {
      service.getAllOrders().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne('http://localhost:8080/api/orders');
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle order not found', () => {
      const orderId = 'non-existent';

      service.getOrderById(orderId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`http://localhost:8080/api/orders/${orderId}`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });
});
