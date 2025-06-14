import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-neutral-800 text-white">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Information */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/img/logo-removebg.png" alt="TrustMed Logo" className="w-100 h-12 object-contain" />
            </div>
            <p className="text-neutral-300 mb-4">
              Your trusted healthcare partner, connecting patients with doctors and providing easy access to medical services and medications.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-neutral-300 hover:text-primary-300 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/medicines" className="text-neutral-300 hover:text-primary-300 transition-colors">
                  Medicines
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-neutral-300 hover:text-primary-300 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">Our Services</h3>
            <ul className="space-y-2">
              <li className="text-neutral-300">Medicine Delivery</li>
              <li className="text-neutral-300">Prescription Management</li>
              <li className="text-neutral-300">Health Records</li>
              <li className="text-neutral-300">24/7 Customer Support</li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-primary-300 flex-shrink-0 mt-1" />
                <span className="text-neutral-300">
                  TrustMed Hospital,
                  Delhi - 110092
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-primary-300" />
                <span className="text-neutral-300">011 35631520</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="text-primary-300" />
                <span className="text-neutral-300">contact@trustmed.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock size={20} className="text-primary-300" />
                <span className="text-neutral-300">Mon-Sat: 8AM - 8PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-700 mt-8 pt-6 text-center text-neutral-400 text-sm">
          <p>TrustMed - Where Trust Meets Medication</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;