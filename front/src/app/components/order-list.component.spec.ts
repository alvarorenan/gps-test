import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { OrderListComponent } from './order-list.component';
import { OrderService, ClientService, ProductService } from '../services';
import { Order, Client, Product, OrderStatus } from '../models';

describe('OrderListComponent', () => {
  let component: OrderListComponent;
  let fixture: ComponentFixture<OrderListComponent>;
  let orderService: any;
  let clientService: any;
  let productService: any;

  const mockOrders: Order[] = [
    {
      id: '1',
      clientId: 'client-1',
      productIds: ['prod-1', 'prod-2'],
      status: 'Created',
      createdAt: '2023-01-01T10:00:00Z'
    },
    {
      id: '2',
      clientId: 'client-2', 
      productIds: ['prod-2'],
      status: 'Paid',
      createdAt: '2023-01-02T11:00:00Z'
    }
  ];

  const mockClients: Client[] = [
    { id: 'client-1', name: 'João Silva', cpf: '123.456.789-09' },
    { id: 'client-2', name: 'Maria Santos', cpf: '987.654.321-00' }
  ];

  const mockProducts: Product[] = [
    { id: 'prod-1', name: 'Produto A', price: 50.00 },
    { id: 'prod-2', name: 'Produto B', price: 75.00 }
  ];

  beforeEach(async () => {
    const orderServiceSpy = {
      list: jest.fn(),
      listByStatus: jest.fn(),
      total: jest.fn(),
      pay: jest.fn(),
      cancel: jest.fn()
    };
    const clientServiceSpy = {
      list: jest.fn()
    };
    const productServiceSpy = {
      list: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        OrderListComponent,
        HttpClientTestingModule
      ],
      providers: [
        { provide: OrderService, useValue: orderServiceSpy },
        { provide: ClientService, useValue: clientServiceSpy },
        { provide: ProductService, useValue: productServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;
    orderService = TestBed.inject(OrderService) as any;
    clientService = TestBed.inject(ClientService) as any;
    productService = TestBed.inject(ProductService) as any;

    // Setup default return values
    (clientService.list as jest.Mock).mockReturnValue(of(mockClients));
    (productService.list as jest.Mock).mockReturnValue(of(mockProducts));
    (orderService.list as jest.Mock).mockReturnValue(of(mockOrders));
    (orderService.total as jest.Mock).mockReturnValue(of(100.50));
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load clients, products and orders on init', () => {
      component.ngOnInit();
      
      expect(clientService.list).toHaveBeenCalled();
      expect(productService.list).toHaveBeenCalled();
      expect(orderService.list).toHaveBeenCalled();
      expect(component.orders()).toEqual(mockOrders);
      expect(component.clients()).toEqual(mockClients);
      expect(component.products()).toEqual(mockProducts);
    });
  });

  describe('Data Loading', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should load all orders when no status filter', () => {
      component.status = '';
      
      component.load();
      
      expect(orderService.list).toHaveBeenCalled();
      expect(component.orders()).toEqual(mockOrders);
    });

    it('should load filtered orders when status is set', () => {
      const filteredOrders = [mockOrders[0]];
      (orderService.listByStatus as jest.Mock).mockReturnValue(of(filteredOrders));
      component.status = 'Created';
      
      component.load();
      
      expect(orderService.listByStatus).toHaveBeenCalledWith('Created');
      expect(component.orders()).toEqual(filteredOrders);
    });

    it('should fetch totals for loaded orders', () => {
      component.load();
      
      expect(orderService.total).toHaveBeenCalledWith('1');
      expect(orderService.total).toHaveBeenCalledWith('2');
    });
  });

  describe('Helper Methods', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should get client name by id', () => {
      const name = component.clientName('client-1');
      expect(name).toBe('João Silva');
    });

    it('should return fallback for unknown client', () => {
      const name = component.clientName('unknown-id');
      expect(name).toBe('Cliente não encontrado');
    });

    it('should get client CPF by id', () => {
      const cpf = component.clientCpf('client-1');
      expect(cpf).toBe('123.456.789-09');
    });

    it('should return fallback for unknown client CPF', () => {
      const cpf = component.clientCpf('unknown-id');
      expect(cpf).toBe('CPF não encontrado');
    });

    it('should get product name by id', () => {
      const name = component.productName('prod-1');
      expect(name).toBe('Produto A');
    });

    it('should return fallback for unknown product', () => {
      const name = component.productName('unknown-id');
      expect(name).toBe('Produto não encontrado');
    });

    it('should get product price by id', () => {
      const price = component.productPrice('prod-1');
      expect(price).toBe(50.00);
    });

    it('should return 0 for unknown product price', () => {
      const price = component.productPrice('unknown-id');
      expect(price).toBe(0);
    });

    it('should format date correctly', () => {
      const formatted = component.formatDate('2023-12-25T15:30:00Z');
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/);
    });

    it('should get correct status colors', () => {
      expect(component.getStatusColor('Created')).toBe('warning');
      expect(component.getStatusColor('Paid')).toBe('success');
      expect(component.getStatusColor('Canceled')).toBe('danger');
      expect(component.getStatusColor('Unknown' as any)).toBe('secondary');
    });
  });

  describe('Order Operations', () => {
    beforeEach(() => {
      component.ngOnInit();
      (orderService.pay as jest.Mock).mockReturnValue(of({}));
      (orderService.cancel as jest.Mock).mockReturnValue(of({}));
    });

    it('should pay order and reload', () => {
      jest.spyOn(component, 'load');
      
      component.pay(mockOrders[0]);
      
      expect(orderService.pay).toHaveBeenCalledWith('1');
      expect(component.load).toHaveBeenCalled();
    });

    it('should cancel order and reload', () => {
      jest.spyOn(component, 'load');
      
      component.cancel(mockOrders[0]);
      
      expect(orderService.cancel).toHaveBeenCalledWith('1');
      expect(component.load).toHaveBeenCalled();
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should display status filter dropdown', () => {
      const select = fixture.nativeElement.querySelector('select[name="status"]');
      expect(select).toBeTruthy();
    });

    it('should display orders table when orders exist', () => {
      const table = fixture.nativeElement.querySelector('table');
      expect(table).toBeTruthy();
    });

    it('should display correct number of order rows', () => {
      const rows = fixture.nativeElement.querySelectorAll('tbody tr');
      expect(rows.length).toBe(2);
    });

    it('should display empty message when no orders', () => {
      component.orders.set([]);
      fixture.detectChanges();
      
      const alert = fixture.nativeElement.querySelector('.alert-info');
      expect(alert).toBeTruthy();
      expect(alert.textContent).toContain('Nenhum pedido encontrado');
    });

    it('should display status-specific empty message', () => {
      component.orders.set([]);
      component.status = 'Paid';
      fixture.detectChanges();
      
      const alert = fixture.nativeElement.querySelector('.alert-info');
      expect(alert.textContent).toContain('Nenhum pedido encontrado para o status "Paid"');
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', () => {
      (clientService.list as jest.Mock).mockReturnValue(throwError(() => new Error('Client service error')));
      
      expect(() => component.ngOnInit()).not.toThrow();
    });
  });
});
