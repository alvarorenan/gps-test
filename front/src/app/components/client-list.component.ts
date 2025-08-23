import { Component, OnInit, inject, signal } from '@angular/core';
import { ClientService } from '../services';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Client } from '../models';

@Component({
  standalone:true,
  selector:'app-client-list',
  imports:[CommonModule, FormsModule],
  template:`
    <div class="row">
      <div class="col-12">
        <h2>Clientes</h2>
        <form class="row g-3 mb-3" (ngSubmit)="add()">
          <div class="col-md-4">
            <input class="form-control" placeholder="Nome" [(ngModel)]="name" name="name" required>
          </div>
          <div class="col-md-4">
            <input class="form-control" placeholder="CPF" [(ngModel)]="cpf" name="cpf" required>
          </div>
          <div class="col-md-4">
            <button type="submit" class="btn btn-primary">Adicionar Cliente</button>
          </div>
        </form>
        <div *ngIf="clients().length" class="table-responsive">
          <table class="table table-striped">
            <thead class="table-dark">
              <tr><th>Nome</th><th>CPF</th><th>ID</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of clients()">
                <td>{{c.name}}</td><td>{{c.cpf}}</td><td><small class="text-muted">{{c.id}}</small></td>
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
  clients = signal<Client[]>([]);
  name = '';
  cpf = '';
  ngOnInit(){ this.refresh(); }
  refresh(){ this.svc.list().subscribe(cs=> this.clients.set(cs)); }
  add(){
    if(!this.name||!this.cpf) return;
    this.svc.create({name:this.name, cpf:this.cpf}).subscribe(()=>{this.name=''; this.cpf=''; this.refresh();});
  }
}
