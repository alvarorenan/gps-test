import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product } from '../models';
import { environment } from '../environment';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.api + '/products';

  const mockProduct: Product = {
    id: '1',
    name: 'iPhone 14',
    price: 999.99
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('HTTP Operations', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should fetch all products', () => {
      const mockProducts = [mockProduct];

      service.list().subscribe(products => {
        expect(products).toEqual(mockProducts);
        expect(products.length).toBe(1);
        expect(products[0].name).toBe('iPhone 14');
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockProducts);
    });

    it('should create new product', () => {
      const newProductData = { name: 'Samsung Galaxy', price: 899.99 };
      const createdProduct = { id: '2', ...newProductData };

      service.create(newProductData).subscribe(product => {
        expect(product).toEqual(createdProduct);
        expect(product.name).toBe(newProductData.name);
        expect(product.price).toBe(newProductData.price);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newProductData);
      req.flush(createdProduct);
    });

    it('should handle empty product list', () => {
      service.list().subscribe(products => {
        expect(products).toEqual([]);
        expect(products.length).toBe(0);
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush([]);
    });

    it('should handle HTTP errors gracefully', () => {
      service.list().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        }
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('Product Creation Validation', () => {
    it('should create product with valid data', () => {
      const validProduct = { name: 'Notebook Dell', price: 1299.99 };
      
      service.create(validProduct).subscribe(product => {
        expect(product.name).toBe(validProduct.name);
        expect(product.price).toBe(validProduct.price);
        expect(typeof product.price).toBe('number');
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush({ id: '1', ...validProduct });
    });

    it('should handle products with minimum price', () => {
      const cheapProduct = { name: 'Cabo USB', price: 0.01 };
      
      service.create(cheapProduct).subscribe(product => {
        expect(product.price).toBe(0.01);
        expect(product.price).toBeGreaterThan(0);
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush({ id: '1', ...cheapProduct });
    });

    it('should handle products with high prices', () => {
      const expensiveProduct = { name: 'MacBook Pro', price: 9999.99 };
      
      service.create(expensiveProduct).subscribe(product => {
        expect(product.price).toBe(9999.99);
        expect(product.price).toBeGreaterThan(1000);
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush({ id: '1', ...expensiveProduct });
    });
  });

  describe('Multiple Products Operations', () => {
    it('should handle multiple products', () => {
      const multipleProducts = [
        { id: '1', name: 'iPhone', price: 999 },
        { id: '2', name: 'Samsung', price: 799 },
        { id: '3', name: 'Xiaomi', price: 399 }
      ];

      service.list().subscribe(products => {
        expect(products.length).toBe(3);
        expect(products).toEqual(multipleProducts);
        
        // Verify each product structure
        products.forEach(product => {
          expect(product.id).toBeDefined();
          expect(product.name).toBeDefined();
          expect(product.price).toBeDefined();
          expect(typeof product.price).toBe('number');
        });
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush(multipleProducts);
    });

    it('should handle products with same names but different IDs', () => {
      const duplicateNameProducts = [
        { id: '1', name: 'iPhone', price: 999 },
        { id: '2', name: 'iPhone', price: 1199 }
      ];

      service.list().subscribe(products => {
        expect(products.length).toBe(2);
        expect(products[0].name).toBe(products[1].name);
        expect(products[0].id).not.toBe(products[1].id);
        expect(products[0].price).not.toBe(products[1].price);
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush(duplicateNameProducts);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle server errors', () => {
      service.create({ name: 'Test', price: 100 }).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle malformed product data', () => {
      service.list().subscribe(products => {
        // Should handle unexpected response structure gracefully
        expect(Array.isArray(products)).toBe(true);
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush([{ malformed: 'data', random: 123 }]);
    });

    it('should handle network connectivity issues', () => {
      service.list().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(0);
        }
      });

      const req = httpMock.expectOne(baseUrl);
      req.error(new ProgressEvent('network error'), { status: 0 });
    });
  });
});
