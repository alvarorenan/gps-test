import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Order, OrderItem } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) {}

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getOrderById(id: string): Observable<Order | null> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  createOrder(order: Partial<Order>): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }

  payOrder(orderId: string): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/${orderId}/pay`, {});
  }

  cancelOrder(orderId: string): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/${orderId}/cancel`, {});
  }

  // Utility methods for business logic
  calculateOrderTotal(items: OrderItem[]): number {
    return items.reduce((total, item) => total + item.totalPrice, 0);
  }

  validateOrderItems(items: OrderItem[]): boolean {
    return items.length > 0 && items.every(item => 
      item.quantity > 0 && 
      item.unitPrice > 0 && 
      item.productId && 
      item.productName
    );
  }

  canCancelOrder(order: Order): boolean {
    return order.status === 'pending';
  }

  canPayOrder(order: Order): boolean {
    return order.status === 'pending';
  }
}
