export type OrderStatus = 'Created' | 'Paid' | 'Canceled';

export interface OrderItem {
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
}

export interface Order {
  id: string;
  clientId: string;
  productIds: string[];
  createdAt: string;
  status: OrderStatus;
}

export interface OrderHistory {
  id: string;
  orderId: string;
  action: string;
  details: string;
  timestamp: Date;
}
