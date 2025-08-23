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

  create(data: {name: string; cpf: string}): Observable<Client> {
    return this.http.post<Client>(this.base, data);
  }
}
