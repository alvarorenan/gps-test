export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface OrderWithItems {
  clientId: string;
  items: OrderItem[];
}
