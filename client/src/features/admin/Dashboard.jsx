import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { memberService, eventService, mentorService } from '../../services/api';
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  Calendar,
  PlusCircle,
  Trash2,
  Search,
  Filter,
  Award,
  ArrowUpRight
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import ConfirmationModal from '../../components/ConfirmationModal';

const AdminDashboard = () => {
  const { user, isAdmin, isMainAdmin } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('members'); // 'members' | 'events' | 'mentors'
  const [stats, setStats] = useState({
    totalExecutives: 0,
    pendingApplications: 0,
    acceptedMembers: 0,
    rejectedApplications: 0,
    administrators: 0
  });

  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loadingMembers, setLoadingMembers] = useState(true);

  // Modal State for Action Confirmations
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDanger: false
  });

  // New Event Form State
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '09:30 AM - 05:00 PM IST',
    venue: '',
    location: 'Mumbai, India',
    category: 'Leadership Summit',
    banner: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80'
  });
  const [creatingEvent, setCreatingEvent] = useState(false);

  // New Mentor Form State
  const [newMentor, setNewMentor] = useState({
    name: '',
    designation: '',
    company: '',
    expertise: 'Enterprise Scaling, Strategic Governance',
    bio: '',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
    availableForMentorship: true
  });
  const [creatingMentor, setCreatingMentor] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadStats();
      loadMembers();
    }
  }, [isAdmin, statusFilter]);

  const loadStats = async () => {
    try {
      const res = await memberService.getMemberStats();
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  const loadMembers = async () => {
    try {
      setLoadingMembers(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const res = await memberService.getMembers(params);
      if (res.data.success) {
        setMembers(res.data.data);
      }
    } catch (err) {
      console.error('Members fetch error:', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadMembers();
  };

  const handleStatusChange = async (memberId, newStatus) => {
    try {
      const res = await memberService.updateMemberStatus(memberId, newStatus);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        setMembers((prev) =>
          prev.map((m) => (m._id === memberId ? { ...m, status: newStatus } : m))
        );
        loadStats();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update member status.', 'error');
    }
  };

  const handleRoleToggle = (member) => {
    const newRole = member.role === 'admin' ? 'member' : 'admin';
    setModalConfig({
      isOpen: true,
      title: `${newRole === 'admin' ? 'Promote to' : 'Demote from'} Administrator`,
      message: `Are you sure you want to change ${member.name || member.email}'s role to ${newRole}?`,
      isDanger: newRole === 'member',
      onConfirm: async () => {
        try {
          const res = await memberService.updateMemberRole(member._id, newRole, false);
          if (res.data.success) {
            addToast(res.data.message, 'success');
            setMembers((prev) =>
              prev.map((m) => (m._id === member._id ? { ...m, role: newRole } : m))
            );
            loadStats();
          }
        } catch (err) {
          addToast(err.response?.data?.message || 'Failed to update role.', 'error');
        } finally {
          setModalConfig((prev) => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      setCreatingEvent(true);
      const res = await eventService.createEvent(newEvent);
      if (res.data.success) {
        addToast('New executive conclave created successfully!', 'success');
        setNewEvent({
          title: '',
          description: '',
          date: '',
          time: '09:30 AM - 05:00 PM IST',
          venue: '',
          location: 'Mumbai, India',
          category: 'Leadership Summit',
          banner: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80'
        });
      }
    } catch (err) {
      addToast('Failed to create event.', 'error');
    } finally {
      setCreatingEvent(false);
    }
  };

  const handleCreateMentor = async (e) => {
    e.preventDefault();
    try {
      setCreatingMentor(true);
      const res = await mentorService.createMentor(newMentor);
      if (res.data.success) {
        addToast('C-Suite mentor onboarded successfully!', 'success');
        setNewMentor({
          name: '',
          designation: '',
          company: '',
          expertise: 'Enterprise Scaling, Strategic Governance',
          bio: '',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
          availableForMentorship: true
        });
      }
    } catch (err) {
      addToast('Failed to onboard mentor.', 'error');
    } finally {
      setCreatingMentor(false);
    }
  };

  // Enforce Admin Guard
  if (!isAdmin) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="w-full bg-[#F7F7F4] min-h-screen pb-20">
      <PageHeader
        title="Admin Governance Console"
        subtitle="Manage member credentialing approvals, role permissions, and platform conclaves."
        badge="Platform Governance"
        breadcrumbs={[{ label: 'Admin Console' }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        
        {/* KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center justify-between text-[#64748B] mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D99B26]">Total Executives</span>
              <Users className="w-4 h-4 text-[#D99B26]" />
            </div>
            <p className="text-3xl font-extrabold text-[#111315] tracking-tight">{stats.totalExecutives}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center justify-between text-[#64748B] mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Pending Review</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-3xl font-extrabold text-amber-600 tracking-tight">{stats.pendingApplications}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center justify-between text-[#64748B] mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Accepted Members</span>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-3xl font-extrabold text-emerald-600 tracking-tight">{stats.acceptedMembers}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center justify-between text-[#64748B] mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#111315]">Administrators</span>
              <Shield className="w-4 h-4 text-[#D99B26]" />
            </div>
            <p className="text-3xl font-extrabold text-[#111315] tracking-tight">{stats.administrators}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-6 border-b border-[#E2E8F0] pb-3">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'members'
                ? 'bg-[#111315] text-[#D99B26] shadow-sm'
                : 'bg-white text-[#64748B] hover:text-[#111315] border border-[#E2E8F0]'
            }`}
          >
            Member Directory & Approvals
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'events'
                ? 'bg-[#111315] text-[#D99B26] shadow-sm'
                : 'bg-white text-[#64748B] hover:text-[#111315] border border-[#E2E8F0]'
            }`}
          >
            Create Conclave
          </button>
          <button
            onClick={() => setActiveTab('mentors')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'mentors'
                ? 'bg-[#111315] text-[#D99B26] shadow-sm'
                : 'bg-white text-[#64748B] hover:text-[#111315] border border-[#E2E8F0]'
            }`}
          >
            Onboard Faculty
          </button>
        </div>

        {/* TAB 1: MEMBERS APPROVALS & DIRECTORY */}
        {activeTab === 'members' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
            
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, company, email..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </form>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending Review</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Members Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-800 uppercase tracking-wider text-[11px] border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Executive</th>
                    <th className="py-3 px-4">Organization</th>
                    <th className="py-3 px-4">Chapter</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingMembers ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Loading member accounts...
                      </td>
                    </tr>
                  ) : members.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No executive accounts found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    members.map((mem) => (
                      <tr key={mem._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {mem.profileImage ? (
                              <img src={mem.profileImage} alt={mem.name} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center">
                                {mem.name ? mem.name.charAt(0).toUpperCase() : 'C'}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900">{mem.name || 'Unnamed Executive'}</p>
                              <p className="text-[11px] text-slate-500">{mem.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-800">{mem.position || 'C-Suite'}</p>
                          <p className="text-[11px] text-slate-500">{mem.company || 'Enterprise'}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          {mem.city || 'National'}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            mem.status === 'accepted'
                              ? 'bg-emerald-50 text-emerald-700'
                              : mem.status === 'pending'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}>
                            {mem.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-700 capitalize">
                            {mem.role} {mem.isMainAdmin && '★'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {mem.status !== 'accepted' && (
                              <button
                                onClick={() => handleStatusChange(mem._id, 'accepted')}
                                title="Approve Application"
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-semibold transition-colors"
                              >
                                Accept
                              </button>
                            )}

                            {mem.status !== 'rejected' && (
                              <button
                                onClick={() => handleStatusChange(mem._id, 'rejected')}
                                title="Reject Application"
                                className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white font-semibold transition-colors"
                              >
                                Reject
                              </button>
                            )}

                            {mem.status !== 'pending' && (
                              <button
                                onClick={() => handleStatusChange(mem._id, 'pending')}
                                title="Reset to Pending"
                                className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold transition-colors"
                              >
                                Reset
                              </button>
                            )}

                            {isMainAdmin && !mem.isMainAdmin && (
                              <button
                                onClick={() => handleRoleToggle(mem)}
                                title={mem.role === 'admin' ? 'Demote to Member' : 'Promote to Admin'}
                                className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-semibold transition-colors"
                              >
                                {mem.role === 'admin' ? 'Demote' : 'Make Admin'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 2: CREATE CONCLAVE / EVENT */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-3xl p-8 border border-[#E2E8F0] shadow-xl max-w-3xl">
            <h3 className="text-xl font-extrabold text-[#111315] tracking-tight mb-1">
              Schedule New Executive Conclave
            </h3>
            <p className="text-xs text-[#64748B] mb-6">
              Create an upcoming summit, C-Suite roundtable, or executive masterclass.
            </p>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">
                  Conclave Title *
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="e.g. CXO Connect Annual Leadership Conclave 2027"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">
                  Category
                </label>
                <select
                  value={newEvent.category}
                  onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                >
                  <option value="Leadership Summit">Leadership Summit</option>
                  <option value="C-Suite Roundtable">C-Suite Roundtable</option>
                  <option value="Executive Masterclass">Executive Masterclass</option>
                  <option value="Networking Conclave">Networking Conclave</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">
                    Date *
                  </label>
                  <input
                    type="text"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    placeholder="e.g. November 24, 2026"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">
                    Time Schedule
                  </label>
                  <input
                    type="text"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    placeholder="09:30 AM - 04:30 PM IST"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">
                    Venue *
                  </label>
                  <input
                    type="text"
                    value={newEvent.venue}
                    onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                    placeholder="e.g. The Taj Mahal Palace"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">
                    Location / City
                  </label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="Mumbai, India"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">
                  Executive Description *
                </label>
                <textarea
                  rows={3}
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Outline key discussion themes, keynote perspectives, and attendee criteria..."
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={creatingEvent}
                className="btn-charcoal text-xs py-3 px-8 rounded-full"
              >
                <PlusCircle className="w-4 h-4 text-[#D99B26]" />
                <span>{creatingEvent ? 'Publishing Conclave...' : 'Publish Executive Conclave'}</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: ONBOARD FACULTY / MENTOR */}
        {activeTab === 'mentors' && (
          <div className="bg-white rounded-3xl p-8 border border-[#E2E8F0] shadow-xl max-w-3xl">
            <h3 className="text-xl font-extrabold text-[#111315] tracking-tight mb-1">
              Onboard C-Suite Faculty & Mentor
            </h3>
            <p className="text-xs text-[#64748B] mb-6">
              Add seasoned industry titans available for 1-on-1 executive advisory sessions.
            </p>

            <form onSubmit={handleCreateMentor} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">
                    Leader Name *
                  </label>
                  <input
                    type="text"
                    value={newMentor.name}
                    onChange={(e) => setNewMentor({ ...newMentor, name: e.target.value })}
                    placeholder="e.g. Arun M. Parameswaran"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">
                    Executive Title *
                  </label>
                  <input
                    type="text"
                    value={newMentor.designation}
                    onChange={(e) => setNewMentor({ ...newMentor, designation: e.target.value })}
                    placeholder="e.g. Former President & MD"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">
                    Company / Organization *
                  </label>
                  <input
                    type="text"
                    value={newMentor.company}
                    onChange={(e) => setNewMentor({ ...newMentor, company: e.target.value })}
                    placeholder="e.g. Salesforce India"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">
                    Expertise Areas (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newMentor.expertise}
                    onChange={(e) => setNewMentor({ ...newMentor, expertise: e.target.value })}
                    placeholder="Enterprise Scaling, M&A, AI Governance"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">
                  Executive Biography
                </label>
                <textarea
                  rows={3}
                  value={newMentor.bio}
                  onChange={(e) => setNewMentor({ ...newMentor, bio: e.target.value })}
                  placeholder="Detail years of executive experience, board appointments, and key career milestones..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={creatingMentor}
                className="btn-charcoal text-xs py-3 px-8 rounded-full"
              >
                <PlusCircle className="w-4 h-4 text-[#D99B26]" />
                <span>{creatingMentor ? 'Adding Faculty...' : 'Onboard C-Suite Mentor'}</span>
              </button>
            </form>
          </div>
        )}

      </div>

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        isDanger={modalConfig.isDanger}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default AdminDashboard;
