import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { useCart } from '../../contexts/CartContext';
import { Menu, X, User, ShoppingCart, LogIn } from 'lucide-react';

const Navbar = () => {
  const { user } = useContext(UserContext);
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'patient') return '/patient/dashboard';
    return '/doctor/dashboard';
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/img/logo.png" alt="TrustMed Logo" className="w-300 h-12 object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-neutral-700 hover:text-primary-500 transition-colors">
              Home
            </Link>
            <Link to="/medicines" className="text-neutral-700 hover:text-primary-500 transition-colors">
              Medicines
            </Link>
            <Link to="/about" className="text-neutral-700 hover:text-primary-500 transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-neutral-700 hover:text-primary-500 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {user.role === 'patient' && (
                  <Link to="/patient/cart" className="relative p-2 text-neutral-700 hover:text-primary-500 transition-colors">
                    <ShoppingCart size={20} />
                    {getCartCount() > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-500 text-neutral-800 rounded-full flex items-center justify-center text-xs font-medium">
                        {getCartCount()}
                      </span>
                    )}
                  </Link>
                )}
                <Link 
                  to={getDashboardLink()} 
                  className="btn btn-primary"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center gap-2 text-neutral-700 hover:text-primary-500 transition-colors">
                  <LogIn size={20} />
                  <span>Login</span>
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            {user && user.role === 'patient' && (
              <Link to="/patient/cart" className="relative p-2 text-neutral-700">
                <ShoppingCart size={20} />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-500 text-neutral-800 rounded-full flex items-center justify-center text-xs font-medium">
                    {getCartCount()}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={toggleMenu}
              className="p-2 text-neutral-700 hover:text-primary-500 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200 animate-slide-up">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="py-2 text-neutral-700 hover:text-primary-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/medicines" 
                className="py-2 text-neutral-700 hover:text-primary-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Medicines
              </Link>
              <Link 
                to="/about" 
                className="py-2 text-neutral-700 hover:text-primary-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="py-2 text-neutral-700 hover:text-primary-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              
              <div className="border-t border-neutral-200 pt-4 mt-2">
                {user ? (
                  <Link 
                    to={getDashboardLink()} 
                    className="w-full btn btn-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link 
                      to="/login" 
                      className="w-full btn btn-outline"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link 
                      to="/register" 
                      className="w-full btn btn-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;