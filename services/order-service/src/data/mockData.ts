import { Customer, Product } from '../types/order.types';

export const mockCustomers: Customer[] = [
  { id: 'CUST-101', name: 'Rahul Sharma', email: 'rahul.sharma@example.com' },
  { id: 'CUST-102', name: 'Priya Patel', email: 'priya.patel@example.com' },
  { id: 'CUST-103', name: 'Amit Verma', email: 'amit.verma@example.com' },
];

export const mockProducts: Product[] = [
  { id: 'PROD-501', name: 'Wireless Headphones', price: 999.99 },
  { id: 'PROD-502', name: 'Mechanical Keyboard', price: 1499.00 },
  { id: 'PROD-503', name: 'Gaming Mouse', price: 499.50 },
  { id: 'PROD-504', name: '4K Monitor Stand', price: 799.00 },
];
