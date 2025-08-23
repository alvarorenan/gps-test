import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../app/environment';
import { Client, Product, Order, OrderStatus } from '../app/models';
import { Observable } from 'rxjs';

export interface GenericHistory {
  id: string;
  entityId: string;
  entityType: string;
  action: string;
  dataSnapshotJson: string;
  timestamp: string;
}

@Injectable({providedIn:'root'})
export class ClientService {
  private http = inject(HttpClient);
  private base = environment.api + '/clients';
  list(): Observable<Client[]> { return this.http.get<Client[]>(this.base); }
  create(data: {name:string; cpf:string;}): Observable<Client> { return this.http.post<Client>(this.base, data); }
}

@Injectable({providedIn:'root'})
export class ProductService {
  private http = inject(HttpClient);
  private base = environment.api + '/products';
  list(): Observable<Product[]> { return this.http.get<Product[]>(this.base); }
  create(data: {name:string; price:number;}): Observable<Product> { return this.http.post<Product>(this.base, data); }
}

@Injectable({providedIn:'root'})
export class OrderService {
  private http = inject(HttpClient);
  private base = environment.api + '/orders';
  list(): Observable<Order[]> { return this.http.get<Order[]>(this.base); }
  get(id:string) { return this.http.get<Order>(`${this.base}/${id}`); }
  listByStatus(status: OrderStatus) { return this.http.get<Order[]>(`${this.base}/status/${status}`); }
  create(data: {clientId:string; productIds:string[];}) { return this.http.post<Order>(this.base, data); }
  pay(id:string) { return this.http.post(`${this.base}/${id}/pay`, {}); }
  cancel(id:string) { return this.http.post(`${this.base}/${id}/cancel`, {}); }
  total(id:string) { return this.http.get<number>(`${this.base}/${id}/total`); }
}

@Injectable({providedIn:'root'})
export class HistoryService {
  private http = inject(HttpClient);
  private base = environment.api + '/history';
  list(): Observable<GenericHistory[]> { return this.http.get<GenericHistory[]>(this.base); }
}
