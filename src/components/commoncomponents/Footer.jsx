import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mountain,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  MessageCircle,
  Linkedin,
  Twitter,
  ArrowRight
} from 'lucide-react';
import { useSettings } from '../../hooks/useSettings.js';

const Footer = () => {
  const { settings } = useSettings();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e?.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    setSubscribed(true);
    setEmail('');
  };

  return (
  <footer className="bg-gradient-to-t from-green-900 via-green-800 to-green-950 text-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <Mountain className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold">{settings?.name || 'K2 Traders'}</h3>
                <p className="text-green-200 text-sm">{settings?.tagline || ''}</p>
              </div>
            </div>

            <p className="text-green-200 mb-6 max-w-md leading-relaxed">
              {settings?.description || ''}
            </p>

            <div className="flex items-center gap-3">
              <a
                href={settings?.social_facebook}
                aria-label="Facebook"
                className="w-10 h-10 bg-white/6 hover:bg-white/10 rounded-full flex items-center justify-center transition"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={settings?.social_instagram}
                aria-label="Instagram"
                className="w-10 h-10 bg-white/6 hover:bg-white/10 rounded-full flex items-center justify-center transition"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={settings?.social_whatsapp}
                aria-label="WhatsApp"
                className="w-10 h-10 bg-white/6 hover:bg-white/10 rounded-full flex items-center justify-center transition"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              <a
                href={'#'}
                aria-label="LinkedIn"
                className="w-10 h-10 bg-white/6 hover:bg-white/10 rounded-full flex items-center justify-center transition"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2 text-green-200">
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/shop" className="hover:text-white transition">Shop</Link></li>
              <li><Link to="/about" className="hover:text-white transition">About</Link></li>
              <li><Link to="/brand-story" className="hover:text-white transition">Brand Story</Link></li>
              <li><Link to="/blog" className="hover:text-white transition">Blog</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Contact</h4>
            <div className="text-green-200 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/6 rounded-md">
                  <Phone className="h-5 w-5 text-green-100" />
                </div>
                <div>
                  <div className="text-sm">Phone</div>
                  <div className="text-sm font-medium">{settings?.contact_phone || ''}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/6 rounded-md">
                  <Mail className="h-5 w-5 text-green-100" />
                </div>
                <div>
                  <div className="text-sm">Email</div>
                  <div className="text-sm font-medium">{settings?.contact_email || ''}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/6 rounded-md">
                  <MapPin className="h-5 w-5 text-green-100" />
                </div>
                <div>
                  <div className="text-sm">Address</div>
                  <div className="text-sm font-medium">{settings?.contact_address || ''}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter / CTA */}
        <div className="mt-10 border-t border-green-800 pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h4 className="text-xl font-extrabold text-white">Stay in the loop</h4>
            <p className="text-green-200 max-w-xl">
              Join our newsletter for exclusive drops, seasonal offers, and stories from Baltistan.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="flex sm:flex-row flex-col gap-3 items-center">
            <label htmlFor="footer-newsletter" className="sr-only">Email</label>
            <input
              id="footer-newsletter"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="sm:w-64 max-w-xs rounded-lg border border-green-700 bg-white/5 px-3 py-2 text-green-50 placeholder-green-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              aria-label="Enter your email for newsletter"
            />
            <button
              type="submit"
              disabled={loading || subscribed}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 font-semibold text-white shadow hover:from-green-600 hover:to-emerald-600 transition disabled:opacity-60"
            >
              {loading ? 'Subscribing...' : subscribed ? 'Subscribed' : 'Subscribe'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Footer bottom */}
        <div className="mt-8 border-t border-green-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-green-300 text-sm">
            © {new Date().getFullYear()} {settings?.name || 'K2 Traders'}. Made with 💚 in Baltistan.
          </p>

          <div className="flex items-center gap-4 text-green-200">
            <a href={'#'} className="text-sm hover:text-white transition">Privacy</a>
            <a href={'#'} className="text-sm hover:text-white transition">Terms</a>
            <a href={'#'} className="text-sm hover:text-white transition">Shipping</a>
            <Link to="/admin/login" className="text-xs opacity-30 hover:opacity-100 transition">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;