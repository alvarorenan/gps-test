import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, OrderStatus } from '../models';
import { environment } from '../environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private base = environment.api + '/orders';

  list(): Observable<Order[]> {
    return this.http.get<Order[]>(this.base);
  }

  get(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.base}/${id}`);
  }

  listByStatus(status: OrderStatus): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.base}/status/${status}`);
  }

  create(data: {clientId: string; productIds: string[]}): Observable<Order> {
    return this.http.post<Order>(this.base, data);
  }

  pay(id: string): Observable<any> {
    return this.http.post(`${this.base}/${id}/pay`, {});
  }

  cancel(id: string): Observable<any> {
    return this.http.post(`${this.base}/${id}/cancel`, {});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  total(id: string): Observable<number> {
    return this.http.get<number>(`${this.base}/${id}/total`);
  }
}
