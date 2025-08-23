import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, ClientService, ProductService } from '../services';
import { Order, Client, Product, OrderStatus } from '../models';

@Component({
  standalone:true,
  selector:'app-order-list',
  imports:[CommonModule, FormsModule],
  template:`
    <div class="row">
      <div class="col-12">
        <h2>Pedidos</h2>
        <div class="mb-3">
          <label class="form-label">Filtrar por Status (opcional):</label>
          <select class="form-select w-auto d-inline-block" [(ngModel)]="status" (change)="load()" name="status">
            <option value="">Todos os Status</option>
            <option *ngFor="let s of statuses" [value]="s">{{s}}</option>
          </select>
        </div>
        <div *ngIf="orders().length" class="table-responsive">
          <table class="table table-striped">
            <thead class="table-dark">
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>CPF do Cliente</th>
                <th>Produtos</th>
                <th>Data do Pedido</th>
                <th>Status</th>
                <th>Total</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let o of orders()">
                <td><small class="text-muted">{{o.id.substring(0,8)}}...</small></td>
                <td>{{clientName(o.clientId)}}</td>
                <td>{{clientCpf(o.clientId)}}</td>
                <td>
                  <div>
                    <span class="badge bg-secondary me-1">{{o.productIds.length}} item(s)</span>
                    <div class="small text-muted mt-1">
                      <div *ngFor="let productId of o.productIds">
                        • {{productName(productId)}} - R$ {{productPrice(productId) | number:'1.2-2'}}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{{formatDate(o.createdAt)}}</td>
                <td>
                  <span class="badge" [class]="'bg-' + getStatusColor(o.status)">{{o.status}}</span>
                </td>
                <td><strong>R$ {{totals()[o.id] | number:'1.2-2'}}</strong></td>
                <td>
                  <button class="btn btn-sm btn-success me-2" (click)="pay(o)" [disabled]="o.status!=='Created'">
                    Pagar
                  </button>
                  <button class="btn btn-sm btn-danger" (click)="cancel(o)" [disabled]="o.status!=='Created'">
                    Cancelar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div *ngIf="!orders().length" class="alert alert-info">
          {{status ? 'Nenhum pedido encontrado para o status "' + status + '".' : 'Nenhum pedido encontrado.'}}
        </div>
      </div>
    </div>
  `
})
export class OrderListComponent implements OnInit {
  private ordersSvc = inject(OrderService);
  private clientsSvc = inject(ClientService);
  private productsSvc = inject(ProductService);
  orders = signal<Order[]>([]);
  clients = signal<Client[]>([]);
  products = signal<Product[]>([]);
  status: OrderStatus | '' = ''; // Tornando opcional
  statuses: OrderStatus[] = ['Created','Paid','Canceled'];
  totals = signal<Record<string, number>>({});
  
  ngOnInit(){
    this.clientsSvc.list().subscribe(c=> this.clients.set(c));
    this.productsSvc.list().subscribe(p=> this.products.set(p));
    this.load();
  }
  
  load(){ 
    if (this.status) {
      this.ordersSvc.listByStatus(this.status).subscribe(os=>{ this.orders.set(os); this.fetchTotals(os); });
    } else {
      // Se não há filtro, buscar todos os pedidos
      this.ordersSvc.list().subscribe(os=>{ this.orders.set(os); this.fetchTotals(os); });
    }
  }
  fetchTotals(os: Order[]){
    const current: Record<string, number> = {};
    os.forEach(o=> this.ordersSvc.total(o.id).subscribe(t=>{ current[o.id]=t; this.totals.set({...this.totals(), [o.id]:t}); }));
  }
  
  clientName(id:string){ return this.clients().find(c=>c.id===id)?.name || 'Cliente não encontrado'; }
  clientCpf(id:string){ return this.clients().find(c=>c.id===id)?.cpf || 'CPF não encontrado'; }
  
  productName(id:string){ return this.products().find(p=>p.id===id)?.name || 'Produto não encontrado'; }
  productPrice(id:string){ return this.products().find(p=>p.id===id)?.price || 0; }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  
  pay(o:Order){ this.ordersSvc.pay(o.id).subscribe(()=> this.load()); }
  cancel(o:Order){ this.ordersSvc.cancel(o.id).subscribe(()=> this.load()); }
  getStatusColor(status: OrderStatus): string {
    switch(status) {
      case 'Created': return 'warning';
      case 'Paid': return 'success';
      case 'Canceled': return 'danger';
      default: return 'secondary';
    }
  }
}
