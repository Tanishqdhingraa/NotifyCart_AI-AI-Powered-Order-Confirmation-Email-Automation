import axios from 'axios';
import {
  Customer,
  Product,
  Order,
  EmailApprovalRecord,
  ApprovalAction,
  NotificationRecord,
} from '../types';

const api = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Order Service APIs (Port 3001 via Vite proxy) ---

export async function fetchCustomers(): Promise<Customer[]> {
  const res = await api.get<{ success: boolean; customers: Customer[] }>('/api/customers');
  return res.data.customers;
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await api.get<{ success: boolean; products: Product[] }>('/api/products');
  return res.data.products;
}

export async function placeOrder(payload: {
  customerId: string;
  productId: string;
  quantity: number;
}): Promise<Order> {
  const res = await api.post<{ success: boolean; order: Order }>('/api/orders', payload);
  return res.data.order;
}

export async function fetchOrders(): Promise<Order[]> {
  const res = await api.get<{ success: boolean; orders: Order[] }>('/api/orders');
  return res.data.orders;
}

// --- Email AI / Approval APIs (Port 3002 via Vite proxy) ---

export async function fetchPendingApprovals(): Promise<EmailApprovalRecord[]> {
  const res = await api.get<{ success: boolean; approvals: EmailApprovalRecord[] }>(
    '/api/approvals/pending'
  );
  return res.data.approvals;
}

export async function fetchAllApprovals(): Promise<EmailApprovalRecord[]> {
  const res = await api.get<{ success: boolean; approvals: EmailApprovalRecord[] }>(
    '/api/approvals'
  );
  return res.data.approvals;
}

export async function submitDecision(
  approvalId: string,
  decision: {
    action: ApprovalAction;
    subject?: string;
    body?: string;
    reason?: string;
  },
  reviewerId = 'REV-ADMIN'
): Promise<EmailApprovalRecord> {
  const res = await api.post<{ success: boolean; approval: EmailApprovalRecord }>(
    `/api/approvals/${approvalId}/decision`,
    decision,
    {
      headers: {
        'x-reviewer-id': reviewerId,
      },
    }
  );
  return res.data.approval;
}

// --- Notification APIs (Port 3003 via Vite proxy) ---

export async function fetchNotifications(): Promise<NotificationRecord[]> {
  const res = await api.get<{ success: boolean; notifications: NotificationRecord[] }>(
    '/api/notifications'
  );
  return res.data.notifications;
}

export async function fetchNotificationByOrderId(orderId: string): Promise<NotificationRecord> {
  const res = await api.get<{ success: boolean; notification: NotificationRecord }>(
    `/api/notifications/${orderId}`
  );
  return res.data.notification;
}
