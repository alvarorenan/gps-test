import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../models';
import { environment } from '../environment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);
  private base = environment.api + '/clients';

  list(): Observable<Client[]> {
    return this.http.get<Client[]>(this.base);
  }

  get(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.base}/${id}`);
  }

  create(data: {name: string; cpf: string}): Observable<Client> {
    return this.http.post<Client>(this.base, data);
  }

  update(id: string, data: {name: string; cpf: string}): Observable<Client> {
    return this.http.put<Client>(`${this.base}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
