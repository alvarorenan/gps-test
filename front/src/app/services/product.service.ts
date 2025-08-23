import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models';
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

  create(data: {name: string; price: number}): Observable<Product> {
    return this.http.post<Product>(this.base, data);
  }
}
