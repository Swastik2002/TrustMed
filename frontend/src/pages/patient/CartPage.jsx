import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { ShoppingCart, Trash2, Plus, Minus, ChevronLeft } from 'lucide-react';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleQuantityChange = (itemId, newQuantity) => {
    updateQuantity(itemId, newQuantity);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/patient/checkout');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/patient/medicines" className="text-neutral-600 hover:text-neutral-800">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="font-heading text-2xl font-bold text-neutral-800">Shopping Cart</h1>
      </div>
      
      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-card p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-neutral-600">{item.category}</p>
                    <p className="text-primary-600 font-medium mt-1">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="p-1 text-neutral-600 hover:text-neutral-800"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="p-1 text-neutral-600 hover:text-neutral-800"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 text-error-600 hover:text-error-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="text-center">
              <Link to="/medicines" className="btn btn-outline mt-6">
                Browse More Medicines
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span className="font-medium">₹{getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Delivery Fee</span>
                <span className="font-medium">₹5.00</span>
              </div>
              <div className="border-t border-neutral-200 pt-3">
                <div className="flex justify-between">
                  <span className="font-medium">Total</span>
                  <span className="font-medium">₹{(getCartTotal() + 5).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="btn btn-primary w-full mt-6"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-card">
          <div className="bg-neutral-100 p-3 rounded-full inline-flex items-center justify-center mb-3">
            <ShoppingCart size={24} className="text-neutral-500" />
          </div>
          <p className="text-neutral-600 mb-4">Your cart is empty</p>
          <Link to="/medicines" className="btn btn-primary">
            Browse Medicines
          </Link>
        </div>
      )}
    </div>
  );
};

export default CartPage;
