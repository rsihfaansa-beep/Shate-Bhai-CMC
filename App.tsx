
import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, ShoppingCart, Package, 
  LayoutDashboard, ShoppingBag, FileText, Settings,
  LogOut, Plus, Search, ChevronRight, Phone, MapPin, 
  CheckCircle2, AlertTriangle, Trash2, Edit3, Save, Share2,
  X, Printer, MessageSquare, Crosshair,
  Navigation, TrendingUp, Camera
} from 'lucide-react';
import { 
  UserRole, Product, CartItem, Order, AppSettings, 
  OrderStatus
} from './types';
import { 
  INITIAL_SETTINGS, INITIAL_PRODUCTS, SAMPLE_ORDERS 
} from './constants';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Utility Functions ---
const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

const getWhatsAppLink = (phone: string, text?: string) => {
  const clean = phone.replace(/\D/g, '');
  const prefix = (clean.length === 10 && /^[6-9]/.test(clean)) ? '91' : '';
  return `https://wa.me/${prefix}${clean}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// --- Shared Components ---

const Button = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary', 
  disabled = false,
  fullWidth = false,
  type = 'button'
}: { 
  children?: React.ReactNode; 
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; 
  className?: string; 
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success';
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit';
}) => {
  const baseStyles = "px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:active:scale-100 cursor-pointer";
  const variants = {
    primary: "bg-red-600 text-white hover:bg-red-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    danger: "bg-orange-100 text-orange-600 hover:bg-orange-200",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
    outline: "border-2 border-red-600 text-red-600 hover:bg-red-50",
    success: "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-100"
  };

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyles} ${variants[variant as keyof typeof variants] || variants.primary} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

const Header = ({ 
  title, 
  subtitle, 
  showBack = false, 
  onBack = () => {},
  onLogout 
}: { 
  title: string; 
  subtitle?: string; 
  showBack?: boolean; 
  onBack?: () => void;
  onLogout?: () => void;
}) => (
  <header className="bg-white border-b border-gray-100 sticky top-0 z-40 px-6 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {showBack && (
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <ChevronRight className="rotate-180" size={24} />
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-xs text-gray-500 font-medium">{subtitle}</p>}
        </div>
      </div>
      {onLogout && (
        <button 
          onClick={onLogout}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
          title="Logout"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      )}
    </div>
  </header>
);

const Modal = ({ title, children, onClose }: { title: string; children?: React.ReactNode; onClose: () => void }) => (
  <div className="fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
    <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 cursor-pointer">
          <X size={24} />
        </button>
      </div>
      <div className="p-6 max-h-[80vh] overflow-y-auto overflow-x-hidden">
        {children}
      </div>
    </div>
  </div>
);

// --- Pages ---

// 1. LOGIN PAGE (Phone/Email Toggle and OTP flow)
const LoginPage = ({ adminEmails, logo, onLogin }: { adminEmails: string; logo: string; onLogin: (role: UserRole, email: string) => void }) => {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [inputValue, setInputValue] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue) return;

    if (loginMethod === 'phone' && step === 'input') {
      setIsLoading(true);
      setTimeout(() => {
        setStep('otp');
        setIsLoading(false);
      }, 1000);
      return;
    }
    
    const adminsList = adminEmails.split(',').map(e => e.trim().toLowerCase());
    const finalValue = inputValue.trim().toLowerCase();
    
    const role = adminsList.includes(finalValue) ? UserRole.ADMIN : UserRole.CUSTOMER;
    onLogin(role, finalValue);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-8 pt-20 max-w-md mx-auto">
      <div className="flex flex-col items-center mb-12">
        <div className="w-24 h-24 bg-red-600 rounded-[32px] flex items-center justify-center shadow-xl shadow-red-100 mb-6 overflow-hidden">
          <img src={logo} className="w-full h-full object-cover" alt="Logo" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Shate Bhai CMC</h1>
        <p className="text-gray-500 text-center font-medium">Fresh Meat, Quality Assured</p>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-2xl mb-8">
        <button 
          onClick={() => { setLoginMethod('email'); setStep('input'); setInputValue(''); }}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${loginMethod === 'email' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}
        >
          Email
        </button>
        <button 
          onClick={() => { setLoginMethod('phone'); setStep('input'); setInputValue(''); }}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${loginMethod === 'phone' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}
        >
          Phone
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {step === 'input' ? (
          <div>
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">
              {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
            </label>
            <div className="relative">
              {loginMethod === 'phone' && (
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">+91</span>
              )}
              <input 
                type={loginMethod === 'email' ? "email" : "tel"}
                placeholder={loginMethod === 'email' ? "your@email.com" : "98765 43210"}
                className={`w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-red-600 outline-none transition-all font-bold text-gray-900 shadow-sm ${loginMethod === 'phone' ? 'pl-14' : ''}`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                required
              />
            </div>
            <Button 
              fullWidth 
              type="submit" 
              className="py-4 shadow-lg shadow-red-50 mt-6 text-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : (loginMethod === 'email' ? 'Sign In' : 'Get OTP')}
            </Button>
          </div>
        ) : (
          <div className="animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 mb-4">
              <button type="button" onClick={() => setStep('input')} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                <ChevronRight className="rotate-180" size={20} />
              </button>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Verification Code</p>
                <p className="text-sm font-bold text-gray-900">Code sent to +91 {inputValue}</p>
              </div>
            </div>
            <input 
              type="number"
              placeholder="0 0 0 0"
              className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-red-600 outline-none transition-all font-black text-center text-2xl tracking-[1em] text-gray-900 shadow-sm mb-6"
              maxLength={4}
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value)}
              required
            />
            <Button fullWidth type="submit" className="py-4 shadow-lg shadow-red-50 text-lg">
              Verify & Login
            </Button>
          </div>
        )}

        <div className="mt-auto pt-20 text-center border-t border-gray-50">
          <p className="text-xs text-gray-400 font-black uppercase tracking-widest mb-2 px-1">Customer Support</p>
          <p className="text-sm font-black text-gray-900 flex items-center justify-center gap-2">
            <Phone size={14} className="text-red-600" /> +91 98765 43210
          </p>
        </div>
      </form>
    </div>
  );
};

// 2. CUSTOMER - HOME
const CustomerHome = ({ 
  products, 
  settings, 
  onAddToCart,
  onLogout
}: { 
  products: Product[]; 
  settings: AppSettings;
  onAddToCart: (p: Product, qty: number) => void;
  onLogout: () => void;
}) => {
  const [search, setSearch] = useState('');
  const filteredProducts = products.filter(p => p.available && p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="pb-24 animate-in fade-in duration-500">
      <div className="bg-red-600 p-8 rounded-b-[40px] text-white relative shadow-lg shadow-red-50">
        <button onClick={onLogout} className="absolute top-8 right-8 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white" title="Logout">
          <LogOut size={20} />
        </button>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <img src={settings.logo} className="w-12 h-12 rounded-xl object-cover border-2 border-white/20" alt="Logo" />
            <div>
              <h1 className="text-xl font-bold">{settings.shopName}</h1>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${settings.isOpen ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-xs font-medium opacity-90">{settings.isOpen ? 'OPEN NOW' : 'CLOSED'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={20} />
          <input 
            placeholder="Search our fresh stock..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/10 border-white/20 border rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/50 focus:bg-white/20 outline-none transition-all"
          />
        </div>
      </div>

      <div className="px-6 mt-8">
        <h2 className="text-xl font-black text-gray-900 mb-4 tracking-tight">Daily Fresh Cuts</h2>
        {!settings.isOpen && (
          <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-center gap-3 mb-6">
            <AlertTriangle className="text-orange-500" />
            <p className="text-sm font-medium text-orange-700">Shop is closed. Any orders placed will be fulfilled tomorrow morning.</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 flex p-3 gap-4 hover:border-red-100 transition-colors">
              <img src={product.image} className="w-28 h-28 rounded-2xl object-cover border border-gray-50" alt={product.name} />
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">{product.name}</h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-snug">{product.description}</p>
                  <p className="text-red-600 font-black text-lg mt-1">{formatCurrency(product.pricePerKg)}<span className="text-xs text-gray-400 font-normal"> /kg</span></p>
                </div>
                <div className="flex gap-2">
                  {[0.5, 1].map(qty => (
                    <button 
                      key={qty}
                      onClick={() => onAddToCart(product, qty)}
                      className="flex-1 py-2 px-2 bg-gray-50 hover:bg-red-50 border border-gray-100 hover:border-red-100 rounded-lg text-[10px] font-bold text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      +{qty < 1 ? '500g' : '1kg'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && <p className="text-gray-400 italic py-10 text-center font-medium">No items found matching your search.</p>}
        </div>
      </div>
    </div>
  );
};

// 3. CUSTOMER - CART
const CartPage = ({ cart, onRemove, onCheckout, onLogout }: { cart: CartItem[]; onRemove: (id: string) => void; onCheckout: () => void; onLogout: () => void }) => {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantityInKg), 0);

  return (
    <div className="px-0 pb-24 animate-in fade-in duration-300">
      <Header title="Your Basket" onLogout={onLogout} />
      <div className="px-6 py-6">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center">
            <ShoppingCart className="text-gray-200 w-20 h-20 mb-6" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Your basket is currently empty.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item, idx) => (
              <div key={`${item.productId}-${idx}`} className="bg-white p-5 rounded-3xl border border-gray-100 flex justify-between items-center shadow-sm">
                <div>
                  <h4 className="font-bold text-gray-900">{item.name}</h4>
                  <p className="text-xs text-gray-400 font-medium">{item.quantityInKg}kg @ {formatCurrency(item.price)}/kg</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-black text-gray-900">{formatCurrency(item.price * item.quantityInKg)}</span>
                  <button onClick={() => onRemove(item.productId)} className="text-red-500 p-2 hover:bg-red-50 rounded-xl transition-colors cursor-pointer">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            <div className="pt-8 border-t border-gray-100 mt-8 space-y-6">
              <div className="flex justify-between items-center text-lg font-black">
                <span className="text-gray-400 uppercase text-xs tracking-widest">Total Amount</span>
                <span className="text-gray-900 text-2xl">{formatCurrency(subtotal)}</span>
              </div>
              <Button fullWidth onClick={onCheckout} className="py-4 text-lg shadow-xl shadow-red-50">Proceed to Checkout</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 4. CUSTOMER - CHECKOUT
const CheckoutPage = ({ cart, settings, onPlaceOrder, onBack, onLogout }: { cart: CartItem[]; settings: AppSettings; onPlaceOrder: (o: Partial<Order>) => void; onBack: () => void; onLogout: () => void }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
    paymentMethod: 'COD' as 'COD' | 'UPI',
    location: ''
  });
  const [locating, setLocating] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantityInKg), 0);
  const deliveryCharge = settings.isDeliveryEnabled ? settings.defaultDeliveryCharge : 0;
  const total = subtotal + deliveryCharge;

  const handleGetLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      alert("Location services are not supported by this browser.");
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setFormData(prev => ({ ...prev, location: mapsUrl }));
        setLocating(false);
      },
      (err) => {
        console.error("GPS Error:", err);
        alert("Unable to detect location. Please enable GPS permissions.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.phone || !formData.address) return alert("Please fill in all delivery details.");
    onPlaceOrder({
      ...formData,
      items: cart,
      subtotal,
      deliveryCharge,
      total,
      isFinalized: false
    });
  };

  return (
    <div className="px-0 pb-24 animate-in slide-in-from-right duration-300">
      {/* Fix: use the 'onLogout' prop instead of the undefined 'handleLogout' */}
      <Header title="Delivery Details" showBack onBack={onBack} onLogout={onLogout} />
      <div className="px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-2 block px-1">Receiver Name</label>
              <input className="w-full bg-white p-4 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-red-600 font-bold" placeholder="Your full name" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} required />
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-2 block px-1">Contact Phone</label>
              <input className="w-full bg-white p-4 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-red-600 font-bold" placeholder="10-digit mobile number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-2 block px-1">Street Address</label>
              <textarea className="w-full bg-white p-4 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-red-600 font-medium" placeholder="Flat/House No., Building, Landmark" rows={3} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required />
            </div>
            <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${formData.location ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.location ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                 {locating ? <Crosshair className="animate-spin" size={18} /> : (formData.location ? <CheckCircle2 size={18}/> : <MapPin size={18} />)}
              </div>
              <div className="flex-1">
                <p className="text-xs font-black text-gray-900">{formData.location ? 'GPS Locked ✓' : 'Pin Accurate Location'}</p>
                <p className="text-[10px] text-gray-400 font-medium">Helps us find you faster.</p>
              </div>
              <button type="button" onClick={handleGetLocation} className="text-[10px] font-black uppercase text-red-600 underline cursor-pointer">{formData.location ? 'Retake' : 'Use GPS'}</button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-gray-400 uppercase block px-1">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              {['COD', 'UPI'].map(method => (
                <button key={method} type="button" onClick={() => setFormData({...formData, paymentMethod: method as any})} className={`p-4 rounded-2xl border-2 transition-all font-black cursor-pointer text-xs ${formData.paymentMethod === method ? 'border-red-600 bg-red-50 text-red-600' : 'bg-white border-gray-100 text-gray-400'}`}>
                  {method === 'COD' ? 'Cash on Delivery' : 'Online Transfer'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 text-white p-6 rounded-[32px] space-y-3 relative overflow-hidden shadow-2xl">
            <div className="flex justify-between text-white/50 text-xs font-black uppercase tracking-widest"><span>Order Total</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between text-white/50 text-xs font-black uppercase tracking-widest"><span>Delivery Fee</span><span>{deliveryCharge > 0 ? formatCurrency(deliveryCharge) : 'FREE'}</span></div>
            <div className="h-px bg-white/10 my-1" />
            <div className="flex justify-between text-2xl font-black pt-1"><span>Net Amount</span><span className="text-red-500">{formatCurrency(total)}</span></div>
          </div>

          <Button fullWidth type="submit" className="py-4 shadow-xl shadow-red-50 text-lg">Confirm & Place Order</Button>
        </form>
      </div>
    </div>
  );
};

// 5. CUSTOMER - SUCCESS
const SuccessPage = ({ order, settings, onGoToOrders }: { order: Order; settings: AppSettings; onGoToOrders: () => void }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-8 text-center bg-white animate-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-green-100 text-green-600 rounded-[32px] flex items-center justify-center mb-8 shadow-xl shadow-green-50">
        <CheckCircle2 size={48} className="animate-bounce" />
      </div>
      <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Order Placed!</h2>
      <p className="text-gray-500 mb-10 font-medium">Order #{order.id.slice(-6)} received. Our team is preparing your fresh meat for dispatch.</p>
      <div className="w-full space-y-3">
        <Button 
          variant="primary" 
          fullWidth 
          onClick={() => { window.open(getWhatsAppLink(settings.whatsappSupport, `Hi! I've placed an order (#${order.id.slice(-6)}). Total: ${formatCurrency(order.total)}. Please confirm.`)); }}
          className="bg-green-600 hover:bg-green-700 shadow-green-100 py-4"
        >
          <MessageSquare size={18} /> Chat with Shop
        </Button>
        <Button fullWidth onClick={onGoToOrders} variant="outline" className="py-4">Track Status</Button>
      </div>
    </div>
  );
};

// --- Admin Components ---

const AdminProductModal = ({ product, onSave }: { product?: Product; onSave: (p: Product) => void }) => {
  const [formData, setFormData] = useState<Product>(product || {
    id: `prod_${Date.now()}`,
    name: '',
    description: '',
    pricePerKg: 0,
    image: 'https://picsum.photos/seed/chicken/400/300',
    available: true,
    category: 'Chicken'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setFormData({ ...formData, image: base64 });
      } catch (err) { alert("Image load failed."); }
    }
  };

  return (
    <div className="space-y-4 pb-12">
      <div className="relative group rounded-[24px] overflow-hidden border-2 border-gray-100 aspect-video">
        <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
        <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2 font-black cursor-pointer">
          <Camera size={32} /> Update Picture
        </button>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
      </div>
      <div>
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 px-1">Item Title</label>
        <input className="w-full bg-gray-50 p-4 rounded-xl outline-none font-bold focus:ring-2 focus:ring-red-600 shadow-sm border border-transparent focus:border-red-100" placeholder="e.g. Skinless Chicken Curry Cut" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
      </div>
      <div>
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 px-1">Detailed Description</label>
        <textarea className="w-full bg-gray-50 p-4 rounded-xl outline-none font-medium focus:ring-2 focus:ring-red-600 shadow-sm border border-transparent focus:border-red-100" rows={3} placeholder="Cleaned, hygiene processed..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
      </div>
      <div>
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 px-1">Market Price (₹/kg)</label>
        <input type="number" className="w-full bg-gray-50 p-4 rounded-xl outline-none font-black focus:ring-2 focus:ring-red-600 shadow-sm border border-transparent focus:border-red-100" value={formData.pricePerKg} onChange={e => setFormData({...formData, pricePerKg: parseFloat(e.target.value) || 0})} />
      </div>
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mt-2">
        <span className="font-black text-gray-700 text-[10px] uppercase tracking-widest">Inventory Status</span>
        <button onClick={() => setFormData({...formData, available: !formData.available})} className={`w-12 h-6 rounded-full relative transition-all cursor-pointer ${formData.available ? 'bg-green-500 shadow-lg shadow-green-100' : 'bg-gray-300'}`}>
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${formData.available ? 'right-1' : 'left-1'}`} />
        </button>
      </div>
      <Button fullWidth onClick={() => onSave(formData)} className="mt-4">Update Catalog Item</Button>
    </div>
  );
};

const AdminBillModal = ({ order, onSave }: { order: Order; onSave: (o: Order) => void }) => {
  const [formData, setFormData] = useState<Order>({ ...order });
  const calcTotal = (o: Order) => (o.subtotal || 0) + (o.deliveryCharge || 0) + (o.tax || 0) - (o.discount || 0);
  const handleChange = (key: keyof Order, val: number) => {
    const updated = { ...formData, [key]: val || 0 };
    updated.total = calcTotal(updated);
    setFormData(updated);
  };

  return (
    <div className="space-y-4 pb-12">
      <div className="grid grid-cols-2 gap-4">
        {['subtotal', 'deliveryCharge', 'tax', 'discount'].map((key) => (
          <div key={key}>
            <label className="text-[10px] font-black text-gray-400 uppercase block mb-1 px-1 capitalize">{key.replace(/Charge/, '')}</label>
            <input type="number" className="w-full bg-gray-50 p-3 rounded-xl font-black outline-none border border-transparent focus:border-red-100" value={(formData as any)[key]} onChange={e => handleChange(key as any, parseFloat(e.target.value))} />
          </div>
        ))}
      </div>
      <div className="p-4 bg-red-50 rounded-2xl flex justify-between items-center shadow-inner mt-2">
        <span className="font-black text-gray-900 uppercase text-[10px] tracking-widest">Net Receivable</span>
        <span className="text-xl font-black text-red-600">{formatCurrency(formData.total)}</span>
      </div>
      <div className="flex items-center justify-between px-1">
        <span className="font-black text-gray-700 text-[10px] uppercase tracking-widest">Digital Lock</span>
        <select className="bg-gray-100 p-2 rounded-xl outline-none font-black text-[10px] uppercase cursor-pointer" value={formData.isFinalized ? 'final' : 'draft'} onChange={e => setFormData({...formData, isFinalized: e.target.value === 'final'})}>
          <option value="draft">Draft (Editable)</option>
          <option value="final">Finalized (Locked)</option>
        </select>
      </div>
      <Button fullWidth onClick={() => onSave(formData)} className="mt-2">Confirm Adjustment</Button>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [activeTab, setActiveTab] = useState('Home');
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(SAMPLE_ORDERS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutStep, setCheckoutStep] = useState<'browsing' | 'checkout' | 'success' | 'invoice'>('browsing');
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingBill, setEditingBill] = useState<Order | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Order | null>(null);
  const [tempSettings, setTempSettings] = useState<AppSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Persistence
  useEffect(() => {
    const data = localStorage.getItem('sb_store_v3');
    if (data) {
      try {
        const p = JSON.parse(data);
        if (p.settings) { setSettings(p.settings); setTempSettings(p.settings); }
        if (p.products) setProducts(p.products);
        if (p.orders) setOrders(p.orders);
      } catch (e) { console.error("Persistence Load Error", e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sb_store_v3', JSON.stringify({ settings, products, orders }));
  }, [settings, products, orders]);

  const handleLogin = (role: UserRole, email: string) => {
    setUserRole(role); 
    setCurrentUserEmail(email); 
    setIsLoggedIn(true);
    setActiveTab(role === UserRole.ADMIN ? 'Dashboard' : 'Home');
  };

  const handleLogout = () => { 
    setIsLoggedIn(false); 
    setCart([]); 
    setCheckoutStep('browsing'); 
    setActiveTab('Home'); 
    setCurrentUserEmail('');
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    setSettings(tempSettings);
    setTimeout(() => setIsSaving(false), 800);
  };

  const handleAddToCart = (product: Product, qty: number) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.productId === product.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantityInKg: next[idx].quantityInKg + qty };
        return next;
      }
      return [...prev, { productId: product.id, name: product.name, quantityInKg: qty, price: product.pricePerKg }];
    });
  };

  const renderInvoiceView = (order: Order) => (
    <div className="pb-32 px-0 animate-in fade-in duration-300">
      <Header title="Order Receipt" showBack onBack={() => { setCheckoutStep('browsing'); setViewingInvoice(null); }} onLogout={handleLogout} />
      <div className="px-6 py-6">
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-2xl space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <img src={settings.logo} className="w-16 h-16 rounded-2xl mb-2 object-cover border" alt="Logo" />
              <h2 className="text-xl font-black text-gray-900 leading-tight">{settings.shopName}</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Premium Fresh Meat</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Status</p>
              <p className={`text-sm font-black uppercase ${order.status === OrderStatus.DELIVERED ? 'text-green-600' : 'text-orange-600'}`}>{order.status}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm border-y border-gray-100 py-6">
            <div className="space-y-1">
              <p className="text-gray-400 font-black mb-1 uppercase text-[10px] tracking-widest">Customer</p>
              <p className="font-black text-gray-900">{order.customerName}</p>
              <p className="text-xs text-gray-500 font-bold">{order.phone}</p>
              <p className="text-[11px] text-gray-400 font-medium leading-tight">{order.address}</p>
              {order.location && <button onClick={() => window.open(order.location)} className="text-[10px] font-black text-blue-600 mt-2 flex items-center gap-1 hover:underline bg-blue-50 py-1.5 px-3 rounded-lg"><Navigation size={12} /> Live GPS</button>}
            </div>
            <div className="text-right space-y-3">
              <div>
                <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Placed On</p>
                <p className="font-black text-gray-900">{new Date(order.timestamp).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Order ID</p>
                <p className="font-black text-gray-900">#{order.id.slice(-6)}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-black text-gray-900 text-sm">{item.name}</p>
                  <p className="text-xs text-gray-400 font-bold">{item.quantityInKg}kg × {formatCurrency(item.price)}</p>
                </div>
                <span className="font-black text-gray-900">{formatCurrency(item.price * item.quantityInKg)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-6 space-y-2 text-sm">
            <div className="flex justify-between text-gray-500 font-bold"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
            <div className="flex justify-between text-gray-500 font-bold"><span>Delivery Charge</span><span>{order.deliveryCharge > 0 ? formatCurrency(order.deliveryCharge) : 'FREE'}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-green-600 font-bold"><span>Adjustment</span><span>-{formatCurrency(order.discount)}</span></div>}
            <div className="flex justify-between font-black text-3xl pt-6 text-gray-900 border-t-2 border-gray-900 mt-4">
              <span className="uppercase tracking-tighter">Net Pay</span>
              <span className="text-red-600">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-8">
          <Button variant="outline" className="py-4" onClick={() => window.print()}><Printer size={20} /> Print</Button>
          <Button className="py-4" onClick={() => window.open(getWhatsAppLink(settings.whatsappSupport, `Receipt for Order #${order.id.slice(-6)}. Total: ${formatCurrency(order.total)}`))}><Share2 size={20} /> Share</Button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (userRole === UserRole.ADMIN) {
      switch (activeTab) {
        case 'Dashboard': return <div className="pb-24"><Header title="Control Center" onLogout={handleLogout} /><AdminDashboard orders={orders} /></div>;
        case 'Products': return (
          <div className="px-0 pb-24">
            <Header title="Manage Catalog" onLogout={handleLogout} />
            <div className="px-6 py-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Daily Stock</h2>
                <Button variant="outline" className="py-2 px-4 text-xs" onClick={() => setShowAddProduct(true)}><Plus size={16} /> New Item</Button>
              </div>
              <AdminProducts products={products} onToggle={id => setProducts(products.map(p => p.id === id ? {...p, available: !p.available} : p))} onEdit={setEditingProduct} />
            </div>
          </div>
        );
        case 'Orders': return (
          <div className="pb-24">
            {viewingInvoice ? renderInvoiceView(viewingInvoice) : (
              <>
                <Header title="Sale Logs" onLogout={handleLogout} />
                <AdminOrders orders={orders} onUpdateStatus={(id, s) => setOrders(orders.map(o => o.id === id ? {...o, status: s} : o))} onEditBill={setEditingBill} onViewInvoice={setViewingInvoice} />
              </>
            )}
          </div>
        );
        case 'Settings': return (
          <div className="px-0 pb-24">
            <Header title="System Config" onLogout={handleLogout} />
            <div className="px-6 py-6 space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-gray-900 tracking-tight">App Configuration</h2>
                <Button variant={isSaving ? "success" : "primary"} onClick={handleSaveSettings} disabled={isSaving} className="py-2 px-6 text-xs">
                  {isSaving ? <CheckCircle2 size={16} className="animate-bounce" /> : <Save size={16} />}
                  {isSaving ? 'Updating...' : 'Save Config'}
                </Button>
              </div>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-xl space-y-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative w-28 h-28 rounded-[36px] overflow-hidden border-4 border-white shadow-2xl">
                      <img src={tempSettings.logo} className="w-full h-full object-cover" alt="Shop Logo" />
                      <button onClick={() => logoInputRef.current?.click()} className="absolute bottom-0 right-0 bg-red-600 text-white p-2.5 rounded-tl-2xl shadow-lg"><Camera size={18} /></button>
                      <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={async (e) => { if (e.target.files?.[0]) setTempSettings({...tempSettings, logo: await fileToBase64(e.target.files[0])}); }} />
                    </div>
                  </div>
                  <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block px-1">Shop Title</label><input value={tempSettings.shopName} onChange={e => setTempSettings({...tempSettings, shopName: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-black text-gray-900" /></div>
                  <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block px-1">WhatsApp Primary</label><input value={tempSettings.whatsappSupport} onChange={e => setTempSettings({...tempSettings, whatsappSupport: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-black text-gray-900" /></div>
                  <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block px-1">Merchant UPI ID</label><input value={tempSettings.upiId} onChange={e => setTempSettings({...tempSettings, upiId: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-black text-gray-900" /></div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-3xl border border-gray-100">
                    <div><p className="font-black text-sm text-gray-900">Delivery Logic</p><p className="text-[10px] font-bold text-gray-400 uppercase">{tempSettings.isDeliveryEnabled ? 'Active Surcharge' : 'Free Fulfillment'}</p></div>
                    <button onClick={() => setTempSettings({...tempSettings, isDeliveryEnabled: !tempSettings.isDeliveryEnabled})} className={`w-14 h-7 rounded-full relative transition-all shadow-inner ${tempSettings.isDeliveryEnabled ? 'bg-red-600' : 'bg-gray-300'}`}><div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${tempSettings.isDeliveryEnabled ? 'right-1' : 'left-1'}`} /></button>
                  </div>
                  {tempSettings.isDeliveryEnabled && <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block px-1">Base Charge (₹)</label><input type="number" value={tempSettings.defaultDeliveryCharge} onChange={e => setTempSettings({...tempSettings, defaultDeliveryCharge: parseFloat(e.target.value) || 0})} className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-black text-gray-900" /></div>}
                </div>
                <div className="flex items-center justify-between bg-white p-6 rounded-[32px] border border-gray-100 shadow-xl">
                  <div className="flex items-center gap-3"><div className={`w-3 h-3 rounded-full ${tempSettings.isOpen ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} /><p className="font-black text-gray-900 uppercase text-[10px] tracking-widest">Public Visibility</p></div>
                  <button onClick={() => setTempSettings({...tempSettings, isOpen: !tempSettings.isOpen})} className={`w-14 h-8 rounded-full relative transition-all shadow-inner ${tempSettings.isOpen ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${tempSettings.isOpen ? 'right-1' : 'left-1'}`} /></button>
                </div>
                <Button fullWidth variant="danger" className="py-4 rounded-[28px] uppercase font-black" onClick={handleLogout}><LogOut size={20} /> Terminate Admin Session</Button>
              </div>
            </div>
          </div>
        );
        default: return <AdminDashboard orders={orders} />;
      }
    } else {
      if (checkoutStep === 'checkout') return <CheckoutPage cart={cart} settings={settings} onPlaceOrder={(o) => { const ord: Order = { ...o as Order, id: `ORD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, customerEmail: currentUserEmail, timestamp: new Date().toISOString(), status: OrderStatus.PENDING }; setOrders([ord, ...orders]); setLastOrder(ord); setCart([]); setCheckoutStep('success'); }} onBack={() => setCheckoutStep('browsing')} onLogout={handleLogout} />;
      if (checkoutStep === 'success' && lastOrder) return <SuccessPage order={lastOrder} settings={settings} onGoToOrders={() => { setCheckoutStep('browsing'); setActiveTab('My Orders'); }} />;
      if (checkoutStep === 'invoice' && viewingInvoice) return renderInvoiceView(viewingInvoice);
      switch (activeTab) {
        case 'Home': return <CustomerHome products={products} settings={settings} onAddToCart={handleAddToCart} onLogout={handleLogout} />;
        case 'Cart': return <CartPage cart={cart} onRemove={id => setCart(cart.filter(i => i.productId !== id))} onCheckout={() => setCheckoutStep('checkout')} onLogout={handleLogout} />;
        case 'My Orders': return (
          <div className="px-0 pb-24 animate-in fade-in duration-300">
            <Header title="Orders History" onLogout={handleLogout} />
            <div className="px-6 py-6 space-y-4">
              {orders.filter(o => o.customerEmail === currentUserEmail).map(order => (
                <div key={order.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-xl flex justify-between items-center active:scale-95 transition-all">
                  <div><h4 className="font-black text-gray-900 tracking-tight">Order #{order.id.slice(-6)}</h4><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(order.timestamp).toLocaleDateString()}</p></div>
                  <div className="flex flex-col items-end gap-2"><span className="text-xl font-black text-red-600">{formatCurrency(order.total)}</span><Button variant="ghost" className="py-1.5 px-4 text-[10px] bg-gray-50 border border-gray-100 rounded-xl uppercase font-black tracking-widest" onClick={() => { setViewingInvoice(order); setCheckoutStep('invoice'); }}>View Bill</Button></div>
                </div>
              ))}
              {orders.filter(o => o.customerEmail === currentUserEmail).length === 0 && <div className="flex flex-col items-center py-20 text-center opacity-30"><Package size={64} className="mb-4" /><p className="font-black uppercase tracking-widest text-[10px]">No records found</p></div>}
            </div>
          </div>
        );
        default: return <CustomerHome products={products} settings={settings} onAddToCart={handleAddToCart} onLogout={handleLogout} />;
      }
    }
  };

  if (!isLoggedIn) return <LoginPage adminEmails={settings.adminEmails} logo={settings.logo} onLogin={handleLogin} />;

  const navItems = userRole === UserRole.ADMIN 
    ? [{ name: 'Dashboard', icon: LayoutDashboard }, { name: 'Products', icon: ShoppingBag }, { name: 'Orders', icon: Package }, { name: 'Settings', icon: Settings }]
    : [{ name: 'Home', icon: Home }, { name: 'Cart', icon: ShoppingCart, badge: cart.length }, { name: 'My Orders', icon: Package }];

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 shadow-2xl relative pb-10 overflow-x-hidden">
      <div className="pb-4">{renderContent()}</div>
      {userRole === UserRole.ADMIN && (
        <>
          {showAddProduct && <Modal title="Register Stock" onClose={() => setShowAddProduct(false)}><AdminProductModal onSave={p => { setProducts([p, ...products]); setShowAddProduct(false); }} /></Modal>}
          {editingProduct && <Modal title="Modify Stock" onClose={() => setEditingProduct(null)}><AdminProductModal product={editingProduct} onSave={p => { setProducts(products.map(old => old.id === p.id ? p : old)); setEditingProduct(null); }} /></Modal>}
          {editingBill && <Modal title="Revise Invoice" onClose={() => setEditingBill(null)}><AdminBillModal order={editingBill} onSave={o => { setOrders(orders.map(old => old.id === o.id ? o : old)); setEditingBill(null); }} /></Modal>}
        </>
      )}
      {(checkoutStep === 'browsing' && !viewingInvoice) && (
        <nav className="fixed bottom-0 max-w-md w-full bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.06)]">
          {navItems.map((item) => (
            <button key={item.name} onClick={() => { setActiveTab(item.name); setViewingInvoice(null); if (item.name === 'Settings') setTempSettings(settings); }} className={`flex flex-col items-center gap-1 transition-all active:scale-75 group cursor-pointer ${activeTab === item.name ? 'text-red-600' : 'text-gray-400 hover:text-gray-600'}`}>
              <div className="relative"><item.icon size={22} strokeWidth={activeTab === item.name ? 3 : 2} className="transition-transform group-hover:scale-110" />{item.badge ? <span className="absolute -top-2 -right-3 bg-red-600 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-lg">{item.badge}</span> : null}</div>
              <span className={`text-[9px] font-black uppercase tracking-tighter ${activeTab === item.name ? 'opacity-100' : 'opacity-60'}`}>{item.name}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

// --- Admin Sub-components ---

const AdminDashboard = ({ orders }: { orders: Order[] }) => {
  const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingCount = orders.filter(o => o.status === OrderStatus.PENDING).length;
  const stats = [ { label: "Gross Sales", value: formatCurrency(totalSales), icon: TrendingUp, color: 'bg-green-600' }, { label: "Queue", value: pendingCount, icon: AlertTriangle, color: 'bg-orange-600' } ];
  return (
    <div className="px-6 py-6 space-y-8 animate-in fade-in duration-500">
      <h2 className="text-3xl font-black text-gray-900 tracking-tight">App Statistics</h2>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-xl">
            <div className={`${stat.color} w-10 h-10 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg`}><stat.icon size={20} /></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-xl font-black text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white p-8 rounded-[40px] border border-gray-100 h-60 w-full shadow-2xl">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Sales Velocity (Weekly)</p>
        <ResponsiveContainer width="100%" height="80%">
          <LineChart data={[{ n: 'M', s: 42 }, { n: 'T', s: 38 }, { n: 'W', s: 59 }, { n: 'T', s: 45 }, { n: 'F', s: 72 }, { n: 'S', s: 98 }, { n: 'S', s: 125 }]}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" /><XAxis dataKey="n" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#ccc'}} /><YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#ccc'}} /><Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} /><Line type="monotone" dataKey="s" stroke="#dc2626" strokeWidth={5} dot={{r: 6, fill: '#dc2626', strokeWidth: 0}} /></LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const AdminProducts = ({ products, onToggle, onEdit }: { products: Product[]; onToggle: (id: string) => void; onEdit: (p: Product) => void }) => (
  <div className="space-y-5">
    {products.map(p => (
      <div key={p.id} className="bg-white p-5 rounded-[36px] border border-gray-100 flex gap-4 shadow-xl active:scale-98 transition-all">
        <img src={p.image} className="w-24 h-24 rounded-[28px] object-cover border-2 border-gray-50 shadow-md" alt={p.name} />
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <div className="flex justify-between items-start">
              <h4 className="font-black text-gray-900 text-sm leading-tight max-w-[110px]">{p.name}</h4>
              <div className={`w-3 h-3 rounded-full ${p.available ? 'bg-green-500 shadow-lg shadow-green-100' : 'bg-gray-300'}`} />
            </div>
            <p className="text-[10px] text-gray-400 mt-1 line-clamp-1 italic">{p.description || "No description provided."}</p>
            <p className="text-lg font-black text-red-600 mt-1">{formatCurrency(p.pricePerKg)}<span className="text-[10px] text-gray-400 font-bold ml-1 uppercase">/kg</span></p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onToggle(p.id)} className={`flex-1 text-[9px] font-black px-4 py-2.5 rounded-xl uppercase tracking-widest transition-all ${p.available ? 'bg-gray-100 text-gray-600' : 'bg-red-600 text-white shadow-lg shadow-red-100'}`}>{p.available ? 'Disable' : 'Enable'}</button>
            <button onClick={() => onEdit(p)} className="flex-1 text-[9px] font-black bg-white border border-gray-100 text-gray-400 px-4 py-2.5 rounded-xl uppercase tracking-widest shadow-sm">Config</button>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const AdminOrders = ({ orders, onUpdateStatus, onEditBill, onViewInvoice }: { orders: Order[]; onUpdateStatus: (id: string, s: OrderStatus) => void; onEditBill: (o: Order) => void; onViewInvoice: (o: Order) => void }) => (
  <div className="px-6 py-6 space-y-6">
    {orders.map(order => (
      <div key={order.id} className="bg-white p-7 rounded-[40px] border border-gray-100 shadow-2xl space-y-6 relative overflow-hidden transition-all">
        <div className="flex justify-between items-start">
          <div><p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">ORDER ID #{order.id.slice(-6)}</p><h4 className="font-black text-2xl text-gray-900 tracking-tighter">{order.customerName}</h4><p className="text-xs text-gray-500 font-bold flex items-center gap-1 mt-1"><Phone size={10} className="text-green-500"/> {order.phone}</p></div>
          <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm ${order.status === OrderStatus.PENDING ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>{order.status}</span>
        </div>
        <div className="bg-gray-50 p-5 rounded-[32px] space-y-2 shadow-inner border border-gray-100/50">
          {order.items.map((item, i) => <div key={i} className="text-[11px] font-bold text-gray-500 flex justify-between"><span>{item.name} ({item.quantityInKg}kg)</span><span className="text-gray-900 font-black">{formatCurrency(item.price * item.quantityInKg)}</span></div>)}
          <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-center"><span className="font-black text-[10px] uppercase text-gray-400 tracking-widest">Payable Total</span><span className="text-xl font-black text-red-600 tracking-tighter">{formatCurrency(order.total)}</span></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => window.open(order.location || `https://www.google.com/maps?q=${encodeURIComponent(order.address)}`)} className="flex-1 py-3 text-[10px] border border-gray-200 text-gray-500 font-black uppercase rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all cursor-pointer shadow-sm">
            <Navigation size={14} className="text-blue-500" /> Dispatch
          </button>
          <button onClick={() => onEditBill(order)} className="flex-1 py-3 text-[10px] border border-gray-200 text-gray-500 font-black uppercase rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all cursor-pointer shadow-sm">
            <Edit3 size={14} className="text-orange-500" /> Adjust
          </button>
          <Button variant="ghost" className="col-span-2 py-4 text-[10px] bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl font-black uppercase tracking-widest shadow-sm" onClick={() => onViewInvoice(order)}><FileText size={16} className="text-red-500" /> Digital Invoice</Button>
          {order.status === OrderStatus.PENDING && <Button variant="primary" className="col-span-2 py-4 rounded-[22px] text-base font-black shadow-xl shadow-red-50 uppercase tracking-widest" onClick={() => onUpdateStatus(order.id, OrderStatus.DELIVERED)}>Mark as Delivered</Button>}
        </div>
      </div>
    ))}
  </div>
);
