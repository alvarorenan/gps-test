import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, PagedResult } from '../models';
import { environment } from '../environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private base = environment.api + '/products';

  list(): Observable<Product[]> {
    return this.http.get<Product[]>(this.base);
  }
  listPaged(page:number, pageSize:number): Observable<PagedResult<Product>> {
    return this.http.get<PagedResult<Product>>(`${this.base}?page=${page}&pageSize=${pageSize}`);
  }

  get(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.base}/${id}`);
  }

  create(data: {name: string; price: number}): Observable<Product> {
    return this.http.post<Product>(this.base, data);
  }

  update(id: string, data: {name: string; price: number}): Observable<Product> {
    return this.http.put<Product>(`${this.base}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
