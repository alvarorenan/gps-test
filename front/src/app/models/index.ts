export * from './client.model';
export * from './product.model';
export * from './order.model';
export interface PagedResult<T>{ items:T[]; page:number; pageSize:number; totalCount:number; totalPages:number; }
