import { Routes } from '@angular/router';
import { ClientListComponent } from './components/client-list.component';
import { ProductListComponent } from './components/product-list.component';
import { OrderListComponent } from './components/order-list.component';
import { OrderCreateComponent } from './components/order-create.component';
import { HistoryListComponent } from './components/history-list.component';

export const routes: Routes = [
	{ path: '', pathMatch:'full', redirectTo:'orders' },
	{ path: 'clients', component: ClientListComponent },
	{ path: 'products', component: ProductListComponent },
	{ path: 'orders', component: OrderListComponent },
	{ path: 'orders/new', component: OrderCreateComponent },
	{ path: 'history', component: HistoryListComponent },
];
