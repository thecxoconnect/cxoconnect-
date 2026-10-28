import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { contactService } from '../services/api';
import { useToast } from '../components/Toast';
import { Mail, Phone, MapPin, Send, Clock, ShieldCheck, Globe } from 'lucide-react';

const offices = [
  {
    city: 'Mumbai (Global HQ)',
    address: 'Executive Tower 2, One BKC, Bandra Kurla Complex',
    phone: '+91 22 6123 4500',
    email: 'mumbai@cxoconnect.com'
  },
  {
    city: 'Bengaluru Chapter',
    address: 'Prestige Trade Tower, Palace Road, High Grounds',
    phone: '+91 80 4123 6700',
    email: 'bengaluru@cxoconnect.com'
  },
  {
    city: 'Delhi NCR Chapter',
    address: 'DLF Cyber City, Tower 10, DLF Phase 2, Gurugram',
    phone: '+91 124 456 7890',
    email: 'delhi@cxoconnect.com'
  },
  {
    city: 'Singapore & APAC',
    address: 'Marina Bay Financial Centre, Tower 1, Singapore',
    phone: '+65 6789 0123',
    email: 'apac@cxoconnect.com'
  }
];

const Contact = () => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: 'Executive Membership Inquiry',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      addToast('Name, Email, and Message are required.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const res = await contactService.submitContact(formData);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          subject: 'Executive Membership Inquiry',
          message: ''
        });
      }
    } catch (err) {
      addToast('Failed to submit message. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <PageHeader
        title="Executive Secretariat"
        subtitle="Connect with our membership admissions committee, corporate relations desk, or regional chapter leads."
        badge="Direct Inquiry"
        breadcrumbs={[{ label: 'Contact Us' }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Inquiry Form */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-200">
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                Confidential Inquiry
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-2">
                Send a Message to Leadership
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Our relationship team guarantees a response within 1 business day.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Vikramaditya Mehta"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="v.mehta@enterprise.com"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98200 12345"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g. Vanguard Group"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Inquiry Topic
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="Executive Membership Inquiry">Executive Membership Inquiry</option>
                  <option value="Conclave Speaking / Panel Moderation">Conclave Speaking / Panel Moderation</option>
                  <option value="Corporate Sponsorship & Roundtable Co-hosting">Corporate Sponsorship & Roundtable Co-hosting</option>
                  <option value="Advisory Board Nomination">Advisory Board Nomination</option>
                  <option value="General Secretariat Support">General Secretariat Support</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Message / Brief *
                </label>
                <textarea
                  rows={4}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Outline your inquiry, chapter location, or strategic goals..."
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-full bg-[#0d1527] hover:bg-[#1a2642] text-white font-semibold text-sm transition-all shadow-lg shadow-slate-950/20 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Dispatching...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Executive Inquiry</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Regional Secretariat Offices */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full">
                Global Operations
              </span>
              <h3 className="text-xl font-serif font-bold text-white mt-3 mb-2">
                Secretariat Coordinates
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                Direct access to regional administrative officers for priority calendar alignment and private conclave bookings.
              </p>

              <div className="space-y-4">
                {offices.map((off, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <span>{off.city}</span>
                    </h4>
                    <p className="text-xs text-slate-400 pl-5">{off.address}</p>
                    <div className="pt-2 pl-5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-blue-300">
                      <span>{off.phone}</span>
                      <span>•</span>
                      <span>{off.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-950 leading-relaxed">
                <strong className="font-bold">Strict Confidentiality Standard:</strong>
                <p className="mt-0.5 text-blue-900">
                  All correspondence submitted to CXO Connect is maintained under non-disclosure governance. Inquiries are never shared with third parties or external recruiters.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
