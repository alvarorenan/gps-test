export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'canceled';
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderHistory {
  id: string;
  orderId: string;
  action: string;
  details: string;
  timestamp: Date;
}
