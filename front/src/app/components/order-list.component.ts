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
                <td>
                  <span *ngIf="editingId !== o.id">{{clientName(o.clientId)}}</span>
                  <select *ngIf="editingId === o.id" 
                          [(ngModel)]="editForm.clientId" 
                          class="form-select form-select-sm">
                    <option value="" disabled>Selecione um cliente</option>
                    <option *ngFor="let client of clients()" [value]="client.id">
                      {{client.name}} - {{formatCpf(client.cpf)}}
                    </option>
                  </select>
                </td>
                <td>
                  <span *ngIf="editingId !== o.id">{{clientCpf(o.clientId)}}</span>
                  <span *ngIf="editingId === o.id">{{formatCpf(selectedClientCpf())}}</span>
                </td>
                <td>
                  <div *ngIf="editingId !== o.id">
                    <span class="badge bg-secondary me-1">{{o.productIds.length}} item(s)</span>
                    <div class="small text-muted mt-1">
                      <div *ngFor="let productId of o.productIds">
                        • {{productName(productId)}} - R$ {{productPrice(productId) | number:'1.2-2'}}
                      </div>
                    </div>
                  </div>
                  <div *ngIf="editingId === o.id">
                    <div class="mb-2">
                      <label class="form-label small">Produtos do Pedido:</label>
                      <div *ngFor="let item of editForm.products; let i = index" class="d-flex align-items-center mb-1">
                        <select [(ngModel)]="item.productId" class="form-select form-select-sm me-2">
                          <option value="" disabled>Selecione um produto</option>
                          <option *ngFor="let product of products()" [value]="product.id">
                            {{product.name}} - R$ {{product.price | number:'1.2-2'}}
                          </option>
                        </select>
                        <input type="number" min="1" [(ngModel)]="item.quantity" 
                               class="form-control form-control-sm me-2" style="width: 80px" placeholder="Qtd">
                        <button type="button" class="btn btn-sm btn-danger" (click)="removeProduct(i)">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                      <button type="button" class="btn btn-sm btn-success" (click)="addProduct()">
                        <i class="fas fa-plus"></i> Adicionar Produto
                      </button>
                    </div>
                  </div>
                </td>
                <td>{{formatDate(o.createdAt)}}</td>
                <td>
                  <span class="badge" [class]="'bg-' + getStatusColor(o.status)">{{o.status}}</span>
                </td>
                <td><strong>R$ {{totals()[o.id] | number:'1.2-2'}}</strong></td>
                <td>
                  <div *ngIf="editingId !== o.id">
                    <button class="btn btn-sm btn-success me-2" (click)="pay(o)" [disabled]="o.status!=='Created'">
                      Pagar
                    </button>
                    <button class="btn btn-sm btn-warning me-2" (click)="cancel(o)" [disabled]="o.status!=='Created'">
                      Cancelar
                    </button>
                    <button class="btn btn-sm btn-info me-2" (click)="startEdit(o)" [disabled]="o.status!=='Created'">
                      <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-danger" (click)="delete(o)" 
                            [disabled]="o.status==='Paid'" title="Não é possível excluir pedidos pagos">
                      🗑️
                    </button>
                  </div>
                  <div *ngIf="editingId === o.id" class="btn-group btn-group-sm">
                    <button class="btn btn-success" (click)="saveEdit(o.id)">
                      <i class="fas fa-check"></i> Salvar
                    </button>
                    <button class="btn btn-secondary" (click)="cancelEdit()">
                      <i class="fas fa-times"></i> Cancelar
                    </button>
                  </div>
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
  status: OrderStatus | '' = '';
  statuses: OrderStatus[] = ['Created','Paid','Canceled'];
  totals = signal<Record<string, number>>({});
  
  // Edição inline
  editingId: string | null = null;
  editForm = {
    clientId: '',
    products: [] as Array<{productId: string, quantity: number}>
  };
  
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

  // Métodos de edição
  startEdit(order: Order) {
    this.editingId = order.id;
    this.editForm = {
      clientId: order.clientId,
      products: order.productIds.map(productId => ({
        productId: productId,
        quantity: 1 // Por padrão, assumimos quantidade 1 para cada produto
      }))
    };
  }

  cancelEdit() {
    this.editingId = null;
    this.editForm = {
      clientId: '',
      products: []
    };
  }

  addProduct() {
    this.editForm.products.push({
      productId: '',
      quantity: 1
    });
  }

  removeProduct(index: number) {
    this.editForm.products.splice(index, 1);
  }

  selectedClientCpf(): string {
    const client = this.clients().find((c: Client) => c.id === this.editForm.clientId);
    return client?.cpf || '';
  }

  formatCpf(cpf: string): string {
    if (!cpf) return '';
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return cpf;
  }

  saveEdit(orderId: string) {
    // Validações básicas
    if (!this.editForm.clientId) {
      alert('Selecione um cliente');
      return;
    }

    if (this.editForm.products.length === 0) {
      alert('Adicione pelo menos um produto');
      return;
    }

    // Verificar se todos os produtos foram selecionados
    const hasEmptyProduct = this.editForm.products.some(p => !p.productId);
    if (hasEmptyProduct) {
      alert('Todos os produtos devem ser selecionados');
      return;
    }

    // Verificar quantidades válidas
    const hasInvalidQuantity = this.editForm.products.some(p => p.quantity <= 0);
    if (hasInvalidQuantity) {
      alert('Todas as quantidades devem ser maiores que zero');
      return;
    }

    // Converter para o formato esperado pelo backend (array de IDs dos produtos)
    const productIds = this.editForm.products.flatMap(p => 
      Array(p.quantity).fill(p.productId)
    );

    this.ordersSvc.update(orderId, {
      clientId: this.editForm.clientId,
      productIds: productIds
    }).subscribe({
      next: () => {
        this.editingId = null;
        this.load(); // Recarregar a lista
      },
      error: (error: any) => {
        console.error('Erro ao atualizar pedido:', error);
        let errorMessage = 'Erro ao atualizar pedido';
        
        if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.status === 400) {
          errorMessage = 'Dados inválidos. Verifique os campos';
        }
        
        alert(errorMessage);
      }
    });
  }
  
  pay(o:Order){ this.ordersSvc.pay(o.id).subscribe(()=> this.load()); }
  cancel(o:Order){ this.ordersSvc.cancel(o.id).subscribe(()=> this.load()); }
  
  delete(o:Order) {
    if (o.status === 'Paid') {
      alert('Não é possível excluir pedidos pagos.');
      return;
    }
    
    if (confirm(`Tem certeza que deseja excluir o pedido do cliente ${this.clientName(o.clientId)}?`)) {
      this.ordersSvc.delete(o.id).subscribe(() => {
        this.load();
      });
    }
  }
  
  getStatusColor(status: OrderStatus): string {
    switch(status) {
      case 'Created': return 'warning';
      case 'Paid': return 'success';
      case 'Canceled': return 'danger';
      default: return 'secondary';
    }
  }
}
