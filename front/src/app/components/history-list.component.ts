import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryService, GenericHistory } from '../services';

@Component({
  standalone: true,
  selector: 'app-history-list',
  imports: [CommonModule],
  template: `
    <div class="row">
      <div class="col-12">
        <h2>Histórico do Sistema</h2>
  <div *ngIf="history().length" class="table-responsive">
          <table class="table table-striped">
            <thead class="table-dark">
              <tr>
                <th>Data/Hora</th>
                <th>Entidade</th>
                <th>ID da Entidade</th>
                <th>Ação</th>
                <th>Dados</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let h of history()">
                <td>{{formatDate(h.timestamp)}}</td>
                <td>
                  <span class="badge" [class]="'bg-' + getEntityColor(h.entityType)">
                    {{h.entityType}}
                  </span>
                </td>
                <td><small class="text-muted">{{h.entityId.substring(0,8)}}...</small></td>
                <td>
                  <span class="badge" [class]="'bg-' + getActionColor(h.action)">
                    {{h.action}}
                  </span>
                </td>
                <td>
                  <button 
                    class="btn btn-sm btn-outline-info" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    [attr.data-bs-target]="'#collapse' + h.id" 
                    aria-expanded="false">
                    Ver Dados
                  </button>
                  <div class="collapse mt-2" [id]="'collapse' + h.id">
                    <div class="card card-body">
                      <pre class="small">{{formatJson(h.dataSnapshotJson)}}</pre>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="d-flex justify-content-between align-items-center mt-2" *ngIf="history().length">
          <div>
            <button class="btn btn-sm btn-outline-secondary me-1" (click)="changePage(page()-1)" [disabled]="page()===1">«</button>
            <span class="small">Página {{page()}} / {{totalPages() || 1}}</span>
            <button class="btn btn-sm btn-outline-secondary ms-1" (click)="changePage(page()+1)" [disabled]="page()===totalPages()">»</button>
          </div>
          <div>
            <select class="form-select form-select-sm" style="width:auto; display:inline-block" (change)="changePageSize($any($event.target).value)">
              <option [selected]="pageSize()===5" value="5">5</option>
              <option [selected]="pageSize()===10" value="10">10</option>
              <option [selected]="pageSize()===25" value="25">25</option>
            </select>
            <span class="small ms-2">Total: {{totalCount()}}</span>
          </div>
        </div>
        <div *ngIf="!history().length" class="alert alert-info">
          <i class="bi bi-info-circle"></i> Nenhum histórico encontrado.
        </div>
      </div>
    </div>
  `
})
export class HistoryListComponent implements OnInit {
  private historySvc = inject(HistoryService);
  history = signal<GenericHistory[]>([]);
  page = signal(1); pageSize = signal(10); totalPages = signal(0); totalCount = signal(0);

  ngOnInit() {
    this.loadPage();
  }

  loadPage(){
    this.historySvc.listPaged(this.page(), this.pageSize()).subscribe(r=>{
      this.history.set(r.items);
      this.totalCount.set(r.totalCount);
      this.totalPages.set(r.totalPages || Math.ceil(r.totalCount / r.pageSize));
    });
  }
  changePage(p:number){ if(p<1||p>this.totalPages()) return; this.page.set(p); this.loadPage(); }
  changePageSize(size:number){ this.pageSize.set(+size); this.page.set(1); this.loadPage(); }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  }

  getEntityColor(entityType: string): string {
    switch(entityType.toLowerCase()) {
      case 'client': return 'primary';
      case 'product': return 'success';
      case 'order': return 'warning';
      default: return 'secondary';
    }
  }

  getActionColor(action: string): string {
    if (action.includes('Created')) return 'success';
    if (action.includes('StatusChanged')) return 'warning';
    if (action.includes('Paid')) return 'info';
    if (action.includes('Canceled')) return 'danger';
    return 'secondary';
  }

  formatJson(jsonString: string): string {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonString;
    }
  }
}
