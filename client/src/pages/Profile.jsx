import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { eventService, authService } from '../services/api';
import {
  User,
  Building2,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  Linkedin,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Calendar,
  Edit3,
  Shield,
  Clock,
  ArrowRight
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const Profile = () => {
  const { user, isAuthenticated, updateUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [myEvents, setMyEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    position: user?.position || '',
    company: user?.company || '',
    city: user?.city || '',
    phone: user?.phone || '',
    linkedin: user?.linkedin || ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchMyEvents = async () => {
      try {
        const res = await eventService.getEvents();
        if (res.data.success && user) {
          const registered = res.data.data.filter((e) =>
            e.attendees?.some((a) => (a._id || a) === user._id)
          );
          setMyEvents(registered);
        }
      } catch (err) {
        console.error('Error fetching registered events:', err);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchMyEvents();
  }, [isAuthenticated, user, navigate]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await authService.completeProfile(formData);
      if (res.data.success) {
        addToast('Profile updated successfully.', 'success');
        updateUser(res.data.user);
        setIsEditing(false);
      }
    } catch (err) {
      addToast('Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="w-full bg-[#F7F7F4] min-h-screen pb-20">
      <PageHeader
        title="Executive Member Portal"
        subtitle={`Welcome, ${user.name || 'Executive Leader'}. Manage your credentials, conclave reservations, and peer advisory sessions.`}
        badge="C-Suite Portal"
        breadcrumbs={[{ label: 'Dashboard' }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        
        {/* Status Notification Banner */}
        {user.status === 'pending' && (
          <div className="mb-8 p-5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 flex items-start gap-3 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-[#D99B26] flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm leading-relaxed">
              <strong className="font-bold">Application Status: Pending Committee Review.</strong>
              <p className="mt-0.5 text-amber-800">
                Your executive profile has been submitted and is currently being peer-reviewed by the CXO Connect admissions committee. You have full access to view events, knowledge hub frameworks, and directory rosters. Full voting and closed-door roundtable access will activate upon approval (typically within 24 hours).
              </p>
            </div>
          </div>
        )}

        {user.status === 'accepted' && (
          <div className="mb-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Verified Executive Member • Full Conclave Privileges Active</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
              Accepted
            </span>
          </div>
        )}

        {user.status === 'rejected' && (
          <div className="mb-8 p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 shadow-sm">
            <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm leading-relaxed">
              <strong className="font-bold">Application Status: Review Incomplete.</strong>
              <p className="mt-0.5 text-rose-800">
                The admissions committee was unable to verify active C-suite or VP leadership credentials based on the details submitted. Please update your profile or contact the executive secretariat at{' '}
                <a href="mailto:secretariat@cxoconnect.com" className="underline font-bold">secretariat@cxoconnect.com</a>.
              </p>
            </div>
          </div>
        )}

        {/* Executive Profile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Identity & Contact Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                user.status === 'accepted'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : user.status === 'pending'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {user.status}
              </span>

              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#D99B26] hover:text-[#C2871E]"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>

            <div className="flex flex-col items-center text-center">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover border-2 border-[#D99B26] p-0.5 shadow-sm mb-3"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#111315] text-[#D99B26] font-bold text-3xl font-heading flex items-center justify-center mb-3 shadow-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'C'}
                </div>
              )}

              <h2 className="text-xl font-bold font-heading text-[#111315]">
                {user.name || 'Executive Member'}
              </h2>
              <p className="text-xs font-bold text-[#D99B26] mt-0.5">
                {user.position || 'C-Suite Executive'}
              </p>
              <p className="text-xs text-[#64748B]">{user.company || 'Enterprise Leader'}</p>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] space-y-3 text-xs text-[#64748B]">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#D99B26]" />
                <span className="truncate text-[#111315]">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#D99B26]" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user.city && (
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#D99B26]" />
                  <span>{user.city} {user.pincode && `(${user.pincode})`}</span>
                </div>
              )}
              {user.linkedin && (
                <div className="flex items-center gap-2.5">
                  <Linkedin className="w-4 h-4 text-[#0077b5]" />
                  <a
                    href={user.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#D99B26] hover:underline truncate font-semibold"
                  >
                    View LinkedIn Profile
                  </a>
                </div>
              )}
            </div>

            {isAdmin && (
              <div className="pt-4 border-t border-[#E2E8F0]">
                <Link
                  to="/admin"
                  className="btn-charcoal w-full py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4 text-[#D99B26]" />
                  <span>Open Admin Console</span>
                </Link>
              </div>
            )}
          </div>

          {/* Right Column: Registered Summits & Quick Links */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Registered Conclaves */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold font-heading text-[#111315]">
                    My Reserved Conclaves & Summits
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Confirmed seats for upcoming closed-door gatherings
                  </p>
                </div>
                <Link
                  to="/events"
                  className="text-xs font-bold text-[#D99B26] hover:underline flex items-center gap-1"
                >
                  <span>Explore Summits</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loadingEvents ? (
                <p className="text-xs text-[#64748B]">Loading your reservations...</p>
              ) : myEvents.length === 0 ? (
                <div className="text-center py-10 px-4 rounded-2xl bg-[#F7F7F4] border border-dashed border-[#E2E8F0]">
                  <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-[#111315]">No Conclave Reservations Yet</p>
                  <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1 mb-4">
                    Explore upcoming leadership summits, C-suite roundtables, and executive masterclasses to secure your seat.
                  </p>
                  <Link
                    to="/events"
                    className="btn-charcoal text-xs py-2 px-5 rounded-full"
                  >
                    <span>Browse All Conclaves</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {myEvents.map((evt) => (
                    <div
                      key={evt._id}
                      className="p-4 rounded-2xl border border-[#E2E8F0] bg-[#F7F7F4] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#D99B26] bg-white border border-[#E2E8F0] px-2 py-0.5 rounded-full">
                          {evt.category}
                        </span>
                        <h4 className="text-base font-bold text-[#111315] font-heading">{evt.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-[#64748B]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#D99B26]" />
                            {evt.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#D99B26]" />
                            {evt.venue}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                          Confirmed
                        </span>
                        <Link
                          to={`/events?highlight=${evt._id}`}
                          className="px-3 py-1.5 rounded-full bg-white border border-[#E2E8F0] text-[#111315] hover:bg-slate-100 text-xs font-medium"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/quiz"
                className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm hover:border-[#D99B26]/50 transition-all flex items-start gap-3"
              >
                <div className="p-3 rounded-xl bg-[#F7F7F4] border border-[#E2E8F0] text-[#D99B26]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#111315]">CXO Decision Assessment</h4>
                  <p className="text-xs text-[#64748B] mt-1">Discover your leadership archetype and peer benchmark report.</p>
                </div>
              </Link>

              <Link
                to="/knowledge-hub"
                className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm hover:border-[#D99B26]/50 transition-all flex items-start gap-3"
              >
                <div className="p-3 rounded-xl bg-[#F7F7F4] border border-[#E2E8F0] text-[#D99B26]">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#111315]">Knowledge Hub & Certifications</h4>
                  <p className="text-xs text-[#64748B] mt-1">Board governance whitepapers and certified leadership modules.</p>
                </div>
              </Link>
            </div>

          </div>

        </div>

      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E2E8F0]">
            <h3 className="text-xl font-bold font-heading text-[#111315] mb-1">
              Edit Executive Credentials
            </h3>
            <p className="text-xs text-[#64748B] mb-6">
              Keep your contact and title information current for the community directory.
            </p>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#111315] uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none bg-[#F7F7F4]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111315] uppercase tracking-wider mb-1">
                  Position / Title
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none bg-[#F7F7F4]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111315] uppercase tracking-wider mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none bg-[#F7F7F4]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#111315] uppercase tracking-wider mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none bg-[#F7F7F4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#111315] uppercase tracking-wider mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none bg-[#F7F7F4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111315] uppercase tracking-wider mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none bg-[#F7F7F4]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-[#64748B] hover:bg-[#F7F7F4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-charcoal px-6 py-2 rounded-full text-xs"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
