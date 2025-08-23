import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService, ProductService, OrderService } from '../services';
import { Client, Product } from '../models';
import { Router } from '@angular/router';

interface ProductWithQuantity {
  product: Product;
  quantity: number;
}

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
            <div class="row mb-2">
              <div class="col-8">
                <select class="form-select" [(ngModel)]="selectedProductId" name="selectedProduct">
                  <option value="">Selecione um produto para adicionar</option>
                  <option *ngFor="let p of availableProducts()" [value]="p.id">
                    {{p.name}} - R$ {{p.price | number:'1.2-2'}}
                  </option>
                </select>
              </div>
              <div class="col-2">
                <input type="number" class="form-control" [(ngModel)]="quantityToAdd" 
                       name="quantity" min="1" placeholder="Qtd" [value]="quantityToAdd || 1">
              </div>
              <div class="col-2">
                <button type="button" class="btn btn-primary w-100" 
                        (click)="addProduct()" [disabled]="!selectedProductId">
                  Adicionar
                </button>
              </div>
            </div>
            
            <div class="border rounded p-3" *ngIf="orderProducts().length > 0">
              <h6>Produtos do Pedido:</h6>
              <div *ngFor="let item of orderProducts(); let i = index" class="d-flex justify-content-between align-items-center mb-2">
                <div class="flex-grow-1">
                  <strong>{{item.product.name}}</strong>
                  <span class="text-muted ms-2">R$ {{item.product.price | number:'1.2-2'}}</span>
                </div>
                <div class="d-flex align-items-center">
                  <button type="button" class="btn btn-sm btn-outline-secondary me-2" 
                          (click)="decreaseQuantity(i)" [disabled]="item.quantity <= 1">-</button>
                  <span class="mx-2">{{item.quantity}}</span>
                  <button type="button" class="btn btn-sm btn-outline-secondary me-2" 
                          (click)="increaseQuantity(i)">+</button>
                  <span class="me-2 text-success">
                    R$ {{(item.product.price * item.quantity) | number:'1.2-2'}}
                  </span>
                  <button type="button" class="btn btn-sm btn-outline-danger" 
                          (click)="removeProduct(i)">🗑️</button>
                </div>
              </div>
              <hr>
              <div class="text-end">
                <strong>Total: R$ {{getTotalPrice() | number:'1.2-2'}}</strong>
              </div>
            </div>
            
            <div class="form-text" *ngIf="orderProducts().length === 0">
              Adicione produtos ao pedido usando o seletor acima
            </div>
          </div>
          
          <button type="submit" class="btn btn-success" [disabled]="!clientId || orderProducts().length === 0">
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
  orderProducts = signal<ProductWithQuantity[]>([]);
  
  clientId = '';
  selectedProductId = '';
  quantityToAdd: number = 1;

  ngOnInit(){
    this.clientsSvc.list().subscribe(c=>{this.clients.set(c);});
    this.productsSvc.list().subscribe(p=> this.products.set(p));
  }

  availableProducts() {
    // Retorna produtos que ainda não foram adicionados ou que podem ser adicionados novamente
    return this.products();
  }

  addProduct() {
    if (!this.selectedProductId) return;
    
    const product = this.products().find(p => p.id === this.selectedProductId);
    if (!product) return;

    const existingIndex = this.orderProducts().findIndex(item => item.product.id === this.selectedProductId);
    
    if (existingIndex >= 0) {
      // Se o produto já existe, aumenta a quantidade
      const updated = [...this.orderProducts()];
      updated[existingIndex].quantity += this.quantityToAdd || 1;
      this.orderProducts.set(updated);
    } else {
      // Adiciona novo produto
      this.orderProducts.set([
        ...this.orderProducts(),
        { product, quantity: this.quantityToAdd || 1 }
      ]);
    }

    // Reset dos campos
    this.selectedProductId = '';
    this.quantityToAdd = 1;
  }

  removeProduct(index: number) {
    const updated = this.orderProducts().filter((_, i) => i !== index);
    this.orderProducts.set(updated);
  }

  increaseQuantity(index: number) {
    const updated = [...this.orderProducts()];
    updated[index].quantity++;
    this.orderProducts.set(updated);
  }

  decreaseQuantity(index: number) {
    const updated = [...this.orderProducts()];
    if (updated[index].quantity > 1) {
      updated[index].quantity--;
      this.orderProducts.set(updated);
    }
  }

  getTotalPrice(): number {
    return this.orderProducts().reduce((total, item) => 
      total + (item.product.price * item.quantity), 0
    );
  }

  create(){
    if(!this.clientId || this.orderProducts().length === 0) return;
    
    // Converte para o formato esperado pelo backend
    const productIds = this.orderProducts().flatMap(item => 
      Array(item.quantity).fill(item.product.id)
    );
    
    this.ordersSvc.create({clientId:this.clientId, productIds}).subscribe(o=>{
      this.router.navigate(['/orders']);
    });
  }
}
