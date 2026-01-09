
import { Product, AppSettings, UserRole, OrderStatus, Order } from './types';

export const INITIAL_SETTINGS: AppSettings = {
  shopName: 'Shate Bhai CMC',
  logo: 'https://picsum.photos/seed/meatshop/200/200',
  isOpen: true,
  isDeliveryEnabled: true, // Default to enabled
  whatsappSupport: '919876543210',
  supportEmail: 'mdrifas7777@gmail.com',
  upiId: 'shatebhai@upi',
  defaultDeliveryCharge: 40,
  adminEmails: 'mdrifas7777@gmail.com', // Initial admin email
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Farm Fresh Chicken (Curry Cut)',
    description: 'Fresh farm-raised chicken, cleaned and cut into convenient pieces perfect for curries.',
    pricePerKg: 220,
    image: 'https://picsum.photos/seed/chicken1/400/300',
    available: true,
    category: 'Chicken'
  },
  {
    id: '2',
    name: 'Chicken Breast (Boneless)',
    description: 'High-protein, lean boneless chicken breast cuts. Ideal for grilling and healthy meals.',
    pricePerKg: 450,
    image: 'https://picsum.photos/seed/chicken2/400/300',
    available: true,
    category: 'Chicken'
  },
  {
    id: '3',
    name: 'Chicken Drumsticks',
    description: 'Succulent and tender chicken drumsticks. Perfect for tandoori or deep frying.',
    pricePerKg: 380,
    image: 'https://picsum.photos/seed/chicken3/400/300',
    available: true,
    category: 'Chicken'
  },
  {
    id: '4',
    name: 'Whole Chicken (With Skin)',
    description: 'Full whole chicken with skin on, perfect for roasting whole.',
    pricePerKg: 200,
    image: 'https://picsum.photos/seed/chicken4/400/300',
    available: false,
    category: 'Chicken'
  }
];

export const SAMPLE_ORDERS: Order[] = [
  {
    id: 'ORD-12345',
    customerName: 'Arun Kumar',
    customerEmail: 'arun@example.com',
    phone: '9840012345',
    address: '12, Gandhi St, Thiruvallur, Chennai',
    items: [
      { productId: '1', name: 'Farm Fresh Chicken', quantityInKg: 1, price: 220 }
    ],
    subtotal: 220,
    deliveryCharge: 40,
    discount: 0,
    tax: 0,
    total: 260,
    status: OrderStatus.PENDING,
    paymentMethod: 'COD',
    timestamp: new Date().toISOString(),
    isFinalized: false
  }
];
