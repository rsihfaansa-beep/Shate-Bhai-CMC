
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN'
}

export enum OrderStatus {
  PENDING = 'Pending',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled'
}

export enum ComplaintStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved'
}

export interface Product {
  id: string;
  name: string;
  description: string;
  pricePerKg: number;
  image: string;
  available: boolean;
  category: string;
}

export interface CartItem {
  productId: string;
  name: string;
  quantityInKg: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  location?: string; // Google Maps link
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod: 'COD' | 'UPI';
  timestamp: string;
  isFinalized: boolean; // For invoice editing
}

export interface Complaint {
  id: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
  type: 'Delay' | 'Quality' | 'Payment' | 'Other';
  message: string;
  status: ComplaintStatus;
  timestamp: string;
}

export interface AppSettings {
  shopName: string;
  logo: string;
  isOpen: boolean;
  isDeliveryEnabled: boolean; // New toggle field
  whatsappSupport: string;
  supportEmail: string;
  upiId: string;
  defaultDeliveryCharge: number;
  adminEmails: string; // Comma separated list of admin emails
}

export interface SalesData {
  time: string;
  amount: number;
}
