import { Component, OnInit, inject, signal } from '@angular/core';
import { ProductService } from '../services';
import { Product } from '../models';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  standalone:true,
  selector:'app-product-list',
  imports:[CommonModule, ReactiveFormsModule],
  template:`
    <div class="row">
      <div class="col-12">
        <h2>Produtos</h2>
        <form [formGroup]="productForm" class="row g-3 mb-3" (ngSubmit)="add()">
          <div class="col-md-4">
            <input 
              class="form-control" 
              placeholder="Nome do produto *" 
              formControlName="name"
              [class.is-invalid]="productForm.get('name')?.invalid && productForm.get('name')?.touched"
              maxlength="200">
            <div class="invalid-feedback" *ngIf="productForm.get('name')?.invalid && productForm.get('name')?.touched">
              <div *ngIf="productForm.get('name')?.errors?.['required']">Nome é obrigatório</div>
              <div *ngIf="productForm.get('name')?.errors?.['minlength']">Nome deve ter pelo menos 2 caracteres</div>
            </div>
          </div>
          <div class="col-md-4">
            <input 
              class="form-control" 
              type="number" 
              step="0.01" 
              min="0"
              placeholder="Preço *" 
              formControlName="price"
              [class.is-invalid]="productForm.get('price')?.invalid && productForm.get('price')?.touched">
            <div class="invalid-feedback" *ngIf="productForm.get('price')?.invalid && productForm.get('price')?.touched">
              <div *ngIf="productForm.get('price')?.errors?.['required']">Preço é obrigatório</div>
              <div *ngIf="productForm.get('price')?.errors?.['min']">Preço deve ser maior que zero</div>
            </div>
          </div>
          <div class="col-md-4">
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="productForm.invalid || isSubmitting">
              <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
              {{ isSubmitting ? 'Adicionando...' : 'Adicionar Produto' }}
            </button>
          </div>
        </form>
        
        <!-- Mensagem de erro geral -->
        <div *ngIf="showValidationError" class="alert alert-danger alert-dismissible fade show">
          <strong>Atenção!</strong> Preencha todos os campos obrigatórios corretamente.
          <button type="button" class="btn-close" (click)="showValidationError = false"></button>
        </div>
        
        <!-- Mensagem de sucesso -->
        <div *ngIf="showSuccessMessage" class="alert alert-success alert-dismissible fade show">
          <strong>Sucesso!</strong> Produto adicionado com sucesso.
          <button type="button" class="btn-close" (click)="showSuccessMessage = false"></button>
        </div>

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
  private fb = inject(FormBuilder);
  
  products = signal<Product[]>([]);
  productForm: FormGroup;
  isSubmitting = false;
  showValidationError = false;
  showSuccessMessage = false;

  constructor() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      price: [0, [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit() { 
    this.refresh(); 
  }

  refresh() { 
    this.svc.list().subscribe(ps => this.products.set(ps)); 
  }

  add() {
    // Marcar todos os campos como touched para mostrar validações
    this.productForm.markAllAsTouched();
    
    if (this.productForm.invalid) {
      this.showValidationError = true;
      this.showSuccessMessage = false;
      setTimeout(() => this.showValidationError = false, 5000);
      return;
    }

    this.isSubmitting = true;
    this.showValidationError = false;
    
    const formValue = this.productForm.value;
    
    this.svc.create({
      name: formValue.name.trim(),
      price: parseFloat(formValue.price)
    }).subscribe({
      next: () => {
        this.productForm.reset();
        this.productForm.patchValue({ price: 0 }); // Reset price to 0
        this.showSuccessMessage = true;
        this.isSubmitting = false;
        this.refresh();
        setTimeout(() => this.showSuccessMessage = false, 3000);
      },
      error: () => {
        this.isSubmitting = false;
        this.showValidationError = true;
        setTimeout(() => this.showValidationError = false, 5000);
      }
    });
  }
}
