import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, Clipboard, Pill as PillBottle, Award, Users, Clock, ShieldCheck } from 'lucide-react';

const HomePage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="animate-fade-in">
              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
                Your Health, Our Priority
              </h1>
              <p className="text-lg mb-8 text-white/90">
                Seamlessly connect with doctors, manage prescriptions, and order medicines
                from the comfort of your home.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="btn bg-white text-primary-600 hover:bg-neutral-100">
                  Get Started
                </Link>
                <Link to="/about" className="btn border border-white text-white hover:bg-white/10">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src="https://images.pexels.com/photos/7579831/pexels-photo-7579831.jpeg?auto=compress&cs=tinysrgb&w=800" 
                alt="TrustMed Healthcare" 
                className="rounded-lg shadow-xl max-h-[400px] object-cover w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold mb-4">How TrustMed Works</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              We provide a seamless healthcare experience from booking appointments to
              receiving medications at your doorstep.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-neutral-50 rounded-lg p-6 text-center transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px]">
              <div className="bg-primary-100 text-primary-600 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <Search size={28} />
              </div>
              <h3 className="font-heading font-semibold text-xl mb-2">Find a Doctor</h3>
              <p className="text-neutral-600">
                Search for specialists based on your medical needs and read their profiles.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-neutral-50 rounded-lg p-6 text-center transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px]">
              <div className="bg-primary-100 text-primary-600 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <Calendar size={28} />
              </div>
              <h3 className="font-heading font-semibold text-xl mb-2">Book Appointment</h3>
              <p className="text-neutral-600">
                Schedule appointments based on doctor availability and your preferred time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-neutral-50 rounded-lg p-6 text-center transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px]">
              <div className="bg-primary-100 text-primary-600 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <Clipboard size={28} />
              </div>
              <h3 className="font-heading font-semibold text-xl mb-2">Get Prescription</h3>
              <p className="text-neutral-600">
                Receive detailed digital prescriptions from your doctor after consultation.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-neutral-50 rounded-lg p-6 text-center transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px]">
              <div className="bg-primary-100 text-primary-600 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <PillBottle size={28} />
              </div>
              <h3 className="font-heading font-semibold text-xl mb-2">Order Medicines</h3>
              <p className="text-neutral-600">
                Order prescribed medications with just a few clicks and get them delivered.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold mb-4">Our Services</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Comprehensive healthcare solutions designed to make your medical journey smoother.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="bg-white rounded-lg shadow-card p-6">
              <div className="text-primary-500 mb-4">
                <Calendar size={32} />
              </div>
              <h3 className="font-heading font-semibold text-xl mb-2">Online Appointments</h3>
              <p className="text-neutral-600 mb-4">
                Book appointments with specialists without the hassle of phone calls or visiting in person.
              </p>
              <ul className="space-y-2 text-neutral-600">
                <li className="flex items-start gap-2">
                  <span className="text-success-500 mt-1">✓</span>
                  <span>Search by specialty or doctor name</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success-500 mt-1">✓</span>
                  <span>View real-time availability</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success-500 mt-1">✓</span>
                  <span>Receive appointment reminders</span>
                </li>
              </ul>
            </div>

            {/* Service 2 */}
            <div className="bg-white rounded-lg shadow-card p-6">
              <div className="text-primary-500 mb-4">
                <Clipboard size={32} />
              </div>
              <h3 className="font-heading font-semibold text-xl mb-2">Digital Prescriptions</h3>
              <p className="text-neutral-600 mb-4">
                Access your prescriptions digitally anytime, anywhere without worrying about losing paper copies.
              </p>
              <ul className="space-y-2 text-neutral-600">
                <li className="flex items-start gap-2">
                  <span className="text-success-500 mt-1">✓</span>
                  <span>Detailed medication instructions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success-500 mt-1">✓</span>
                  <span>Doctor's comments and advice</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success-500 mt-1">✓</span>
                  <span>Prescription history access</span>
                </li>
              </ul>
            </div>

            {/* Service 3 */}
            <div className="bg-white rounded-lg shadow-card p-6">
              <div className="text-primary-500 mb-4">
                <PillBottle size={32} />
              </div>
              <h3 className="font-heading font-semibold text-xl mb-2">Medicine Delivery</h3>
              <p className="text-neutral-600 mb-4">
                Get your medications delivered to your doorstep without needing to visit a pharmacy.
              </p>
              <ul className="space-y-2 text-neutral-600">
                <li className="flex items-start gap-2">
                  <span className="text-success-500 mt-1">✓</span>
                  <span>Order directly from prescriptions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success-500 mt-1">✓</span>
                  <span>Upload handwritten prescriptions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success-500 mt-1">✓</span>
                  <span>Track your medicine orders</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold mb-4">Why Choose TrustMed</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              We're committed to providing exceptional healthcare services with convenience and reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Reason 1 */}
            <div className="flex flex-col items-center text-center p-4">
              <div className="bg-primary-50 text-primary-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Award size={24} />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Qualified Doctors</h3>
              <p className="text-neutral-600">
                Our platform features verified and experienced healthcare professionals.
              </p>
            </div>

            {/* Reason 2 */}
            <div className="flex flex-col items-center text-center p-4">
              <div className="bg-primary-50 text-primary-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Users size={24} />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Patient-Centered</h3>
              <p className="text-neutral-600">
                Everything we do is designed with your convenience and health in mind.
              </p>
            </div>

            {/* Reason 3 */}
            <div className="flex flex-col items-center text-center p-4">
              <div className="bg-primary-50 text-primary-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Clock size={24} />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">24/7 Availability</h3>
              <p className="text-neutral-600">
                Access your prescriptions and order medicines any time of day or night.
              </p>
            </div>

            {/* Reason 4 */}
            <div className="flex flex-col items-center text-center p-4">
              <div className="bg-primary-50 text-primary-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Secure & Private</h3>
              <p className="text-neutral-600">
                Your health information is protected with the highest security standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-secondary-500 to-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
            Ready to Experience Better Healthcare?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Join TrustMed today and discover a new way to manage your healthcare needs.
            Book appointments, get prescriptions, and order medicines—all in one place.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn bg-white text-primary-600 hover:bg-neutral-100">
              Sign Up Now
            </Link>
            <Link to="/contact" className="btn border border-white text-white hover:bg-white/10">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;