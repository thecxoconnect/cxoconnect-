import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { adminService } from '../../services/api';
import {
  Users,
  Building2,
  MapPin,
  Hash,
  Shield,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  PlusCircle,
  Trash2,
  Edit3,
  Search,
  Filter,
  Download,
  RefreshCw,
  Mail,
  Send,
  Calendar,
  Award,
  Video,
  ExternalLink,
  UploadCloud,
  ChevronRight,
  Eye,
  Check,
  FileText
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import ConfirmationModal from '../../components/ConfirmationModal';

const AdminDashboard = () => {
  const { user, isAdmin, isMainAdmin } = useAuth();
  const { addToast } = useToast();

  // Active Main Tab:
  // 'analytics' | 'members' | 'mentors' | 'sponsors' | 'testimonials' | 'events' | 'quiz' | 'broadcast'
  const [activeTab, setActiveTab] = useState('analytics');

  // Loading and Sync states
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Modal State for Confirmations
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDanger: false
  });

  // ==========================================
  // MODULE 1: ANALYTICS & OVERVIEW STATE
  // ==========================================
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalCompanies: 0,
    totalCities: 0,
    totalPincodes: 0,
    waitlistCount: 0,
    rejectedCount: 0,
    totalAllCount: 0,
    secondaryAdminsCount: 0,
    cityDistribution: [],
    companyDistribution: [],
    counts: { mentors: 0, committee: 0, events: 0, sponsors: 0, quiz: 0, testimonials: 0 }
  });

  // ==========================================
  // MODULE 2: MEMBERS STATE
  // ==========================================
  const [members, setMembers] = useState([]);
  const [memberFilter, setMemberFilter] = useState('waitlist'); // 'waitlist' | 'accepted' | 'rejected' | 'secondary_admin' | 'all'
  const [memberSearch, setMemberSearch] = useState('');

  // ==========================================
  // MODULE 3: MENTORS & COMMITTEE STATE
  // ==========================================
  const [mentors, setMentors] = useState([]);
  const [mentorModalOpen, setMentorModalOpen] = useState(false);
  const [editingMentorId, setEditingMentorId] = useState(null);
  const [mentorFormData, setMentorFormData] = useState({
    name: '',
    designation: '',
    company: '',
    city: 'Mumbai',
    linkedinUrl: '',
    expertise: 'Strategic Governance, Enterprise Scaling',
    bio: '',
    photoUrl: ''
  });
  const [mentorFile, setMentorFile] = useState(null);
  const [mentorFilePreview, setMentorFilePreview] = useState('');

  // ==========================================
  // MODULE 4: SPONSORS STATE
  // ==========================================
  const [sponsors, setSponsors] = useState([]);
  const [sponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [editingSponsorId, setEditingSponsorId] = useState(null);
  const [sponsorFormData, setSponsorFormData] = useState({
    name: '',
    tier: 'partner',
    websiteUrl: '',
    description: '',
    logoUrl: ''
  });
  const [sponsorFile, setSponsorFile] = useState(null);
  const [sponsorFilePreview, setSponsorFilePreview] = useState('');

  // ==========================================
  // MODULE 5: TESTIMONIALS STATE
  // ==========================================
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialModalOpen, setTestimonialModalOpen] = useState(false);
  const [editingTestimonialId, setEditingTestimonialId] = useState(null);
  const [testimonialFormData, setTestimonialFormData] = useState({
    authorName: '',
    authorRole: 'Chief Executive Officer',
    company: '',
    city: 'Mumbai',
    content: '',
    videoUrl: '',
    avatarUrl: ''
  });
  const [testimonialFile, setTestimonialFile] = useState(null);
  const [testimonialFilePreview, setTestimonialFilePreview] = useState('');

  // ==========================================
  // MODULE 6: EVENTS STATE
  // ==========================================
  const [events, setEvents] = useState([]);
  const [eventTab, setEventTab] = useState('UPCOMING'); // 'UPCOMING' | 'PAST'
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [eventFormData, setEventFormData] = useState({
    title: '',
    speakerMentor: '',
    location: 'Mumbai, India',
    venue: 'The Taj Mahal Palace',
    eventDate: '',
    time: '09:30 AM - 04:30 PM IST',
    category: 'Leadership Summit',
    type: 'UPCOMING',
    description: '',
    bannerUrl: ''
  });
  const [eventFile, setEventFile] = useState(null);
  const [eventFilePreview, setEventFilePreview] = useState('');

  // ==========================================
  // MODULE 7: QUIZ MANAGEMENT STATE
  // ==========================================
  const [questions, setQuestions] = useState([]);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [questionFormData, setQuestionFormData] = useState({
    questionText: '',
    category: 'Strategic Leadership',
    options: [
      { text: '', trait: 'Visionary Strategist' },
      { text: '', trait: 'Agile Disruptor' },
      { text: '', trait: 'Operational Maestro' },
      { text: '', trait: 'Empathetic Leader' }
    ],
    correctAnswerIndex: 0
  });

  // ==========================================
  // MODULE 8: MASS MAILER STATE
  // ==========================================
  const [broadcastData, setBroadcastData] = useState({
    subject: '',
    message: ''
  });
  const [broadcastPreview, setBroadcastPreview] = useState(false);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // ==========================================
  // DATA FETCHING & SYNCHRONIZATION
  // ==========================================
  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin]);

  const loadAllData = async () => {
    try {
      setSyncing(true);
      await Promise.all([
        fetchStats(),
        fetchMembers(),
        fetchMentors(),
        fetchSponsors(),
        fetchTestimonials(),
        fetchEvents(),
        fetchQuestions()
      ]);
    } catch (err) {
      console.error('[Admin Sync Error]', err);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await adminService.getStats();
      if (res.data.success) setStats(res.data.data);
    } catch (err) {
      console.warn('Could not fetch admin stats:', err.message);
    }
  };

  const fetchMembers = async () => {
    try {
      const params = {};
      if (memberFilter === 'secondary_admin') {
        params.role = 'secondary_admin';
      } else if (memberFilter !== 'all') {
        params.status = memberFilter;
      }
      if (memberSearch) params.search = memberSearch;

      const res = await adminService.getMembers(params);
      if (res.data.success) setMembers(res.data.data);
    } catch (err) {
      console.warn('Could not fetch members:', err.message);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchMembers();
  }, [memberFilter]);

  const fetchMentors = async () => {
    try {
      const res = await adminService.getMentors();
      if (res.data.success) setMentors(res.data.data);
    } catch (err) {
      console.warn('Could not fetch mentors:', err.message);
    }
  };

  const fetchSponsors = async () => {
    try {
      const res = await adminService.getSponsors();
      if (res.data.success) setSponsors(res.data.data);
    } catch (err) {
      console.warn('Could not fetch sponsors:', err.message);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const res = await adminService.getTestimonials();
      if (res.data.success) setTestimonials(res.data.data);
    } catch (err) {
      console.warn('Could not fetch testimonials:', err.message);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await adminService.getEvents();
      if (res.data.success) setEvents(res.data.data);
    } catch (err) {
      console.warn('Could not fetch events:', err.message);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await adminService.getQuestions();
      if (res.data.success) setQuestions(res.data.data);
    } catch (err) {
      console.warn('Could not fetch quiz questions:', err.message);
    }
  };

  // ==========================================
  // ACTION HANDLERS
  // ==========================================

  // Export CSV Report
  const handleExportReport = async () => {
    try {
      addToast('Preparing CSV export...', 'info');
      const res = await adminService.exportReport('accepted');
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cxo_connect_members_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      addToast('Executive membership roster downloaded successfully.', 'success');
    } catch (err) {
      addToast('Failed to export CSV report.', 'error');
    }
  };

  // Member Status Update
  const handleMemberStatus = async (memberId, newStatus) => {
    try {
      const res = await adminService.updateMemberStatus(memberId, newStatus);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        fetchMembers();
        fetchStats();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update member status.', 'error');
    }
  };

  // Toggle Admin Role
  const handleToggleRole = (member) => {
    const newRole = member.role === 'admin' ? 'member' : 'admin';
    setModalConfig({
      isOpen: true,
      title: `${newRole === 'admin' ? 'Promote to' : 'Demote from'} Administrator`,
      message: `Are you sure you want to change permissions for ${member.name || member.email} to ${newRole}?`,
      isDanger: newRole === 'member',
      onConfirm: async () => {
        try {
          const res = await adminService.toggleMemberRole(member._id, newRole);
          if (res.data.success) {
            addToast(res.data.message, 'success');
            fetchMembers();
            fetchStats();
          }
        } catch (err) {
          addToast(err.response?.data?.message || 'Failed to change role.', 'error');
        } finally {
          setModalConfig((prev) => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Delete Member
  const handleDeleteMember = (member) => {
    setModalConfig({
      isOpen: true,
      title: 'Delete Executive Account',
      message: `Are you sure you want to permanently delete the account for ${member.name || member.email}? This cannot be undone.`,
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await adminService.deleteMember(member._id);
          if (res.data.success) {
            addToast('Member removed from registry.', 'success');
            fetchMembers();
            fetchStats();
          }
        } catch (err) {
          addToast(err.response?.data?.message || 'Failed to delete member.', 'error');
        } finally {
          setModalConfig((prev) => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Save Mentor (Create or Edit with ImageKit)
  const handleSaveMentor = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', mentorFormData.name);
      formData.append('designation', mentorFormData.designation);
      formData.append('company', mentorFormData.company);
      formData.append('city', mentorFormData.city);
      formData.append('linkedinUrl', mentorFormData.linkedinUrl);
      formData.append('expertise', mentorFormData.expertise);
      formData.append('bio', mentorFormData.bio);
      if (mentorFile) formData.append('image', mentorFile);

      if (editingMentorId) {
        await adminService.updateMentor(editingMentorId, formData);
        addToast('Mentor details updated.', 'success');
      } else {
        await adminService.createMentor(formData);
        addToast('New C-Suite mentor onboarded to directory.', 'success');
      }

      setMentorModalOpen(false);
      setEditingMentorId(null);
      setMentorFile(null);
      setMentorFilePreview('');
      fetchMentors();
      fetchStats();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save mentor.', 'error');
    }
  };

  const handleDeleteMentor = (mentorId) => {
    setModalConfig({
      isOpen: true,
      title: 'Remove Faculty Member',
      message: 'Are you sure you want to remove this mentor and associated ImageKit media assets?',
      isDanger: true,
      onConfirm: async () => {
        try {
          await adminService.deleteMentor(mentorId);
          addToast('Mentor removed.', 'success');
          fetchMentors();
          fetchStats();
        } catch (err) {
          addToast('Failed to delete mentor.', 'error');
        } finally {
          setModalConfig((prev) => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Save Sponsor
  const handleSaveSponsor = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', sponsorFormData.name);
      formData.append('tier', sponsorFormData.tier);
      formData.append('websiteUrl', sponsorFormData.websiteUrl);
      formData.append('description', sponsorFormData.description);
      if (sponsorFile) formData.append('logo', sponsorFile);

      if (editingSponsorId) {
        await adminService.updateSponsor(editingSponsorId, formData);
        addToast('Partner details updated.', 'success');
      } else {
        await adminService.createSponsor(formData);
        addToast('Corporate sponsor added to registry.', 'success');
      }

      setSponsorModalOpen(false);
      setEditingSponsorId(null);
      setSponsorFile(null);
      setSponsorFilePreview('');
      fetchSponsors();
      fetchStats();
    } catch (err) {
      addToast('Failed to save sponsor.', 'error');
    }
  };

  const handleDeleteSponsor = (id) => {
    setModalConfig({
      isOpen: true,
      title: 'Delete Sponsor',
      message: 'Are you sure you want to remove this sponsor logo?',
      isDanger: true,
      onConfirm: async () => {
        try {
          await adminService.deleteSponsor(id);
          addToast('Sponsor removed.', 'success');
          fetchSponsors();
          fetchStats();
        } catch (err) {
          addToast('Failed to delete sponsor.', 'error');
        } finally {
          setModalConfig((prev) => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Save Testimonial
  const handleSaveTestimonial = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('authorName', testimonialFormData.authorName);
      formData.append('authorRole', testimonialFormData.authorRole);
      formData.append('company', testimonialFormData.company);
      formData.append('city', testimonialFormData.city);
      formData.append('content', testimonialFormData.content);
      formData.append('videoUrl', testimonialFormData.videoUrl);
      if (testimonialFile) formData.append('avatar', testimonialFile);

      if (editingTestimonialId) {
        await adminService.updateTestimonial(editingTestimonialId, formData);
        addToast('Testimonial updated.', 'success');
      } else {
        await adminService.createTestimonial(formData);
        addToast('Executive testimonial published.', 'success');
      }

      setTestimonialModalOpen(false);
      setEditingTestimonialId(null);
      setTestimonialFile(null);
      setTestimonialFilePreview('');
      fetchTestimonials();
      fetchStats();
    } catch (err) {
      addToast('Failed to save testimonial.', 'error');
    }
  };

  const handleDeleteTestimonial = (id) => {
    setModalConfig({
      isOpen: true,
      title: 'Delete Testimonial',
      message: 'Are you sure you want to remove this testimonial?',
      isDanger: true,
      onConfirm: async () => {
        try {
          await adminService.deleteTestimonial(id);
          addToast('Testimonial deleted.', 'success');
          fetchTestimonials();
          fetchStats();
        } catch (err) {
          addToast('Failed to delete testimonial.', 'error');
        } finally {
          setModalConfig((prev) => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Save Event
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', eventFormData.title);
      formData.append('speakerMentor', eventFormData.speakerMentor);
      formData.append('location', eventFormData.location);
      formData.append('venue', eventFormData.venue);
      formData.append('eventDate', eventFormData.eventDate);
      formData.append('time', eventFormData.time);
      formData.append('category', eventFormData.category);
      formData.append('type', eventFormData.type);
      formData.append('description', eventFormData.description);
      if (eventFile) formData.append('banner', eventFile);

      if (editingEventId) {
        await adminService.updateEvent(editingEventId, formData);
        addToast('Conclave details updated.', 'success');
      } else {
        await adminService.createEvent(formData);
        addToast('New executive conclave scheduled.', 'success');
      }

      setEventModalOpen(false);
      setEditingEventId(null);
      setEventFile(null);
      setEventFilePreview('');
      fetchEvents();
      fetchStats();
    } catch (err) {
      addToast('Failed to save event.', 'error');
    }
  };

  const handleDeleteEvent = (id) => {
    setModalConfig({
      isOpen: true,
      title: 'Cancel Conclave',
      message: 'Are you sure you want to cancel and remove this scheduled conclave?',
      isDanger: true,
      onConfirm: async () => {
        try {
          await adminService.deleteEvent(id);
          addToast('Conclave removed.', 'success');
          fetchEvents();
          fetchStats();
        } catch (err) {
          addToast('Failed to delete event.', 'error');
        } finally {
          setModalConfig((prev) => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Save Quiz Question
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        questionText: questionFormData.questionText,
        category: questionFormData.category,
        options: questionFormData.options,
        correctAnswerIndex: questionFormData.correctAnswerIndex
      };

      if (editingQuestionId) {
        await adminService.updateQuestion(editingQuestionId, payload);
        addToast('Assessment question updated.', 'success');
      } else {
        await adminService.createQuestion(payload);
        addToast('New assessment question added.', 'success');
      }

      setQuizModalOpen(false);
      setEditingQuestionId(null);
      fetchQuestions();
      fetchStats();
    } catch (err) {
      addToast('Failed to save question.', 'error');
    }
  };

  const handleDeleteQuestion = (id) => {
    setModalConfig({
      isOpen: true,
      title: 'Delete Question',
      message: 'Are you sure you want to delete this strategic assessment scenario?',
      isDanger: true,
      onConfirm: async () => {
        try {
          await adminService.deleteQuestion(id);
          addToast('Question removed.', 'success');
          fetchQuestions();
          fetchStats();
        } catch (err) {
          addToast('Failed to delete question.', 'error');
        } finally {
          setModalConfig((prev) => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Send Mass Mail
  const handleSendMassMail = async (e) => {
    e.preventDefault();
    if (!broadcastData.subject || !broadcastData.message) {
      addToast('Please enter both subject and message body.', 'warning');
      return;
    }

    setModalConfig({
      isOpen: true,
      title: 'Confirm Broadcast Dispatch',
      message: `You are about to send this confidential broadcast to all ${stats.totalMembers} approved members. Continue?`,
      isDanger: false,
      onConfirm: async () => {
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
        try {
          setSendingBroadcast(true);
          const res = await adminService.sendMassMail(broadcastData);
          if (res.data.success) {
            addToast(`Broadcast dispatched to ${res.data.recipientCount} members!`, 'success');
            setBroadcastData({ subject: '', message: '' });
          }
        } catch (err) {
          addToast(err.response?.data?.message || 'Failed to dispatch mass mail.', 'error');
        } finally {
          setSendingBroadcast(false);
        }
      }
    });
  };

  // Admin Guard
  if (!isAdmin) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="w-full bg-[#F7F7F4] min-h-screen pb-24">
      {/* Page Header */}
      <PageHeader
        title="Administrative Hub"
        subtitle="Executive Platform Governance, Member Verification & Media Dispatch"
        badge="Platform Governance"
        breadcrumbs={[{ label: 'Administrative Hub' }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        
        {/* Top Control Bar: Global Sync & Export Actions */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#111315] flex items-center justify-center text-[#D99B26]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#111315] tracking-tight">
                CXO Connect Operational Console
              </h2>
              <p className="text-xs text-[#64748B]">
                {stats.totalMembers} Verified C-Suite Members • {stats.waitlistCount} In Waitlist Queue
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={loadAllData}
              disabled={syncing}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-[#E2E8F0] hover:bg-[#F7F7F4] text-xs font-semibold text-[#111315] transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#D99B26] ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Refresh Sync'}</span>
            </button>

            <button
              onClick={handleExportReport}
              className="flex-1 sm:flex-none btn-charcoal text-xs py-2.5 px-5 rounded-full flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-[#D99B26]" />
              <span>Export Report (CSV)</span>
            </button>
          </div>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar border-b border-[#E2E8F0]">
          {[
            { id: 'analytics', label: 'Overview & Analytics', icon: Building2 },
            { id: 'members', label: 'Directory & Workflows', icon: Users, badge: stats.waitlistCount > 0 ? stats.waitlistCount : null },
            { id: 'mentors', label: 'Mentors & Faculty', icon: Award, count: stats.counts.mentors },
            { id: 'sponsors', label: 'Sponsors & Partners', icon: Building2, count: stats.counts.sponsors },
            { id: 'testimonials', label: 'Testimonials Engine', icon: Video, count: stats.counts.testimonials },
            { id: 'events', label: 'Conclaves & Events', icon: Calendar, count: stats.counts.events },
            { id: 'quiz', label: 'Assessment System', icon: FileText, count: stats.counts.quiz },
            { id: 'broadcast', label: 'Mass Mailer', icon: Mail }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  active
                    ? 'bg-[#111315] text-[#D99B26] shadow-sm'
                    : 'bg-white text-[#64748B] hover:text-[#111315] border border-[#E2E8F0]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#D99B26]' : 'text-[#64748B]'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
                {tab.count !== undefined && !tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-white/10 text-white' : 'bg-slate-100 text-[#64748B]'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ==================================================================== */}
        {/* MODULE 1: OVERVIEW & ANALYTICS                                       */}
        {/* ==================================================================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Real-Time Aggregate Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
                <div className="flex items-center justify-between text-[#64748B] mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#D99B26]">Total Members</span>
                  <Users className="w-4 h-4 text-[#D99B26]" />
                </div>
                <p className="text-3xl font-extrabold text-[#111315] tracking-tight">{stats.totalMembers}</p>
                <p className="text-[11px] text-[#64748B] mt-1">{stats.waitlistCount} awaiting credentials approval</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
                <div className="flex items-center justify-between text-[#64748B] mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#111315]">Companies</span>
                  <Building2 className="w-4 h-4 text-[#111315]" />
                </div>
                <p className="text-3xl font-extrabold text-[#111315] tracking-tight">{stats.totalCompanies}</p>
                <p className="text-[11px] text-[#64748B] mt-1">Enterprise organizations registered</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
                <div className="flex items-center justify-between text-[#64748B] mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#D99B26]">Cities</span>
                  <MapPin className="w-4 h-4 text-[#D99B26]" />
                </div>
                <p className="text-3xl font-extrabold text-[#111315] tracking-tight">{stats.totalCities}</p>
                <p className="text-[11px] text-[#64748B] mt-1">Across global and national hubs</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
                <div className="flex items-center justify-between text-[#64748B] mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Pincodes</span>
                  <Hash className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-3xl font-extrabold text-[#111315] tracking-tight">{stats.totalPincodes}</p>
                <p className="text-[11px] text-[#64748B] mt-1">Geographic cluster concentration</p>
              </div>
            </div>

            {/* Visual Breakdown Graphs & Cluster Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* City Distribution */}
              <div className="bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-extrabold text-[#111315] tracking-tight">
                    Geographic Chapter Distribution
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D99B26]">Top Hubs</span>
                </div>
                <div className="space-y-3">
                  {stats.cityDistribution.length === 0 ? (
                    <p className="text-xs text-[#64748B] py-6 text-center">No city data available yet.</p>
                  ) : (
                    stats.cityDistribution.map((item, idx) => {
                      const max = stats.cityDistribution[0]?.count || 1;
                      const percent = Math.round((item.count / max) * 100);
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-[#111315]">
                            <span>{item.city}</span>
                            <span className="text-[#64748B]">{item.count} executives</span>
                          </div>
                          <div className="w-full bg-[#F7F7F4] rounded-full h-2 overflow-hidden border border-[#E2E8F0]">
                            <div className="bg-[#D99B26] h-2 rounded-full" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Company Representation */}
              <div className="bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-extrabold text-[#111315] tracking-tight">
                    Leading Enterprise Organizations
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#111315]">Top Representation</span>
                </div>
                <div className="space-y-3">
                  {stats.companyDistribution.length === 0 ? (
                    <p className="text-xs text-[#64748B] py-6 text-center">No enterprise company data available yet.</p>
                  ) : (
                    stats.companyDistribution.map((item, idx) => {
                      const max = stats.companyDistribution[0]?.count || 1;
                      const percent = Math.round((item.count / max) * 100);
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-[#111315]">
                            <span>{item.company}</span>
                            <span className="text-[#64748B]">{item.count} leaders</span>
                          </div>
                          <div className="w-full bg-[#F7F7F4] rounded-full h-2 overflow-hidden border border-[#E2E8F0]">
                            <div className="bg-[#111315] h-2 rounded-full" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MODULE 2: MEMBER & SECONDARY ADMIN WORKFLOWS                         */}
        {/* ==================================================================== */}
        {activeTab === 'members' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-xl space-y-6">
            
            {/* Status Filter Tabs & Search */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 w-full lg:w-auto overflow-x-auto pb-1">
                {[
                  { id: 'waitlist', label: 'Waitlist', count: stats.waitlistCount },
                  { id: 'accepted', label: 'Approved Members', count: stats.totalMembers },
                  { id: 'rejected', label: 'Rejected', count: stats.rejectedCount },
                  { id: 'secondary_admin', label: 'Secondary Admins', count: stats.secondaryAdminsCount },
                  { id: 'all', label: 'All Accounts' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setMemberFilter(f.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                      memberFilter === f.id
                        ? 'bg-[#111315] text-[#D99B26]'
                        : 'bg-[#F7F7F4] text-[#64748B] hover:text-[#111315]'
                    }`}
                  >
                    {f.label} {f.count !== undefined && `(${f.count})`}
                  </button>
                ))}
              </div>

              <div className="relative w-full lg:w-80">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#64748B]" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchMembers()}
                  placeholder="Search name, company, email..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                />
              </div>
            </div>

            {/* Members Directory Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#64748B]">
                <thead className="bg-[#F7F7F4] text-[#111315] uppercase tracking-wider text-[11px] border-y border-[#E2E8F0]">
                  <tr>
                    <th className="py-3 px-4">Executive Leader</th>
                    <th className="py-3 px-4">Organization & Title</th>
                    <th className="py-3 px-4">Chapter & Pincode</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {members.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#64748B]">
                        No executive accounts found matching current filter.
                      </td>
                    </tr>
                  ) : (
                    members.map((mem) => (
                      <tr key={mem._id} className="hover:bg-[#F7F7F4]/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {mem.profileImage ? (
                              <img src={mem.profileImage} alt={mem.name} className="w-9 h-9 rounded-full object-cover border border-[#E2E8F0]" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-[#111315] text-[#D99B26] font-bold flex items-center justify-center">
                                {mem.name ? mem.name.charAt(0).toUpperCase() : 'C'}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-[#111315]">{mem.name || 'Unnamed Executive'}</p>
                              <p className="text-[11px] text-[#64748B]">{mem.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-[#111315]">{mem.position || 'C-Suite'}</p>
                          <p className="text-[11px] text-[#64748B]">{mem.company || 'Enterprise'}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-[#111315]">{mem.city || 'National'}</p>
                          <p className="text-[11px] text-[#64748B]">{mem.pincode || '—'}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            mem.status === 'accepted'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : mem.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {mem.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-[#111315] capitalize">
                            {mem.role} {mem.isMainAdmin && '★'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {mem.status !== 'accepted' && (
                              <button
                                onClick={() => handleMemberStatus(mem._id, 'accepted')}
                                title="Approve Membership"
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-semibold transition-colors"
                              >
                                Approve
                              </button>
                            )}

                            {mem.status !== 'rejected' && (
                              <button
                                onClick={() => handleMemberStatus(mem._id, 'rejected')}
                                title="Reject Application"
                                className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white font-semibold transition-colors"
                              >
                                Reject
                              </button>
                            )}

                            {mem.status !== 'pending' && (
                              <button
                                onClick={() => handleMemberStatus(mem._id, 'pending')}
                                title="Reset to Waitlist"
                                className="px-2.5 py-1 rounded-lg bg-slate-100 text-[#64748B] hover:bg-slate-200 font-semibold transition-colors"
                              >
                                Reset
                              </button>
                            )}

                            {isMainAdmin && !mem.isMainAdmin && (
                              <button
                                onClick={() => handleToggleRole(mem)}
                                title={mem.role === 'admin' ? 'Demote to Member' : 'Promote to Secondary Admin'}
                                className="px-2.5 py-1 rounded-lg bg-[#F7F7F4] text-[#111315] hover:bg-[#111315] hover:text-[#D99B26] font-semibold transition-colors border border-[#E2E8F0]"
                              >
                                {mem.role === 'admin' ? 'Demote' : 'Make Admin'}
                              </button>
                            )}

                            {isMainAdmin && !mem.isMainAdmin && (
                              <button
                                onClick={() => handleDeleteMember(mem)}
                                title="Delete account"
                                className="p-1 rounded-lg text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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

        {/* ==================================================================== */}
        {/* MODULE 3: MENTORS & FACULTY MANAGEMENT                               */}
        {/* ==================================================================== */}
        {activeTab === 'mentors' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-[#111315] tracking-tight">
                  C-Suite Mentors & Advisory Board
                </h3>
                <p className="text-xs text-[#64748B]">
                  Manage faculty available for confidential 1-on-1 strategic advisory sessions.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingMentorId(null);
                  setMentorFormData({
                    name: '',
                    designation: '',
                    company: '',
                    city: 'Mumbai',
                    linkedinUrl: '',
                    expertise: 'Enterprise Scaling, M&A, AI Governance',
                    bio: '',
                    photoUrl: ''
                  });
                  setMentorFile(null);
                  setMentorFilePreview('');
                  setMentorModalOpen(true);
                }}
                className="btn-charcoal text-xs py-2.5 px-5 rounded-full flex items-center gap-2"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#D99B26]" />
                <span>Onboard Mentor</span>
              </button>
            </div>

            {/* Mentors Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#64748B]">
                <thead className="bg-[#F7F7F4] text-[#111315] uppercase tracking-wider text-[11px] border-y border-[#E2E8F0]">
                  <tr>
                    <th className="py-3 px-4">Mentor / Faculty</th>
                    <th className="py-3 px-4">Designation & Org</th>
                    <th className="py-3 px-4">City</th>
                    <th className="py-3 px-4">Core Expertise</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {mentors.map((m) => (
                    <tr key={m._id} className="hover:bg-[#F7F7F4]/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={m.photoUrl || m.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80'}
                            alt={m.name}
                            className="w-10 h-10 rounded-full object-cover border border-[#E2E8F0]"
                          />
                          <div>
                            <p className="font-bold text-[#111315]">{m.name}</p>
                            {m.linkedinUrl && (
                              <a href={m.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#D99B26] hover:underline flex items-center gap-1">
                                <span>LinkedIn Profile</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#111315]">
                        <p>{m.designation}</p>
                        <p className="text-[11px] text-[#64748B]">{m.company}</p>
                      </td>
                      <td className="py-3 px-4">{m.city || 'Mumbai'}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(Array.isArray(m.expertise) ? m.expertise : [m.expertise]).map((exp, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full bg-[#F7F7F4] border border-[#E2E8F0] text-[10px] text-[#111315]">
                              {exp}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingMentorId(m._id);
                              setMentorFormData({
                                name: m.name,
                                designation: m.designation,
                                company: m.company,
                                city: m.city || 'Mumbai',
                                linkedinUrl: m.linkedinUrl || m.linkedin || '',
                                expertise: Array.isArray(m.expertise) ? m.expertise.join(', ') : m.expertise,
                                bio: m.bio || '',
                                photoUrl: m.photoUrl || m.image || ''
                              });
                              setMentorFilePreview(m.photoUrl || m.image || '');
                              setMentorModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-[#111315]"
                            title="Edit Mentor"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMentor(m._id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600"
                            title="Delete Mentor"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ==================================================================== */}
        {/* MODULE 4: SPONSORS & PARTNERS DIRECTORY                              */}
        {/* ==================================================================== */}
        {activeTab === 'sponsors' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-[#111315] tracking-tight">
                  Corporate Sponsors & Institutional Partners
                </h3>
                <p className="text-xs text-[#64748B]">
                  Manage corporate partnerships, institutional logos, and conclave sponsors.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingSponsorId(null);
                  setSponsorFormData({ name: '', tier: 'partner', websiteUrl: '', description: '', logoUrl: '' });
                  setSponsorFile(null);
                  setSponsorFilePreview('');
                  setSponsorModalOpen(true);
                }}
                className="btn-charcoal text-xs py-2.5 px-5 rounded-full flex items-center gap-2"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#D99B26]" />
                <span>Add Sponsor Logo</span>
              </button>
            </div>

            {/* Logo Grid Display */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {sponsors.map((sp) => (
                <div key={sp._id} className="p-5 rounded-2xl border border-[#E2E8F0] hover:border-[#D99B26] transition-all bg-[#F7F7F4]/40 flex flex-col justify-between">
                  <div>
                    <div className="h-20 flex items-center justify-center p-2 mb-3 bg-white rounded-xl border border-[#E2E8F0]">
                      {sp.logoUrl || sp.logo ? (
                        <img src={sp.logoUrl || sp.logo} alt={sp.name} className="max-h-14 max-w-full object-contain" />
                      ) : (
                        <span className="text-xs font-bold text-[#111315]">{sp.name}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-sm text-[#111315] truncate">{sp.name}</h4>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#111315] text-[#D99B26]">
                        {sp.tier}
                      </span>
                    </div>
                    {sp.websiteUrl && (
                      <a href={sp.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#64748B] hover:text-[#D99B26] truncate block">
                        {sp.websiteUrl}
                      </a>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0] mt-3">
                    <button
                      onClick={() => {
                        setEditingSponsorId(sp._id);
                        setSponsorFormData({
                          name: sp.name,
                          tier: sp.tier || 'partner',
                          websiteUrl: sp.websiteUrl || sp.website || '',
                          description: sp.description || '',
                          logoUrl: sp.logoUrl || sp.logo || ''
                        });
                        setSponsorFilePreview(sp.logoUrl || sp.logo || '');
                        setSponsorModalOpen(true);
                      }}
                      className="p-1 rounded text-[#111315] hover:bg-white"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSponsor(sp._id)}
                      className="p-1 rounded text-rose-600 hover:bg-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ==================================================================== */}
        {/* MODULE 5: TESTIMONIALS ENGINE                                        */}
        {/* ==================================================================== */}
        {activeTab === 'testimonials' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-[#111315] tracking-tight">
                  Executive Testimonials Engine
                </h3>
                <p className="text-xs text-[#64748B]">
                  Manage verified member perspectives and conclave video testimonials.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingTestimonialId(null);
                  setTestimonialFormData({
                    authorName: '',
                    authorRole: 'Managing Director & CEO',
                    company: '',
                    city: 'Mumbai',
                    content: '',
                    videoUrl: '',
                    avatarUrl: ''
                  });
                  setTestimonialFile(null);
                  setTestimonialFilePreview('');
                  setTestimonialModalOpen(true);
                }}
                className="btn-charcoal text-xs py-2.5 px-5 rounded-full flex items-center gap-2"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#D99B26]" />
                <span>Add Testimonial</span>
              </button>
            </div>

            {/* Testimonials Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {testimonials.map((t) => (
                <div key={t._id} className="p-5 rounded-2xl border border-[#E2E8F0] bg-[#F7F7F4]/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <img src={t.avatarUrl} alt={t.authorName} className="w-10 h-10 rounded-full object-cover border border-[#E2E8F0]" />
                      <div>
                        <h4 className="font-bold text-sm text-[#111315]">{t.authorName}</h4>
                        <p className="text-[11px] text-[#64748B]">{t.authorRole} • {t.company || t.city}</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#111315] leading-relaxed italic line-clamp-4">
                      "{t.content}"
                    </p>
                    {t.videoUrl && (
                      <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold">
                        <Video className="w-3 h-3" />
                        <span>Video Perspective</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E2E8F0] mt-4">
                    <button
                      onClick={() => {
                        setEditingTestimonialId(t._id);
                        setTestimonialFormData({
                          authorName: t.authorName,
                          authorRole: t.authorRole,
                          company: t.company || '',
                          city: t.city || 'Mumbai',
                          content: t.content,
                          videoUrl: t.videoUrl || '',
                          avatarUrl: t.avatarUrl
                        });
                        setTestimonialFilePreview(t.avatarUrl);
                        setTestimonialModalOpen(true);
                      }}
                      className="p-1 rounded text-[#111315] hover:bg-white"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTestimonial(t._id)}
                      className="p-1 rounded text-rose-600 hover:bg-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ==================================================================== */}
        {/* MODULE 6: EVENTS & CONCLAVES MANAGEMENT                              */}
        {/* ==================================================================== */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-[#111315] tracking-tight">
                  Executive Conclaves & Private Summits
                </h3>
                <p className="text-xs text-[#64748B]">
                  Manage scheduled physical gatherings, city roundtables, and archival streams.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingEventId(null);
                  setEventFormData({
                    title: '',
                    speakerMentor: '',
                    location: 'Mumbai, India',
                    venue: 'The Taj Mahal Palace',
                    eventDate: '',
                    time: '09:30 AM - 04:30 PM IST',
                    category: 'Leadership Summit',
                    type: 'UPCOMING',
                    description: '',
                    bannerUrl: ''
                  });
                  setEventFile(null);
                  setEventFilePreview('');
                  setEventModalOpen(true);
                }}
                className="btn-charcoal text-xs py-2.5 px-5 rounded-full flex items-center gap-2"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#D99B26]" />
                <span>Schedule Conclave</span>
              </button>
            </div>

            {/* Upcoming vs Past Switcher */}
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
              <button
                onClick={() => setEventTab('UPCOMING')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  eventTab === 'UPCOMING'
                    ? 'bg-[#111315] text-[#D99B26]'
                    : 'bg-[#F7F7F4] text-[#64748B]'
                }`}
              >
                Upcoming Conclaves
              </button>
              <button
                onClick={() => setEventTab('PAST')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  eventTab === 'PAST'
                    ? 'bg-[#111315] text-[#D99B26]'
                    : 'bg-[#F7F7F4] text-[#64748B]'
                }`}
              >
                Archival Stream (Past)
              </button>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {events
                .filter((e) => (eventTab === 'UPCOMING' ? e.type !== 'PAST' : e.type === 'PAST'))
                .map((ev) => (
                  <div key={ev._id} className="rounded-2xl border border-[#E2E8F0] overflow-hidden bg-[#F7F7F4]/40 flex flex-col justify-between">
                    <div>
                      <div className="relative h-40 w-full overflow-hidden">
                        <img src={ev.bannerUrl || ev.banner} alt={ev.title} className="w-full h-full object-cover" />
                        <div className="absolute top-3 left-3 bg-[#111315]/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-[#D99B26] uppercase tracking-wider">
                          {ev.category}
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        <h4 className="font-extrabold text-sm text-[#111315] tracking-tight">{ev.title}</h4>
                        <p className="text-xs text-[#64748B] flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#D99B26]" />
                          <span>{ev.venue}, {ev.location}</span>
                        </p>
                        <p className="text-xs text-[#64748B] flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#D99B26]" />
                          <span>{ev.date} • {ev.time}</span>
                        </p>
                        {ev.speakerMentor && (
                          <p className="text-[11px] font-semibold text-[#111315]">
                            Keynote: {ev.speakerMentor}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-4 border-t border-[#E2E8F0] flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#64748B]">
                        {(ev.rsvps || ev.attendees || []).length} Leaders RSVP'd
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingEventId(ev._id);
                            setEventFormData({
                              title: ev.title,
                              speakerMentor: ev.speakerMentor || '',
                              location: ev.location,
                              venue: ev.venue,
                              eventDate: ev.eventDate ? new Date(ev.eventDate).toISOString().split('T')[0] : '',
                              date: ev.date,
                              time: ev.time,
                              category: ev.category,
                              type: ev.type || 'UPCOMING',
                              description: ev.description,
                              bannerUrl: ev.bannerUrl || ev.banner
                            });
                            setEventFilePreview(ev.bannerUrl || ev.banner);
                            setEventModalOpen(true);
                          }}
                          className="p-1 text-[#111315] hover:bg-white rounded"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(ev._id)}
                          className="p-1 text-rose-600 hover:bg-white rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

          </div>
        )}

        {/* ==================================================================== */}
        {/* MODULE 7: QUIZ MANAGEMENT SYSTEM                                     */}
        {/* ==================================================================== */}
        {activeTab === 'quiz' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-[#111315] tracking-tight">
                  Strategic Assessment Scenarios ({questions.length})
                </h3>
                <p className="text-xs text-[#64748B]">
                  Manage the 4-scenario executive evaluation engine and archetype scoring keys.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingQuestionId(null);
                  setQuestionFormData({
                    questionText: '',
                    category: 'Strategic Leadership',
                    options: [
                      { text: '', trait: 'Visionary Strategist' },
                      { text: '', trait: 'Agile Disruptor' },
                      { text: '', trait: 'Operational Maestro' },
                      { text: '', trait: 'Empathetic Leader' }
                    ],
                    correctAnswerIndex: 0
                  });
                  setQuizModalOpen(true);
                }}
                className="btn-charcoal text-xs py-2.5 px-5 rounded-full flex items-center gap-2"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#D99B26]" />
                <span>Add Question</span>
              </button>
            </div>

            {/* Question Cards */}
            <div className="space-y-4">
              {questions.map((q, qIdx) => (
                <div key={q._id} className="p-5 rounded-2xl border border-[#E2E8F0] bg-[#F7F7F4]/40 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#D99B26]">
                        Scenario {qIdx + 1} • {q.category || 'Strategic Leadership'}
                      </span>
                      <h4 className="font-extrabold text-sm sm:text-base text-[#111315] mt-1">
                        {q.questionText}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => {
                          setEditingQuestionId(q._id);
                          setQuestionFormData({
                            questionText: q.questionText,
                            category: q.category || 'Strategic Leadership',
                            options: q.options.map((opt) => (typeof opt === 'string' ? { text: opt, trait: 'Strategic Leader' } : opt)),
                            correctAnswerIndex: q.correctAnswerIndex || 0
                          });
                          setQuizModalOpen(true);
                        }}
                        className="p-1.5 text-[#111315] hover:bg-white rounded-lg"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q._id)}
                        className="p-1.5 text-rose-600 hover:bg-white rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#E2E8F0]">
                    {(q.options || []).map((opt, oIdx) => {
                      const text = typeof opt === 'string' ? opt : opt.text;
                      const trait = typeof opt === 'object' ? opt.trait : '';
                      const isTarget = q.correctAnswerIndex === oIdx;
                      return (
                        <div
                          key={oIdx}
                          className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                            isTarget
                              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-semibold'
                              : 'bg-white border-[#E2E8F0] text-[#111315]'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                            isTarget ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <div>
                            <p>{text}</p>
                            {trait && <span className="text-[10px] text-[#D99B26] font-bold">[{trait}]</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ==================================================================== */}
        {/* MODULE 8: MASS MAILER / BROADCAST MODULE                             */}
        {/* ==================================================================== */}
        {activeTab === 'broadcast' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E2E8F0] shadow-xl max-w-4xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-[#111315] tracking-tight">
                  Executive Broadcast Dispatch (Mass Mailer)
                </h3>
                <p className="text-xs text-[#64748B]">
                  Dispatch high-priority advisory memos, conclave invites, or policy announcements to verified members.
                </p>
              </div>

              <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Targeting {stats.totalMembers} Verified Leaders</span>
              </div>
            </div>

            <form onSubmit={handleSendMassMail} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1.5">
                  Broadcast Subject Line *
                </label>
                <input
                  type="text"
                  value={broadcastData.subject}
                  onChange={(e) => setBroadcastData({ ...broadcastData, subject: e.target.value })}
                  placeholder="e.g. Confidential: Boardroom AI Directive & Q4 Conclave Itinerary"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                />
              </div>

              {/* Message Body with Preview Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315]">
                    Advisory Body Copy (HTML Supported) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setBroadcastPreview(!broadcastPreview)}
                    className="text-xs font-semibold text-[#D99B26] hover:underline flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{broadcastPreview ? 'Edit Markup' : 'Live Preview'}</span>
                  </button>
                </div>

                {broadcastPreview ? (
                  <div className="w-full p-5 rounded-2xl border border-[#E2E8F0] bg-[#F7F7F4] min-h-[220px] text-sm text-[#111315] prose max-w-none">
                    <h4 className="font-bold border-b pb-2 mb-3">{broadcastData.subject || 'Subject Preview'}</h4>
                    <div dangerouslySetInnerHTML={{ __html: broadcastData.message || '<p className="text-slate-400">Empty message body...</p>' }} />
                  </div>
                ) : (
                  <textarea
                    rows={8}
                    value={broadcastData.message}
                    onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
                    placeholder="<p>Dear Executive,</p><p>You are cordially invited to participate in the closed-door Chatham House conclave...</p>"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] font-mono text-xs focus:ring-2 focus:ring-[#D99B26] focus:outline-none leading-relaxed"
                  />
                )}
              </div>

              {/* Quick Template Inserters */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-[#64748B] text-[11px] font-medium">Quick Snippets:</span>
                <button
                  type="button"
                  onClick={() => setBroadcastData((prev) => ({
                    ...prev,
                    message: prev.message + '<p><strong>Confidential Notice:</strong> All discussions at the upcoming Conclave will be governed strictly under the <em>Chatham House Rule</em>.</p>'
                  }))}
                  className="px-2.5 py-1 rounded-lg bg-[#F7F7F4] border border-[#E2E8F0] text-[11px] font-medium text-[#111315] hover:bg-slate-100"
                >
                  + Chatham House Notice
                </button>
                <button
                  type="button"
                  onClick={() => setBroadcastData((prev) => ({
                    ...prev,
                    message: prev.message + '<p><a href="http://localhost:5173/events" style="background:#111315;color:#D99B26;padding:10px 20px;border-radius:20px;text-decoration:none;font-weight:bold;display:inline-block;">Reserve Boardroom Seat &rarr;</a></p>'
                  }))}
                  className="px-2.5 py-1 rounded-lg bg-[#F7F7F4] border border-[#E2E8F0] text-[11px] font-medium text-[#111315] hover:bg-slate-100"
                >
                  + RSVP CTA Button
                </button>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                <p className="text-xs text-[#64748B]">
                  Dispatched via verified Nodemailer Gmail SMTP gateway with confidential BCC.
                </p>

                <button
                  type="submit"
                  disabled={sendingBroadcast}
                  className="btn-charcoal text-xs py-3 px-8 rounded-full flex items-center gap-2 shadow-lg"
                >
                  <Send className={`w-3.5 h-3.5 text-[#D99B26] ${sendingBroadcast ? 'animate-bounce' : ''}`} />
                  <span>{sendingBroadcast ? 'Dispatching Broadcast...' : 'SEND MASS MAIL'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* ==================================================================== */}
      {/* MODALS: MENTOR / SPONSOR / TESTIMONIAL / EVENT / QUIZ                */}
      {/* ==================================================================== */}

      {/* 1. Mentor Drawer Modal */}
      {mentorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto border border-[#E2E8F0] shadow-2xl animate-fade-in">
            <h3 className="text-lg font-extrabold text-[#111315] mb-1">
              {editingMentorId ? 'Update Faculty Details' : 'Onboard C-Suite Mentor'}
            </h3>
            <p className="text-xs text-[#64748B] mb-5">
              Assets uploaded directly to ImageKit CDN storage.
            </p>

            <form onSubmit={handleSaveMentor} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">Name *</label>
                  <input
                    type="text"
                    value={mentorFormData.name}
                    onChange={(e) => setMentorFormData({ ...mentorFormData, name: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-xs focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">Designation *</label>
                  <input
                    type="text"
                    value={mentorFormData.designation}
                    onChange={(e) => setMentorFormData({ ...mentorFormData, designation: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-xs focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">Company</label>
                  <input
                    type="text"
                    value={mentorFormData.company}
                    onChange={(e) => setMentorFormData({ ...mentorFormData, company: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-xs focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">City</label>
                  <input
                    type="text"
                    value={mentorFormData.city}
                    onChange={(e) => setMentorFormData({ ...mentorFormData, city: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-xs focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">LinkedIn Profile URL</label>
                <input
                  type="url"
                  value={mentorFormData.linkedinUrl}
                  onChange={(e) => setMentorFormData({ ...mentorFormData, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/leader"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-xs focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">Core Expertise (Comma-separated)</label>
                <input
                  type="text"
                  value={mentorFormData.expertise}
                  onChange={(e) => setMentorFormData({ ...mentorFormData, expertise: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-xs focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                />
              </div>

              {/* ImageKit Headshot Dropzone */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">
                  Mentor Headshot Photo (ImageKit Integration)
                </label>
                <div className="flex items-center gap-4 p-4 border-2 border-dashed border-[#E2E8F0] rounded-2xl bg-[#F7F7F4]/50">
                  {mentorFilePreview ? (
                    <img src={mentorFilePreview} alt="Preview" className="w-14 h-14 rounded-full object-cover border border-[#D99B26]" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-[#64748B]">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#111315]">
                      {mentorFile ? mentorFile.name : mentorFormData.photoUrl ? 'CURRENT PHOTO (EXISTING)' : 'Upload Headshot'}
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setMentorFile(file);
                          setMentorFilePreview(URL.createObjectURL(file));
                        }
                      }}
                      className="mt-1 text-[11px] text-[#64748B] file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-[#111315] file:text-[#D99B26]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">Executive Bio</label>
                <textarea
                  rows={3}
                  value={mentorFormData.bio}
                  onChange={(e) => setMentorFormData({ ...mentorFormData, bio: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-xs focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setMentorModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#E2E8F0] text-xs font-semibold text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-charcoal text-xs py-2 px-5 rounded-full"
                >
                  {editingMentorId ? 'Save Changes' : 'Onboard Mentor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Sponsor Modal */}
      {sponsorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#E2E8F0] shadow-2xl animate-fade-in">
            <h3 className="text-lg font-extrabold text-[#111315] mb-1">
              {editingSponsorId ? 'Edit Sponsor' : 'Add Corporate Sponsor'}
            </h3>
            <p className="text-xs text-[#64748B] mb-5">Logo will be stored on ImageKit CDN.</p>

            <form onSubmit={handleSaveSponsor} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">Organization Name *</label>
                <input
                  type="text"
                  value={sponsorFormData.name}
                  onChange={(e) => setSponsorFormData({ ...sponsorFormData, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-xs focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">Partnership Tier</label>
                <select
                  value={sponsorFormData.tier}
                  onChange={(e) => setSponsorFormData({ ...sponsorFormData, tier: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-xs focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                >
                  <option value="strategic">Strategic Partner</option>
                  <option value="gold">Gold Sponsor</option>
                  <option value="silver">Silver Sponsor</option>
                  <option value="partner">Knowledge Partner</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">Website URL</label>
                <input
                  type="url"
                  value={sponsorFormData.websiteUrl}
                  onChange={(e) => setSponsorFormData({ ...sponsorFormData, websiteUrl: e.target.value })}
                  placeholder="https://company.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-xs focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">Logo File (ImageKit)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setSponsorFile(file);
                      setSponsorFilePreview(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full text-xs text-[#64748B] file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-[#111315] file:text-[#D99B26]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E2E8F0]">
                <button type="button" onClick={() => setSponsorModalOpen(false)} className="px-4 py-2 rounded-full border text-xs">Cancel</button>
                <button type="submit" className="btn-charcoal text-xs py-2 px-5 rounded-full">Save Sponsor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Testimonial Modal */}
      {testimonialModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#E2E8F0] shadow-2xl animate-fade-in">
            <h3 className="text-lg font-extrabold text-[#111315] mb-1">
              {editingTestimonialId ? 'Edit Testimonial' : 'Add Executive Perspective'}
            </h3>
            <p className="text-xs text-[#64748B] mb-5">Perspectives published across the platform.</p>

            <form onSubmit={handleSaveTestimonial} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">Author Name *</label>
                  <input
                    type="text"
                    value={testimonialFormData.authorName}
                    onChange={(e) => setTestimonialFormData({ ...testimonialFormData, authorName: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-xs focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">Role / Designation *</label>
                  <input
                    type="text"
                    value={testimonialFormData.authorRole}
                    onChange={(e) => setTestimonialFormData({ ...testimonialFormData, authorRole: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-xs focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">Testimonial Body *</label>
                <textarea
                  rows={4}
                  value={testimonialFormData.content}
                  onChange={(e) => setTestimonialFormData({ ...testimonialFormData, content: e.target.value })}
                  required
                  placeholder="Detail impact of CXO Connect confidential roundtables..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-xs focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">Optional Video URL</label>
                <input
                  type="url"
                  value={testimonialFormData.videoUrl}
                  onChange={(e) => setTestimonialFormData({ ...testimonialFormData, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-xs focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">Avatar Photo (ImageKit)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setTestimonialFile(file);
                      setTestimonialFilePreview(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full text-xs text-[#64748B] file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-[#111315] file:text-[#D99B26]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E2E8F0]">
                <button type="button" onClick={() => setTestimonialModalOpen(false)} className="px-4 py-2 rounded-full border text-xs">Cancel</button>
                <button type="submit" className="btn-charcoal text-xs py-2 px-5 rounded-full">Save Testimonial</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Event Modal */}
      {eventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#E2E8F0] shadow-2xl animate-fade-in">
            <h3 className="text-lg font-extrabold text-[#111315] mb-1">
              {editingEventId ? 'Update Conclave' : 'Schedule Executive Conclave'}
            </h3>
            <p className="text-xs text-[#64748B] mb-5">Posters uploaded to ImageKit CDN.</p>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">Title *</label>
                <input
                  type="text"
                  value={eventFormData.title}
                  onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-xs focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">Category</label>
                  <select
                    value={eventFormData.category}
                    onChange={(e) => setEventFormData({ ...eventFormData, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-xs"
                  >
                    <option value="Leadership Summit">Leadership Summit</option>
                    <option value="C-Suite Roundtable">C-Suite Roundtable</option>
                    <option value="Executive Masterclass">Executive Masterclass</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">Type</label>
                  <select
                    value={eventFormData.type}
                    onChange={(e) => setEventFormData({ ...eventFormData, type: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-xs"
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="PAST">Past Archive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">Location Indicator</label>
                  <input
                    type="text"
                    value={eventFormData.location}
                    onChange={(e) => setEventFormData({ ...eventFormData, location: e.target.value })}
                    placeholder="e.g. Pune, Indore, Virtual"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">Venue</label>
                  <input
                    type="text"
                    value={eventFormData.venue}
                    onChange={(e) => setEventFormData({ ...eventFormData, venue: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">Keynote / Speaker Tag</label>
                <input
                  type="text"
                  value={eventFormData.speakerMentor}
                  onChange={(e) => setEventFormData({ ...eventFormData, speakerMentor: e.target.value })}
                  placeholder="e.g. Arun M. Parameswaran, Former MD"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">Poster Graphic (ImageKit)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setEventFile(file);
                      setEventFilePreview(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full text-xs text-[#64748B] file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-[#111315] file:text-[#D99B26]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={eventFormData.description}
                  onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E2E8F0]">
                <button type="button" onClick={() => setEventModalOpen(false)} className="px-4 py-2 rounded-full border text-xs">Cancel</button>
                <button type="submit" className="btn-charcoal text-xs py-2 px-5 rounded-full">Save Conclave</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Quiz Question Modal */}
      {quizModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto border border-[#E2E8F0] shadow-2xl animate-fade-in">
            <h3 className="text-lg font-extrabold text-[#111315] mb-1">
              {editingQuestionId ? 'Edit Assessment Scenario' : 'Add Strategic Assessment Scenario'}
            </h3>
            <p className="text-xs text-[#64748B] mb-5">
              4 options evaluating executive governance traits.
            </p>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">Scenario Text *</label>
                <textarea
                  rows={3}
                  value={questionFormData.questionText}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, questionText: e.target.value })}
                  required
                  placeholder="e.g. When macroeconomic disruption impacts top-line margins by 20%, what is your primary move?"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-xs focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315] mb-1">Category</label>
                <input
                  type="text"
                  value={questionFormData.category}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, category: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-xs"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111315]">
                  4 Multiple-Choice Strategic Options (Select Correct Archetype Target)
                </label>
                {questionFormData.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-xl border border-[#E2E8F0] bg-[#F7F7F4]/50">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={questionFormData.correctAnswerIndex === idx}
                      onChange={() => setQuestionFormData({ ...questionFormData, correctAnswerIndex: idx })}
                      className="text-[#D99B26] focus:ring-[#D99B26]"
                    />
                    <span className="text-xs font-bold text-[#111315]">{String.fromCharCode(65 + idx)}.</span>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => {
                        const newOpts = [...questionFormData.options];
                        newOpts[idx].text = e.target.value;
                        setQuestionFormData({ ...questionFormData, options: newOpts });
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + idx)} response...`}
                      required
                      className="flex-1 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs bg-white"
                    />
                    <select
                      value={opt.trait}
                      onChange={(e) => {
                        const newOpts = [...questionFormData.options];
                        newOpts[idx].trait = e.target.value;
                        setQuestionFormData({ ...questionFormData, options: newOpts });
                      }}
                      className="text-[11px] px-2 py-1.5 rounded-lg border border-[#E2E8F0] bg-white"
                    >
                      <option value="Visionary Strategist">Visionary Strategist</option>
                      <option value="Agile Disruptor">Agile Disruptor</option>
                      <option value="Operational Maestro">Operational Maestro</option>
                      <option value="Empathetic Leader">Empathetic Leader</option>
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E2E8F0]">
                <button type="button" onClick={() => setQuizModalOpen(false)} className="px-4 py-2 rounded-full border text-xs">Cancel</button>
                <button type="submit" className="btn-charcoal text-xs py-2 px-5 rounded-full">Save Scenario</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
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
