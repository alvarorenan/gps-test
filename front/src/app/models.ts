export interface Client {
  id: string;
  name: string;
  cpf: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
}

export type OrderStatus = 'Created' | 'Paid' | 'Canceled';

export interface Order {
  id: string;
  clientId: string;
  productIds: string[];
  createdAt: string;
  status: OrderStatus;
}
