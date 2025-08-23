import { TestBed } from '@angular/core/testing';
import { ClientService } from './client.service';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { Client } from '../models';

describe('ClientService', () => {
  let service: ClientService;
  let httpClientSpy: { get: jest.Mock, post: jest.Mock };

  const mockClient: Client = {
    id: '1',
    name: 'João Silva',
    cpf: '123.456.789-09'
  };

  beforeEach(() => {
    httpClientSpy = {
      get: jest.fn(),
      post: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        ClientService,
        { provide: HttpClient, useValue: httpClientSpy }
      ]
    });
    service = TestBed.inject(ClientService);
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('HTTP Operations', () => {
    it('should fetch all clients', () => {
      const mockClients = [mockClient];
      httpClientSpy.get.mockReturnValue(of(mockClients));

      service.list().subscribe(clients => {
        expect(clients).toEqual(mockClients);
        expect(clients.length).toBe(1);
        expect(clients[0].name).toBe('João Silva');
      });

      expect(httpClientSpy.get).toHaveBeenCalled();
    });

    it('should create new client', () => {
      const newClientData = { name: 'Maria Santos', cpf: '987.654.321-00' };
      const createdClient = { id: '2', ...newClientData };
      httpClientSpy.post.mockReturnValue(of(createdClient));

      service.create(newClientData).subscribe(client => {
        expect(client).toEqual(createdClient);
        expect(client.name).toBe(newClientData.name);
        expect(client.cpf).toBe(newClientData.cpf);
      });

      expect(httpClientSpy.post).toHaveBeenCalled();
      const postArgs = httpClientSpy.post.mock.calls[0];
      expect(postArgs[1]).toEqual(newClientData);
    });

    it('should handle empty client list', () => {
      httpClientSpy.get.mockReturnValue(of([]));

      service.list().subscribe(clients => {
        expect(clients).toEqual([]);
        expect(clients.length).toBe(0);
      });

      expect(httpClientSpy.get).toHaveBeenCalled();
    });

    it('should handle HTTP errors', () => {
      const errorResponse = { status: 500, message: 'Internal Server Error' };
      httpClientSpy.get.mockReturnValue(throwError(() => errorResponse));

      service.list().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });
    });
  });

  describe('Client Data Validation', () => {
    it('should validate client data correctly', () => {
      const validClient = { name: 'José Silva', cpf: '111.222.333-44' };
      const expectedResponse = { id: '3', ...validClient };
      httpClientSpy.post.mockReturnValue(of(expectedResponse));
      
      service.create(validClient).subscribe(client => {
        expect(client.name).toBe(validClient.name);
        expect(client.cpf).toBe(validClient.cpf);
        expect(client.id).toBeDefined();
      });
    });

    it('should handle special characters in names', () => {
      const clientData = { name: 'José da Silva Júnior', cpf: '111.222.333-44' };
      const expectedResponse = { id: '4', ...clientData };
      httpClientSpy.post.mockReturnValue(of(expectedResponse));
      
      service.create(clientData).subscribe(client => {
        expect(client.name).toContain('ú');
        expect(client.name).toContain('é');
      });
    });

    it('should handle different CPF formats', () => {
      const clientData = { name: 'Ana Costa', cpf: '12345678901' };
      const expectedResponse = { id: '5', ...clientData };
      httpClientSpy.post.mockReturnValue(of(expectedResponse));
      
      service.create(clientData).subscribe(client => {
        expect(client.cpf).toBe('12345678901');
        expect(client.cpf.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network timeout', () => {
      httpClientSpy.get.mockReturnValue(throwError(() => ({ name: 'TimeoutError' })));
      
      service.list().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.name).toBe('TimeoutError');
        }
      });
    });

    it('should handle creation failures', () => {
      const clientData = { name: 'Test Client', cpf: '000.000.000-00' };
      httpClientSpy.post.mockReturnValue(throwError(() => ({ status: 400, message: 'Bad Request' })));
      
      service.create(clientData).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });
    });

    it('should handle malformed response', () => {
      httpClientSpy.get.mockReturnValue(of([{ unexpected: 'data' }]));
      
      service.list().subscribe(clients => {
        // Should still work even with unexpected data structure
        expect(Array.isArray(clients)).toBe(true);
      });
    });
  });

  describe('Multiple Clients Operations', () => {
    it('should handle multiple clients', () => {
      const multipleClients = [
        { id: '1', name: 'João Silva', cpf: '111.111.111-11' },
        { id: '2', name: 'Maria Santos', cpf: '222.222.222-22' },
        { id: '3', name: 'Pedro Oliveira', cpf: '333.333.333-33' }
      ];
      httpClientSpy.get.mockReturnValue(of(multipleClients));

      service.list().subscribe(clients => {
        expect(clients.length).toBe(3);
        expect(clients).toEqual(multipleClients);
        
        // Verify each client structure
        clients.forEach(client => {
          expect(client.id).toBeDefined();
          expect(client.name).toBeDefined();
          expect(client.cpf).toBeDefined();
          expect(typeof client.name).toBe('string');
          expect(typeof client.cpf).toBe('string');
        });
      });
    });

    it('should handle clients with same names but different CPFs', () => {
      const duplicateNameClients = [
        { id: '1', name: 'João Silva', cpf: '111.111.111-11' },
        { id: '2', name: 'João Silva', cpf: '222.222.222-22' }
      ];
      httpClientSpy.get.mockReturnValue(of(duplicateNameClients));

      service.list().subscribe(clients => {
        expect(clients.length).toBe(2);
        expect(clients[0].name).toBe(clients[1].name);
        expect(clients[0].id).not.toBe(clients[1].id);
        expect(clients[0].cpf).not.toBe(clients[1].cpf);
      });
    });
  });
});
