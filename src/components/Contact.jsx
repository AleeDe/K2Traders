import React, { useState, useEffect } from "react";
import { Phone, Mail, MapPin, Clock, Globe } from "lucide-react";
import ContactForm from "./ContactForm.jsx";
import { useSettings } from "../hooks/useSettings.js";

const Contact = () => {
  const { settings } = useSettings();
  const [loading, setLoading] = useState(true);

  // scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setLoading(false), 1000); // simulate loading
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    // 🔹 Skeleton Loader
    return (
      <section className="py-20 bg-gradient-to-b from-white via-green-50 to-white animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="text-center mb-16">
            <div className="h-10 w-64 bg-gray-200 mx-auto rounded-lg mb-4"></div>
            <div className="h-5 w-96 bg-gray-200 mx-auto rounded-lg"></div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left side */}
            <div className="space-y-6">
              {Array(4)
                .fill("")
                .map((_, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
                      <div className="h-3 w-48 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              <div className="p-6 bg-gray-100 rounded-2xl space-y-3">
                <div className="h-4 w-48 bg-gray-200 rounded"></div>
                <div className="h-3 w-full bg-gray-200 rounded"></div>
                <div className="h-3 w-2/3 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Right side (form skeleton) */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-green-100">
              <div className="space-y-4">
                {Array(3)
                  .fill("")
                  .map((_, idx) => (
                    <div key={idx} className="h-10 bg-gray-200 rounded"></div>
                  ))}
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-10 w-32 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 🔹 Real Content
  return (
    <section
      id="contact"
      className="py-20 bg-gradient-to-b from-white via-green-50 to-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight drop-shadow">
            Get in Touch
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto text-lg">
            Have questions about our products or want to place a wholesale order? We're here to help!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              Contact Information
            </h3>

            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center shadow">
                  <Phone className="h-7 w-7 text-green-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Phone</h4>
                  <p className="text-gray-700">{settings?.contact_phone || ''}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center shadow">
                  <Mail className="h-7 w-7 text-green-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Email</h4>
                  <p className="text-gray-700">{settings?.contact_email || ''}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center shadow">
                  <MapPin className="h-7 w-7 text-green-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Location</h4>
                  <p className="text-gray-700">{settings?.contact_address || ''}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center shadow">
                  <Clock className="h-7 w-7 text-green-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Business Hours</h4>
                  <p className="text-gray-700">Mon - Sat: 9:00 AM - 6:00 PM PST</p>
                  <p className="text-gray-700">Sunday: 10:00 AM - 4:00 PM PST</p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100 shadow">
              <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-500" />
                Wholesale & Export
              </h4>
              <p className="text-green-700 mb-3">
                Whether you're a business looking to stock premium natural products or an individual seeking authentic Balti goods, we offer flexible bulk and retail orders with worldwide shipping.
              </p>
              <p className="text-sm text-green-600">
                Contact us for special wholesale pricing and export arrangements.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="bg-white/90 rounded-2xl shadow-2xl p-8 border border-green-100 backdrop-blur-lg">
              <ContactForm title="Send us a Message" formType="contact" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
