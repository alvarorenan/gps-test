import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService, ProductService, OrderService } from '../services';
import { Client, Product } from '../models';
import { Router } from '@angular/router';

@Component({
  standalone:true,
  selector:'app-order-create',
  imports:[CommonModule, FormsModule],
  template:`
    <div class="row">
      <div class="col-12">
        <h2>Novo Pedido</h2>
        <form (ngSubmit)="create()" class="card p-4">
          <div class="mb-3">
            <label class="form-label">Cliente:</label>
            <select class="form-select" [(ngModel)]="clientId" name="clientId" required>
              <option value="">Selecione um cliente</option>
              <option *ngFor="let c of clients()" [value]="c.id">{{c.name}} ({{c.cpf}})</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Produtos:</label>
            <select multiple class="form-select" size="6" [(ngModel)]="selectedProducts" name="products" required>
              <option *ngFor="let p of products()" [value]="p.id">{{p.name}} - R$ {{p.price | number:'1.2-2'}}</option>
            </select>
            <div class="form-text">Segure Ctrl para selecionar múltiplos produtos</div>
          </div>
          <button type="submit" class="btn btn-success" [disabled]="!clientId || !selectedProducts.length">
            Criar Pedido
          </button>
        </form>
      </div>
    </div>
  `
})
export class OrderCreateComponent implements OnInit {
  private clientsSvc = inject(ClientService);
  private productsSvc = inject(ProductService);
  private ordersSvc = inject(OrderService);
  private router = inject(Router);
  clients = signal<Client[]>([]);
  products = signal<Product[]>([]);
  clientId = '';
  selectedProducts: string[] = [];
  ngOnInit(){
    this.clientsSvc.list().subscribe(c=>{this.clients.set(c);});
    this.productsSvc.list().subscribe(p=> this.products.set(p));
  }
  create(){
    if(!this.clientId || !this.selectedProducts.length) return;
    this.ordersSvc.create({clientId:this.clientId, productIds:this.selectedProducts}).subscribe(o=>{
      this.router.navigate(['/orders']);
    });
  }
}
