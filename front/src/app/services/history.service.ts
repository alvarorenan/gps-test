import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment';
import { PagedResult } from '../models';

export interface GenericHistory {
  id: string;
  entityId: string;
  entityType: string;
  action: string;
  dataSnapshotJson: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private http = inject(HttpClient);
  private base = environment.api + '/history';

  list(): Observable<GenericHistory[]> {
    return this.http.get<GenericHistory[]>(this.base);
  }
  listPaged(page:number, pageSize:number): Observable<PagedResult<GenericHistory>> {
    return this.http.get<PagedResult<GenericHistory>>(`${this.base}?page=${page}&pageSize=${pageSize}`);
  }
}
