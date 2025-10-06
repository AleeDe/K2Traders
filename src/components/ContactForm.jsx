import React, { useState } from 'react';

const ContactForm = ({ title = 'Get in touch', formType = 'contact' }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    productInterest: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic client-side validation
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulate network request — replace with real endpoint if available
      await new Promise((r) => setTimeout(r, 800));

      // Example: send to API
      // await fetch('/api/contact', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ formType, ...formData }) });

      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        productInterest: ''
      });
    } catch (err) {
      setIsSubmitting(false);
      setSubmitStatus('error');
      console.error(err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      aria-live="polite"
      noValidate
    >
      <h4 className="text-2xl font-bold text-gray-900 mb-1">{title}</h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Full name"
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          aria-label="Full name"
        />
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          aria-label="Email address"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone (optional)"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          aria-label="Phone"
        />
        {formType === 'contact' ? (
          <input
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Subject"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            aria-label="Subject"
          />
        ) : (
          <input
            name="productInterest"
            value={formData.productInterest}
            onChange={handleChange}
            placeholder="Product of interest"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            aria-label="Product of interest"
          />
        )}
      </div>

      <textarea
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder="Your message"
        required
        rows={5}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 resize-y focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
        aria-label="Message"
      />

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 px-5 py-2.5 font-bold text-white shadow-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-60 transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
        >
          {isSubmitting ? (
            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" aria-hidden>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : null}
          {isSubmitting ? 'Sending...' : formType === 'checkin' ? 'Join' : 'Send Message'}
        </button>

        <button
          type="button"
          onClick={() =>
            setFormData({
              name: '',
              email: '',
              phone: '',
              subject: '',
              message: '',
              productInterest: ''
            })
          }
          className="rounded-xl px-4 py-2 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
        >
          Reset
        </button>
      </div>

      <div aria-live="polite" className="min-h-[1.25rem]">
        {submitStatus === 'success' && (
          <div className="mt-3 rounded-lg bg-green-50 border border-green-100 p-3 text-green-800 shadow">
            Thank you — we received your message and will reply soon.
          </div>
        )}
        {submitStatus === 'error' && (
          <div className="mt-3 rounded-lg bg-rose-50 border border-rose-100 p-3 text-rose-700 shadow">
            Please complete required fields or try again later.
          </div>
        )}
      </div>
    </form>
  );
};

export default ContactForm;