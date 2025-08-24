import { Component, OnInit, inject, signal } from '@angular/core';
import { ProductService } from '../services';
import { Product } from '../models';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';

@Component({
  standalone:true,
  selector:'app-product-list',
  imports:[CommonModule, ReactiveFormsModule, FormsModule],
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
          <strong>Erro de validação:</strong>
          <ul class="mb-0 mt-1" *ngIf="validationErrors.length > 0">
            <li *ngFor="let error of validationErrors">{{ error }}</li>
          </ul>
          <div *ngIf="validationErrors.length === 0">Preencha todos os campos obrigatórios corretamente.</div>
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
              <tr><th>Nome</th><th>Preço</th><th>ID</th><th>Ações</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of products()">
                <td>
                  <span *ngIf="editingId !== p.id">{{p.name}}</span>
                  <input *ngIf="editingId === p.id" 
                         [(ngModel)]="editForm.name" 
                         class="form-control form-control-sm"
                         [class.is-invalid]="editForm.name.trim().length === 0"
                         placeholder="Nome obrigatório">
                </td>
                <td>
                  <span *ngIf="editingId !== p.id">R$ {{p.price | number:'1.2-2'}}</span>
                  <input *ngIf="editingId === p.id" 
                         type="number" 
                         step="0.01" 
                         [(ngModel)]="editForm.price" 
                         class="form-control form-control-sm"
                         placeholder="Preço obrigatório">
                </td>
                <td><small class="text-muted">{{p.id}}</small></td>
                <td>
                  <div *ngIf="editingId !== p.id" class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" (click)="startEdit(p)">
                      <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-outline-danger" (click)="delete(p)">
                      <i class="fas fa-trash"></i> Excluir
                    </button>
                  </div>
                  <div *ngIf="editingId === p.id" class="btn-group btn-group-sm">
                    <button class="btn btn-success" (click)="saveEdit(p.id)">
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
  validationErrors: string[] = [];
  
  // Edição inline
  editingId: string | null = null;
  editForm = { name: '', price: 0 };
  editValidationErrors: string[] = [];

  constructor() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      price: [0, [Validators.required]] // Apenas obrigatório, validação de valor > 0 no backend
    });
  }

  ngOnInit() { 
    this.refresh(); 
  }

  refresh() { 
    this.svc.list().subscribe((ps: Product[]) => this.products.set(ps)); 
  }

  add() {
    // Validações básicas no frontend
    this.productForm.markAllAsTouched();
    
    if (this.productForm.invalid) {
      this.validationErrors = ['Por favor, preencha todos os campos obrigatórios'];
      this.showValidationError = true;
      this.showSuccessMessage = false;
      setTimeout(() => this.showValidationError = false, 5000);
      return;
    }

    this.isSubmitting = true;
    this.showValidationError = false;
    this.validationErrors = [];
    
    const formValue = this.productForm.value;
    
    this.svc.create({
      name: formValue.name.trim(),
      price: parseFloat(formValue.price)
    }).subscribe({
      next: () => {
        this.productForm.reset();
        this.productForm.patchValue({ price: 0 });
        this.showSuccessMessage = true;
        this.isSubmitting = false;
        this.refresh();
        setTimeout(() => this.showSuccessMessage = false, 3000);
      },
      error: (error: any) => {
        this.isSubmitting = false;
        if (error.error?.error) {
          this.validationErrors = [error.error.error];
        } else if (error.status === 400) {
          this.validationErrors = ['Dados inválidos. Verifique os campos'];
        } else {
          this.validationErrors = ['Erro ao criar produto. Tente novamente'];
        }
        this.showValidationError = true;
        setTimeout(() => this.showValidationError = false, 5000);
      }
    });
  }

  startEdit(product: Product) {
    this.editingId = product.id;
    this.editForm = {
      name: product.name,
      price: product.price
    };
  }

  cancelEdit() {
    this.editingId = null;
    this.editForm = { name: '', price: 0 };
  }

  saveEdit(id: string) {
    // Validações básicas de UX apenas
    if (!this.editForm.name.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    if (this.editForm.price == null || this.editForm.price === undefined) {
      alert('Preço é obrigatório');
      return;
    }
    
    this.svc.update(id, {
      name: this.editForm.name.trim(),
      price: this.editForm.price
    }).subscribe({
      next: () => {
        this.editingId = null;
        this.editValidationErrors = [];
        this.refresh();
      },
      error: (error: any) => {
        console.error('Erro ao atualizar produto:', error);
        let errorMessage = 'Erro ao atualizar produto';
        
        if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.status === 400) {
          errorMessage = 'Dados inválidos. Verifique os campos';
        }
        
        alert(errorMessage);
      }
    });
  }

  delete(product: Product) {
    if (confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
      this.svc.delete(product.id).subscribe({
        next: () => {
          this.refresh();
        },
        error: (error: any) => {
          console.error('Erro ao excluir produto:', error);
          alert('Erro ao excluir produto');
        }
      });
    }
  }
}
