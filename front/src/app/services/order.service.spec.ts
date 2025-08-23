import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OrderService } from './order.service';
import { Order, OrderStatus } from '../models';
import { environment } from '../environment';

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.api + '/orders';

  const mockOrder: Order = {
    id: '1',
    clientId: 'client-1',
    productIds: ['prod-1', 'prod-2'],
    status: 'Created',
    createdAt: '2023-01-01T10:00:00Z'
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

      service.list().subscribe(orders => {
        expect(orders).toEqual(mockOrders);
        expect(orders.length).toBe(1);
        expect(orders[0].status).toBe('Created');
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockOrders);
    });

    it('should get single order by ID', () => {
      service.get('1').subscribe(order => {
        expect(order).toEqual(mockOrder);
        expect(order.id).toBe('1');
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockOrder);
    });

    it('should fetch orders by status', () => {
      const createdOrders = [mockOrder];

      service.listByStatus('Created').subscribe(orders => {
        expect(orders).toEqual(createdOrders);
        expect(orders.every(o => o.status === 'Created')).toBe(true);
      });

      const req = httpMock.expectOne(`${baseUrl}/status/Created`);
      expect(req.request.method).toBe('GET');
      req.flush(createdOrders);
    });

    it('should create new order', () => {
      const newOrderData = { clientId: 'client-2', productIds: ['prod-3'] };
      const createdOrder = { 
        id: '2', 
        ...newOrderData, 
        status: 'Created' as OrderStatus,
        createdAt: '2023-01-02T10:00:00Z'
      };

      service.create(newOrderData).subscribe(order => {
        expect(order).toEqual(createdOrder);
        expect(order.clientId).toBe(newOrderData.clientId);
        expect(order.productIds).toEqual(newOrderData.productIds);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newOrderData);
      req.flush(createdOrder);
    });

    it('should pay order', () => {
      service.pay('1').subscribe(response => {
        expect(response).toBeDefined();
      });

      const req = httpMock.expectOne(`${baseUrl}/1/pay`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush({ success: true });
    });

    it('should cancel order', () => {
      service.cancel('1').subscribe(response => {
        expect(response).toBeDefined();
      });

      const req = httpMock.expectOne(`${baseUrl}/1/cancel`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush({ success: true });
    });

    it('should get order total', () => {
      const expectedTotal = 250.75;

      service.total('1').subscribe(total => {
        expect(total).toBe(expectedTotal);
        expect(typeof total).toBe('number');
      });

      const req = httpMock.expectOne(`${baseUrl}/1/total`);
      expect(req.request.method).toBe('GET');
      req.flush(expectedTotal);
    });
  });

  describe('Status-based Operations', () => {
    it('should filter orders by Created status', () => {
      const createdOrders = [
        { ...mockOrder, id: '1', status: 'Created' as OrderStatus },
        { ...mockOrder, id: '2', status: 'Created' as OrderStatus }
      ];

      service.listByStatus('Created').subscribe(orders => {
        expect(orders.length).toBe(2);
        expect(orders.every(o => o.status === 'Created')).toBe(true);
      });

      const req = httpMock.expectOne(`${baseUrl}/status/Created`);
      req.flush(createdOrders);
    });

    it('should filter orders by Paid status', () => {
      const paidOrders = [
        { ...mockOrder, id: '3', status: 'Paid' as OrderStatus }
      ];

      service.listByStatus('Paid').subscribe(orders => {
        expect(orders.length).toBe(1);
        expect(orders[0].status).toBe('Paid');
      });

      const req = httpMock.expectOne(`${baseUrl}/status/Paid`);
      req.flush(paidOrders);
    });

    it('should filter orders by Canceled status', () => {
      const canceledOrders = [
        { ...mockOrder, id: '4', status: 'Canceled' as OrderStatus }
      ];

      service.listByStatus('Canceled').subscribe(orders => {
        expect(orders.length).toBe(1);
        expect(orders[0].status).toBe('Canceled');
      });

      const req = httpMock.expectOne(`${baseUrl}/status/Canceled`);
      req.flush(canceledOrders);
    });
  });

  describe('Order Management', () => {
    it('should handle orders with multiple products', () => {
      const multiProductOrder = {
        ...mockOrder,
        productIds: ['prod-1', 'prod-2', 'prod-3', 'prod-4']
      };

      service.get('1').subscribe(order => {
        expect(order.productIds.length).toBe(4);
        expect(order.productIds).toContain('prod-1');
        expect(order.productIds).toContain('prod-4');
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      req.flush(multiProductOrder);
    });

    it('should handle orders with single product', () => {
      const singleProductOrder = {
        ...mockOrder,
        productIds: ['prod-1']
      };

      service.get('1').subscribe(order => {
        expect(order.productIds.length).toBe(1);
        expect(order.productIds[0]).toBe('prod-1');
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      req.flush(singleProductOrder);
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP errors for list operations', () => {
      service.list().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Internal Server Error');
        }
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle not found errors', () => {
      service.get('nonexistent').subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/nonexistent`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle payment failures', () => {
      service.pay('1').subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.statusText).toBe('Bad Request');
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/1/pay`);
      req.flush('Payment failed', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle cancellation failures', () => {
      service.cancel('1').subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(409);
          expect(error.statusText).toBe('Conflict');
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/1/cancel`);
      req.flush('Cannot cancel', { status: 409, statusText: 'Conflict' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty order list', () => {
      service.list().subscribe(orders => {
        expect(orders).toEqual([]);
        expect(orders.length).toBe(0);
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush([]);
    });

    it('should handle zero total', () => {
      service.total('1').subscribe(total => {
        expect(total).toBe(0);
        expect(typeof total).toBe('number');
      });

      const req = httpMock.expectOne(`${baseUrl}/1/total`);
      req.flush(0);
    });

    it('should handle large order totals', () => {
      const largeTotal = 99999.99;

      service.total('1').subscribe(total => {
        expect(total).toBe(largeTotal);
        expect(total).toBeGreaterThan(10000);
      });

      const req = httpMock.expectOne(`${baseUrl}/1/total`);
      req.flush(largeTotal);
    });
  });
});
