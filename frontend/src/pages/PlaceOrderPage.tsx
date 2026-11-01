import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  fetchCustomers,
  fetchProducts,
  placeOrder,
} from '../services/api';
import { Customer, Product, Order } from '../types';
import {
  ShoppingBag,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Truck,
  Receipt,
} from 'lucide-react';

export const PlaceOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [cList, pList] = await Promise.all([
          fetchCustomers(),
          fetchProducts(),
        ]);
        setCustomers(cList);
        setProducts(pList);
        if (cList.length > 0) setSelectedCustomerId(cList[0].id);
        if (pList.length > 0) setSelectedProductId(pList[0].id);
      } catch (err: unknown) {
        setError('Failed to load customers or products. Make sure the Order Service is running on port 3001.');
      } finally {
        setLoading(false);
      }
    };

    loadMasterData();
  }, []);

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Live client-side preview calculations (actual authoritative calculation happens on backend)
  const unitPrice = selectedProduct?.price || 0;
  const estimatedSubtotal = Math.round((unitPrice * quantity + Number.EPSILON) * 100) / 100;
  const estimatedShipping = estimatedSubtotal >= 1000 ? 0 : 50;
  const estimatedTax = Math.round((estimatedSubtotal * 0.18 + Number.EPSILON) * 100) / 100;
  const estimatedTotal = Math.round((estimatedSubtotal + estimatedShipping + estimatedTax + Number.EPSILON) * 100) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedProductId || quantity <= 0) {
      setError('Please select a valid customer, product, and positive quantity.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const order = await placeOrder({
        customerId: selectedCustomerId,
        productId: selectedProductId,
        quantity,
      });

      setCreatedOrder(order);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error creating order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <ShoppingBag className="w-7 h-7 text-blue-600" />
          <span>Place Customer Order</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Select customer details and product items. The Order Service will calculate taxes, shipping, and publish an event to initiate the AI email generation workflow.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Order Confirmation Card */}
      {createdOrder ? (
        <div className="bg-white rounded-3xl border border-emerald-200 shadow-xl p-8 space-y-6 animate-scale-up">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Order Successfully Placed</span>
              <h2 className="text-2xl font-black text-slate-900">{createdOrder.id}</h2>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-sm text-emerald-900 space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Event Flow Triggered:</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              The Order Service has published an <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-200">order.created</code> event. The Email AI Service has generated an email confirmation and paused execution in the Human-in-the-Loop review queue.
            </p>
          </div>

          {/* Order Details Receipt */}
          <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center text-sm pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-400">Customer</span>
                <p className="font-bold text-slate-800">{createdOrder.customerName}</p>
                <p className="text-xs text-slate-500">{createdOrder.customerEmail}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Order Total</span>
                <p className="text-xl font-black text-blue-600">{createdOrder.currency} {createdOrder.totalAmount.toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-600">
              {createdOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{it.productName} (x{it.quantity})</span>
                  <span className="font-semibold text-slate-800">{createdOrder.currency} {it.itemTotal.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between text-xs text-slate-500">
                <span>Shipping</span>
                <span>{createdOrder.shippingAmount === 0 ? 'FREE' : `${createdOrder.currency} ${createdOrder.shippingAmount.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>GST Tax (18%)</span>
                <span>{createdOrder.currency} {createdOrder.taxAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Navigation */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/approvals"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              <span>Go to Approvals Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/notifications"
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
            >
              Track Notification Status
            </Link>
            <button
              onClick={() => {
                setCreatedOrder(null);
                setQuantity(1);
              }}
              className="px-5 py-3 rounded-xl text-slate-500 hover:text-slate-800 font-semibold text-sm transition-colors"
            >
              Place Another Order
            </button>
          </div>
        </div>
      ) : (
        /* Order Input Form */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <form onSubmit={handleSubmit} className="md:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            
            {/* Customer Dropdown */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                1. Select Customer
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              >
                {customers.map((cust) => (
                  <option key={cust.id} value={cust.id}>
                    {cust.name} ({cust.email}) — [{cust.id}]
                  </option>
                ))}
              </select>
            </div>

            {/* Product Dropdown */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                2. Select Product
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              >
                {products.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.name} — ₹{prod.price.toFixed(2)} [{prod.id}]
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                3. Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-lg text-slate-700 flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-20 text-center font-bold text-slate-900 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-lg text-slate-700 flex items-center justify-center transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading || submitting}
                className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{submitting ? 'Placing Order & Invoking AI...' : 'Place Order'}</span>
              </button>
            </div>

          </form>

          {/* Financial Calculation Summary Card */}
          <div className="space-y-4">
            <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-5 shadow-lg">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <Receipt className="w-4 h-4 text-blue-400" />
                <span>Order Summary</span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Unit Price</span>
                  <span>₹{unitPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal ({quantity} item{quantity > 1 ? 's' : ''})</span>
                  <span>₹{estimatedSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Shipping</span>
                  </span>
                  <span className={estimatedShipping === 0 ? 'text-emerald-400 font-semibold' : ''}>
                    {estimatedShipping === 0 ? 'FREE (>= ₹1,000)' : `₹${estimatedShipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Taxes (GST 18%)</span>
                  <span>₹{estimatedTax.toFixed(2)}</span>
                </div>
                
                <div className="pt-3 border-t border-slate-800 flex justify-between text-base font-bold text-white">
                  <span>Total Amount</span>
                  <span className="text-xl text-blue-400">₹{estimatedTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/50 text-xs text-slate-400">
                🛡️ <span className="font-semibold text-slate-300">Backend Authority:</span> Totals are calculated authoritatively by the Order Service. Client totals are purely for preview.
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
