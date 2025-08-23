import { Component, OnInit, inject, signal } from '@angular/core';
import { ProductService } from '../services';
import { Product } from '../models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone:true,
  selector:'app-product-list',
  imports:[CommonModule, FormsModule],
  template:`
    <div class="row">
      <div class="col-12">
        <h2>Produtos</h2>
        <form class="row g-3 mb-3" (ngSubmit)="add()">
          <div class="col-md-4">
            <input class="form-control" placeholder="Nome do produto" [(ngModel)]="name" name="name" required>
          </div>
          <div class="col-md-4">
            <input class="form-control" type="number" step="0.01" placeholder="Preço" [(ngModel)]="price" name="price" required>
          </div>
          <div class="col-md-4">
            <button type="submit" class="btn btn-primary">Adicionar Produto</button>
          </div>
        </form>
        <div *ngIf="products().length" class="table-responsive">
          <table class="table table-striped">
            <thead class="table-dark">
              <tr><th>Nome</th><th>Preço</th><th>ID</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of products()">
                <td>{{p.name}}</td>
                <td>R$ {{p.price | number:'1.2-2'}}</td>
                <td><small class="text-muted">{{p.id}}</small></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div *ngIf="!products().length" class="alert alert-info">
          Nenhum produto cadastrado ainda.
        </div>
      </div>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  private svc = inject(ProductService);
  products = signal<Product[]>([]);
  name='';
  price: number = 0;
  ngOnInit(){ this.refresh(); }
  refresh(){ this.svc.list().subscribe(ps=> this.products.set(ps)); }
  add(){
    if(!this.name||!this.price) return;
    this.svc.create({name:this.name, price:this.price}).subscribe(()=>{this.name=''; this.price=0; this.refresh();});
  }
}
