import React from 'react';
import { CheckCircle, Star, Gift, Sparkles } from 'lucide-react';
import ContactForm from './ContactForm.jsx';

const CheckIn = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-green-500 via-green-600 to-green-700 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-24 h-24 border-4 border-white/20 rounded-full animate-pulse" />
        <div className="absolute top-32 right-20 w-16 h-16 border-4 border-white/20 rounded-full animate-pulse" />
        <div className="absolute bottom-20 left-1/4 w-20 h-20 border-4 border-white/20 rounded-full animate-pulse" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-400/10 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="text-white">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-6 shadow-lg backdrop-blur">
              <Gift className="w-4 h-4 mr-2" />
              Exclusive Benefits
            </div>
            
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 drop-shadow tracking-tight">
              Join Our Community
            </h2>
            
            <p className="text-lg text-green-100 mb-8 leading-relaxed">
              Connect with us to receive exclusive offers, product updates, and stories from Baltistan. Be the first to know about new arrivals and seasonal specialties.
            </p>

            {/* Benefits */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-300 animate-bounce" />
                <span className="text-green-100">Exclusive product previews and early access</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-300 animate-bounce" />
                <span className="text-green-100">Special discounts and seasonal offers</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-300 animate-bounce" />
                <span className="text-green-100">Stories and updates from Baltistan</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-300 animate-bounce" />
                <span className="text-green-100">Product recommendations and usage tips</span>
              </div>
            </div>

            {/* Testimonial */}
            <div className="mt-10 p-6 bg-white/10 rounded-2xl backdrop-blur border border-white/20 shadow-lg">
              <div className="flex items-center mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current animate-pulse" />
                ))}
                <Sparkles className="h-5 w-5 text-green-200 ml-2 animate-spin-slow" />
              </div>
              <p className="text-green-100 mb-3 italic">
                "The quality of K2 Traders products is exceptional. You can taste the purity of the Himalayas in every bite!"
              </p>
              <p className="text-green-300 text-sm">- Sarah M., Regular Customer</p>
            </div>
          </div>

          {/* Right Content - Form */}
          <div>
            <div className="bg-white/90 rounded-2xl shadow-2xl p-8 border border-green-100 backdrop-blur-lg">
              <ContactForm title="Stay Connected" formType="checkin" />
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .animate-spin-slow {
          animation: spin 2.5s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default CheckIn;