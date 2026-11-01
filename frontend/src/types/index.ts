export interface Customer {
  id: string;
  name: string;
  email: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  itemTotal: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  currency: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
}

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'EDITED_AND_APPROVED' | 'REJECTED';
export type ApprovalAction = 'APPROVE' | 'EDIT' | 'REJECT';

export interface EmailApprovalRecord {
  id: string;
  orderId: string;
  threadId: string;
  recipientEmail: string;
  customerName: string;
  originalSubject: string;
  originalBody: string;
  editedSubject?: string;
  editedBody?: string;
  finalSubject?: string;
  finalBody?: string;
  status: ApprovalStatus;
  reviewerId?: string;
  rejectionReason?: string;
  createdAt: string;
  reviewedAt?: string;
  deliveryStatus?: 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED';
  deliveryError?: string;
  messageId?: string;
  order: Order;
}

export type NotificationStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'AWAITING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'SENDING'
  | 'SENT'
  | 'FAILED';

export interface NotificationRecord {
  id: string;
  orderId: string;
  approvalId?: string;
  recipientEmail: string;
  subject?: string;
  status: NotificationStatus;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
}
