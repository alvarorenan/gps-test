import { Component, OnInit, inject, signal } from '@angular/core';
import { ClientService } from '../services';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Client } from '../models';
import { CpfFormatterService } from '../services/cpf-formatter.service';

@Component({
  standalone:true,
  selector:'app-client-list',
  imports:[CommonModule, ReactiveFormsModule, FormsModule],
  template:`
    <div class="row">
      <div class="col-12">
        <h2>Clientes</h2>
        <form [formGroup]="clientForm" class="row g-3 mb-3" (ngSubmit)="add()">
          <div class="col-md-4">
            <input 
              class="form-control" 
              placeholder="Nome *" 
              formControlName="name"
              [class.is-invalid]="clientForm.get('name')?.invalid && clientForm.get('name')?.touched"
              maxlength="100">
            <div class="invalid-feedback" *ngIf="clientForm.get('name')?.invalid && clientForm.get('name')?.touched">
              <div *ngIf="clientForm.get('name')?.errors?.['required']">Nome é obrigatório</div>
              <div *ngIf="clientForm.get('name')?.errors?.['minlength']">Nome deve ter pelo menos 2 caracteres</div>
            </div>
          </div>
          <div class="col-md-4">
            <input 
              class="form-control" 
              placeholder="CPF *" 
              formControlName="cpf"
              [class.is-invalid]="clientForm.get('cpf')?.invalid && clientForm.get('cpf')?.touched"
              (input)="formatCpf($event)"
              maxlength="14">
            <div class="invalid-feedback" *ngIf="clientForm.get('cpf')?.invalid && clientForm.get('cpf')?.touched">
              <div *ngIf="clientForm.get('cpf')?.errors?.['required']">CPF é obrigatório</div>
              <div *ngIf="clientForm.get('cpf')?.errors?.['pattern']">CPF deve ter formato válido (000.000.000-00)</div>
            </div>
          </div>
          <div class="col-md-4">
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="clientForm.invalid || isSubmitting">
              <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
              {{ isSubmitting ? 'Adicionando...' : 'Adicionar Cliente' }}
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
          <strong>Sucesso!</strong> Cliente adicionado com sucesso.
          <button type="button" class="btn-close" (click)="showSuccessMessage = false"></button>
        </div>

        <div *ngIf="clients().length" class="table-responsive">
          <table class="table table-striped">
            <thead class="table-dark">
              <tr><th>Nome</th><th>CPF</th><th>ID</th><th>Ações</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of clients()">
                <td>
                  <span *ngIf="editingId !== c.id">{{c.name}}</span>
                  <input *ngIf="editingId === c.id" 
                         [(ngModel)]="editForm.name" 
                         class="form-control form-control-sm"
                         [class.is-invalid]="editForm.name.trim().length < 2"
                         placeholder="Nome mínimo 2 caracteres">
                </td>
                <td>
                  <span *ngIf="editingId !== c.id">{{formatCpfDisplay(c.cpf)}}</span>
                  <input *ngIf="editingId === c.id" 
                         [(ngModel)]="editForm.cpf" 
                         class="form-control form-control-sm"
                         [class.is-invalid]="editForm.cpf.trim().length === 0"
                         placeholder="000.000.000-00"
                         maxlength="14"
                         (input)="formatEditCpf($event)">
                </td>
                <td><small class="text-muted">{{c.id}}</small></td>
                <td>
                  <div *ngIf="editingId !== c.id" class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" (click)="startEdit(c)">
                      <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-outline-danger" (click)="delete(c)">
                      <i class="fas fa-trash"></i> Excluir
                    </button>
                  </div>
                  <div *ngIf="editingId === c.id" class="btn-group btn-group-sm">
                    <button class="btn btn-success" (click)="saveEdit(c.id)">
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
        <div *ngIf="!clients().length" class="alert alert-info">
          Nenhum cliente cadastrado ainda.
        </div>
      </div>
    </div>
  `
})
export class ClientListComponent implements OnInit {
  private svc = inject(ClientService);
  private fb = inject(FormBuilder);
  private cpfFormatter = inject(CpfFormatterService);
  
  clients = signal<Client[]>([]);
  clientForm: FormGroup;
  isSubmitting = false;
  showValidationError = false;
  showSuccessMessage = false;
  validationErrors: string[] = [];
  
  // Edição inline
  editingId: string | null = null;
  editForm = { name: '', cpf: '' };
  editValidationErrors: string[] = [];

  constructor() {
    this.clientForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      cpf: ['', [Validators.required]]
    });
  }

  ngOnInit() { 
    this.refresh(); 
  }

  refresh() { 
    this.svc.list().subscribe((cs: Client[]) => this.clients.set(cs)); 
  }

  formatCpf(event: any) {
    const input = event.target;
    const cleanValue = this.cpfFormatter.limitTo11Digits(input.value);
    const formattedValue = this.cpfFormatter.format(cleanValue);
    
    input.value = formattedValue;
    this.clientForm.patchValue({ cpf: formattedValue });
  }

  formatCpfDisplay(cpf: string): string {
    return this.cpfFormatter.formatForDisplay(cpf);
  }

  add() {
    // Validações básicas no frontend
    this.clientForm.markAllAsTouched();
    
    if (this.clientForm.invalid) {
      this.validationErrors = ['Por favor, preencha todos os campos obrigatórios'];
      this.showValidationError = true;
      this.showSuccessMessage = false;
      setTimeout(() => this.showValidationError = false, 5000);
      return;
    }

    this.isSubmitting = true;
    this.showValidationError = false;
    this.validationErrors = [];
    
    const formValue = this.clientForm.value;
    const cleanCpf = this.cpfFormatter.clean(formValue.cpf);
    
    this.svc.create({
      name: formValue.name.trim(),
      cpf: cleanCpf
    }).subscribe({
      next: () => {
        this.clientForm.reset();
        this.showSuccessMessage = true;
        this.isSubmitting = false;
        this.refresh();
        setTimeout(() => this.showSuccessMessage = false, 3000);
      },
      error: (error: any) => {
        this.isSubmitting = false;
        if (error.error?.error) {
          this.validationErrors = [error.error.error];
        } else if (error.status === 409) {
          this.validationErrors = ['CPF já está cadastrado no sistema'];
        } else if (error.status === 400) {
          this.validationErrors = ['Dados inválidos. Verifique os campos'];
        } else {
          this.validationErrors = ['Erro ao criar cliente. Tente novamente'];
        }
        this.showValidationError = true;
        setTimeout(() => this.showValidationError = false, 5000);
      }
    });
  }

  startEdit(client: Client) {
    this.editingId = client.id;
    this.editForm = {
      name: client.name,
      cpf: this.cpfFormatter.formatForDisplay(client.cpf)
    };
    this.editValidationErrors = [];
  }

  cancelEdit() {
    this.editingId = null;
    this.editForm = { name: '', cpf: '' };
    this.editValidationErrors = [];
  }

  saveEdit(id: string) {
    // Validações básicas
    if (!this.editForm.name.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    if (this.editForm.name.trim().length < 2) {
      alert('Nome deve ter pelo menos 2 caracteres');
      return;
    }

    if (!this.editForm.cpf.trim()) {
      alert('CPF é obrigatório');
      return;
    }
    
    const cleanCpf = this.cpfFormatter.clean(this.editForm.cpf);
    
    this.svc.update(id, {
      name: this.editForm.name.trim(),
      cpf: cleanCpf
    }).subscribe({
      next: () => {
        this.editingId = null;
        this.editValidationErrors = [];
        this.refresh();
      },
      error: (error: any) => {
        console.error('Erro ao atualizar cliente:', error);
        let errorMessage = 'Erro ao atualizar cliente';
        
        if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.status === 409) {
          errorMessage = 'CPF já está cadastrado em outro cliente';
        } else if (error.status === 400) {
          errorMessage = 'Dados inválidos. Verifique os campos';
        }
        
        alert(errorMessage);
      }
    });
  }

  delete(client: Client) {
    if (confirm(`Tem certeza que deseja excluir o cliente "${client.name}"?`)) {
      this.svc.delete(client.id).subscribe({
        next: () => {
          this.refresh();
        },
        error: (error) => {
          console.error('Erro ao excluir cliente:', error);
          alert('Erro ao excluir cliente');
        }
      });
    }
  }

  formatEditCpf(event: any) {
    const input = event.target;
    const cleanValue = this.cpfFormatter.limitTo11Digits(input.value);
    const formattedValue = this.cpfFormatter.format(cleanValue);
    
    this.editForm.cpf = formattedValue;
    input.value = formattedValue;
  }
}
