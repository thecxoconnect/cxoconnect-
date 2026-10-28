import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { adminService } from '../../services/api';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  GraduationCap,
  Calendar,
  Shield,
  Search,
  Download,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  UploadCloud,
  X,
  Check,
  AlertCircle,
  MapPin,
  Mail,
  ChevronRight,
  Sparkles,
  Clock,
  RotateCcw
} from 'lucide-react';
import ConfirmationModal from '../../components/ConfirmationModal';

const Dashboard = () => {
  const { user, isAdmin, isMainAdmin } = useAuth();
  const { addToast } = useToast();

  // Active module: strictly 5 scoped modules
  // 'overview' | 'members' | 'secondary_admins' | 'mentors' | 'events'
  const [activeModule, setActiveModule] = useState('overview');

  // Loading & Sync state
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Confirmation Modal
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDanger: false
  });

  // ==========================================
  // MODULE 1: OVERVIEW STATE
  // ==========================================
  const [overviewTab, setOverviewTab] = useState('approved'); // 'approved' | 'admins'
  const [approvedMembers, setApprovedMembers] = useState([]);
  const [secondaryAdminsList, setSecondaryAdminsList] = useState([]);
  const [overviewCounts, setOverviewCounts] = useState({
    approved: 0,
    secondaryAdmins: 0,
    pending: 0,
    rejected: 0
  });
  const [selectedMemberModal, setSelectedMemberModal] = useState(null);

  // ==========================================
  // MODULE 2: MEMBERS STATE
  // ==========================================
  const [memberStatusTab, setMemberStatusTab] = useState('waitlist'); // 'waitlist' | 'accepted' | 'rejected'
  const [memberSearch, setMemberSearch] = useState('');
  const [membersList, setMembersList] = useState([]);
  const [selectedMemberDrawer, setSelectedMemberDrawer] = useState(null);

  // ==========================================
  // MODULE 3: SECONDARY ADMINS STATE
  // ==========================================
  const [adminStatusTab, setAdminStatusTab] = useState('accepted'); // 'waitlist' | 'accepted' | 'rejected'
  const [adminSearch, setAdminSearch] = useState('');
  const [adminsList, setAdminsList] = useState([]);
  const [selectedAdminDrawer, setSelectedAdminDrawer] = useState(null);

  // ==========================================
  // MODULE 4: MENTORS STATE
  // ==========================================
  const [mentors, setMentors] = useState([]);
  const [mentorDrawerOpen, setMentorDrawerOpen] = useState(false);
  const [editingMentorId, setEditingMentorId] = useState(null);
  const [mentorFormData, setMentorFormData] = useState({
    name: '',
    city: 'Mumbai',
    linkedinUrl: '',
    photoUrl: ''
  });
  const [mentorFile, setMentorFile] = useState(null);
  const [mentorFilePreview, setMentorFilePreview] = useState('');
  const [savingMentor, setSavingMentor] = useState(false);

  // ==========================================
  // MODULE 5: EVENTS STATE
  // ==========================================
  const [events, setEvents] = useState([]);
  const [eventDrawerOpen, setEventDrawerOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [eventFormData, setEventFormData] = useState({
    title: '',
    speakerMentor: '',
    location: 'Mumbai, India',
    date: '',
    type: 'UPCOMING',
    registrationUrl: '',
    gallery: []
  });
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [savingEvent, setSavingEvent] = useState(false);

  // ==========================================
  // DATA FETCHING & SYNCHRONIZATION
  // ==========================================
  const fetchAllData = async (isSync = false) => {
    try {
      if (isSync) setSyncing(true);
      else setLoading(true);

      const [overviewRes, membersRes, mentorsRes, eventsRes] = await Promise.all([
        adminService.getOverview().catch(() => ({ data: { data: { counts: {}, approvedMembers: [], secondaryAdmins: [] } } })),
        adminService.getMembers().catch(() => ({ data: { data: [] } })),
        adminService.getMentors().catch(() => ({ data: { data: [] } })),
        adminService.getEvents().catch(() => ({ data: { data: [] } }))
      ]);

      // Overview
      if (overviewRes.data?.data) {
        setApprovedMembers(overviewRes.data.data.approvedMembers || []);
        setSecondaryAdminsList(overviewRes.data.data.secondaryAdmins || []);
        setOverviewCounts(overviewRes.data.data.counts || {});
      }

      // Members
      if (membersRes.data?.data) {
        setMembersList(membersRes.data.data);
      }

      // Mentors
      if (mentorsRes.data?.data) {
        setMentors(mentorsRes.data.data);
      }

      // Events
      if (eventsRes.data?.data) {
        setEvents(eventsRes.data.data);
      }

      if (isSync) {
        addToast('Synced fresh data directly from MongoDB.', 'success');
      }
    } catch (err) {
      console.error('[Dashboard fetchAllData Error]', err);
      addToast('Failed to fetch administrative data from server.', 'error');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Guard: Admin role required
  if (!isAdmin && user?.role !== 'admin') {
    return <Navigate to="/profile" replace />;
  }

  // ==========================================
  // ACTIONS: EXPORT REPORT
  // ==========================================
  const handleExportReport = async () => {
    try {
      addToast('Generating CSV report from MongoDB documents...', 'info');
      const response = await adminService.exportReport('all');
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cxo_connect_${activeModule}_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      addToast('Export report downloaded successfully.', 'success');
    } catch (err) {
      console.error('[Export Error]', err);
      addToast('Failed to export CSV report.', 'error');
    }
  };

  // ==========================================
  // ACTIONS: STATUS UPDATES
  // ==========================================
  const handleUpdateMemberStatus = async (memberId, newStatus) => {
    try {
      const res = await adminService.updateMemberStatus(memberId, newStatus);
      if (res.data.success) {
        addToast(`Member status updated to ${newStatus}.`, 'success');
        setSelectedMemberModal(null);
        setSelectedMemberDrawer(null);
        fetchAllData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update member status.', 'error');
    }
  };

  const handleDeleteMember = async (memberId) => {
    setModalConfig({
      isOpen: true,
      title: 'Remove Member Account',
      message: 'Are you sure you want to permanently delete this member account from CXO Connect? This action cannot be undone.',
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await adminService.deleteMember(memberId);
          if (res.data.success) {
            addToast('Member account permanently removed.', 'success');
            setSelectedMemberModal(null);
            setSelectedMemberDrawer(null);
            fetchAllData();
          }
        } catch (err) {
          addToast(err.response?.data?.message || 'Failed to delete account.', 'error');
        }
      }
    });
  };

  const handleToggleAdminRole = async (userId, targetRole) => {
    try {
      const res = await adminService.toggleMemberRole(userId, targetRole);
      if (res.data.success) {
        addToast(`User role updated to ${targetRole}.`, 'success');
        setSelectedAdminDrawer(null);
        fetchAllData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to modify admin role.', 'error');
    }
  };

  // ==========================================
  // ACTIONS: MENTORS MODULE
  // ==========================================
  const handleOpenMentorDrawer = (mentor = null) => {
    if (mentor) {
      setEditingMentorId(mentor._id);
      setMentorFormData({
        name: mentor.name || '',
        city: mentor.city || 'Mumbai',
        linkedinUrl: mentor.linkedinUrl || mentor.linkedin || '',
        photoUrl: mentor.photoUrl || mentor.image || ''
      });
      setMentorFilePreview(mentor.photoUrl || mentor.image || '');
    } else {
      setEditingMentorId(null);
      setMentorFormData({
        name: '',
        city: 'Mumbai',
        linkedinUrl: '',
        photoUrl: ''
      });
      setMentorFilePreview('');
    }
    setMentorFile(null);
    setMentorDrawerOpen(true);
  };

  const handleMentorFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMentorFile(file);
      setMentorFilePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveMentor = async (e) => {
    e.preventDefault();
    if (!mentorFormData.name) {
      addToast('Please enter the mentor full name.', 'warning');
      return;
    }

    try {
      setSavingMentor(true);
      const fd = new FormData();
      fd.append('name', mentorFormData.name);
      fd.append('city', mentorFormData.city);
      fd.append('linkedinUrl', mentorFormData.linkedinUrl);
      if (mentorFile) {
        fd.append('image', mentorFile);
      } else if (mentorFormData.photoUrl) {
        fd.append('photoUrl', mentorFormData.photoUrl);
      }

      if (editingMentorId) {
        await adminService.updateMentor(editingMentorId, fd);
        addToast('Mentor details updated successfully.', 'success');
      } else {
        await adminService.createMentor(fd);
        addToast('New C-Suite mentor added to CXO Connect.', 'success');
      }
      setMentorDrawerOpen(false);
      fetchAllData();
    } catch (err) {
      console.error('[Save Mentor Error]', err);
      addToast(err.response?.data?.message || 'Failed to save mentor profile.', 'error');
    } finally {
      setSavingMentor(false);
    }
  };

  const handleDeleteMentor = (mentorId) => {
    setModalConfig({
      isOpen: true,
      title: 'Delete Mentor',
      message: 'Are you sure you want to remove this mentor profile? All associated media will be cleaned up.',
      isDanger: true,
      onConfirm: async () => {
        try {
          await adminService.deleteMentor(mentorId);
          addToast('Mentor removed successfully.', 'success');
          fetchAllData();
        } catch (err) {
          addToast('Failed to delete mentor.', 'error');
        }
      }
    });
  };

  // ==========================================
  // ACTIONS: EVENTS MODULE
  // ==========================================
  const handleOpenEventDrawer = (event = null) => {
    if (event) {
      setEditingEventId(event._id);
      setEventFormData({
        title: event.title || '',
        speakerMentor: event.speakerMentor || '',
        location: event.location || 'Mumbai, India',
        date: event.date || '',
        type: event.type ? event.type.toUpperCase() : 'UPCOMING',
        registrationUrl: event.registrationUrl || '',
        gallery: event.gallery || []
      });
      setGalleryPreviews(event.gallery || []);
    } else {
      setEditingEventId(null);
      setEventFormData({
        title: '',
        speakerMentor: '',
        location: 'Mumbai, India',
        date: 'November 24, 2026',
        type: 'UPCOMING',
        registrationUrl: '',
        gallery: []
      });
      setGalleryPreviews([]);
    }
    setGalleryFiles([]);
    setEventDrawerOpen(true);
  };

  const handleGalleryFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + galleryFiles.length > 10) {
      addToast('Maximum 10 images allowed for event gallery.', 'warning');
      return;
    }
    setGalleryFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setGalleryPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!eventFormData.title) {
      addToast('Event title is required.', 'warning');
      return;
    }

    try {
      setSavingEvent(true);
      const fd = new FormData();
      fd.append('title', eventFormData.title);
      fd.append('speakerMentor', eventFormData.speakerMentor);
      fd.append('location', eventFormData.location);
      fd.append('date', eventFormData.date);
      fd.append('type', eventFormData.type);
      fd.append('registrationUrl', eventFormData.registrationUrl);

      // Existing URLs
      const existingUrls = galleryPreviews.filter((url) => typeof url === 'string' && url.startsWith('http'));
      fd.append('gallery', JSON.stringify(existingUrls));

      // New files to upload via Multer & ImageKit
      galleryFiles.forEach((file) => {
        fd.append('gallery', file);
      });

      if (editingEventId) {
        await adminService.updateEvent(editingEventId, fd);
        addToast('Conclave details updated successfully.', 'success');
      } else {
        await adminService.createEvent(fd);
        addToast('New executive conclave scheduled.', 'success');
      }
      setEventDrawerOpen(false);
      fetchAllData();
    } catch (err) {
      console.error('[Save Event Error]', err);
      addToast(err.response?.data?.message || 'Failed to save event.', 'error');
    } finally {
      setSavingEvent(false);
    }
  };

  const handleDeleteEvent = (eventId) => {
    setModalConfig({
      isOpen: true,
      title: 'Delete Event',
      message: 'Are you sure you want to cancel and remove this conclave? Associated ImageKit files will be cleaned up.',
      isDanger: true,
      onConfirm: async () => {
        try {
          await adminService.deleteEvent(eventId);
          addToast('Event deleted successfully.', 'success');
          fetchAllData();
        } catch (err) {
          addToast('Failed to delete event.', 'error');
        }
      }
    });
  };

  // ==========================================
  // FILTERING LOGIC
  // ==========================================
  // Filtered members list for Module 2
  const filteredMembers = membersList.filter((m) => {
    const statusMatch =
      memberStatusTab === 'waitlist'
        ? m.status === 'pending'
        : m.status === memberStatusTab;
    if (!statusMatch) return false;

    if (!memberSearch) return true;
    const s = memberSearch.toLowerCase();
    return (
      m.name?.toLowerCase().includes(s) ||
      m.email?.toLowerCase().includes(s) ||
      m.company?.toLowerCase().includes(s) ||
      m.city?.toLowerCase().includes(s)
    );
  });

  // Filtered secondary admins list for Module 3
  const filteredAdmins = membersList.filter((m) => {
    // Show users with role === 'admin' OR if waitlist, users applying for admin
    const isTargetRole = adminStatusTab === 'accepted' ? m.role === 'admin' : true;
    const statusMatch =
      adminStatusTab === 'waitlist'
        ? m.status === 'pending'
        : m.status === adminStatusTab;

    if (!isTargetRole || !statusMatch) return false;

    if (!adminSearch) return true;
    const s = adminSearch.toLowerCase();
    return (
      m.name?.toLowerCase().includes(s) ||
      m.email?.toLowerCase().includes(s) ||
      m.company?.toLowerCase().includes(s) ||
      m.city?.toLowerCase().includes(s)
    );
  });

  // Archive Stream past events
  const pastEvents = events.filter((e) => (e.type || '').toUpperCase() === 'PAST');

  return (
    <div className="min-h-screen bg-[#F7F7F4] flex flex-col font-sans">
      
      {/* ==========================================
          TOP HEADER BAR
          ========================================== */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-20 z-40 px-4 sm:px-6 lg:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          {/* Left: Shield Icon + "ADMINISTRATIVE HUB" (Bold Serif) */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EBF5FF] border border-[#BFDBFE] flex items-center justify-center text-[#0066CC] shadow-xs">
              <Shield className="w-5 h-5 text-[#0066CC]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight font-serif uppercase">
                Administrative Hub
              </h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#0066CC]">
                CXO Connect Governance System
              </p>
            </div>
          </div>

          {/* Right: Dual Pill Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* [ ↗ EXPORT REPORT ] (Soft mint #E6F4EA, green text #137333) */}
            <button
              onClick={handleExportReport}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E6F4EA] text-[#137333] hover:bg-[#d4edd9] text-xs font-bold tracking-wide transition-all shadow-xs border border-[#CEEAD6]"
              title="Export current collection view to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT REPORT</span>
            </button>

            {/* [ 🔄 REFRESH SYNC ] (Soft gray #F1F5F9, dark text) */}
            <button
              onClick={() => fetchAllData(true)}
              disabled={syncing}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F1F5F9] text-[#0F172A] hover:bg-[#E2E8F0] text-xs font-bold tracking-wide transition-all shadow-xs border border-[#E2E8F0]"
              title="Re-trigger Axios fetch for fresh MongoDB data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-[#0066CC]' : ''}`} />
              <span>REFRESH SYNC</span>
            </button>
          </div>

        </div>
      </header>

      {/* ==========================================
          MAIN LAYOUT: SIDEBAR + CONTENT AREA
          ========================================== */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ==========================================
            SIDEBAR NAVIGATION (Strictly 5 Modules)
            ========================================== */}
        <aside className="lg:col-span-3">
          <nav className="bg-white rounded-3xl border border-[#E2E8F0] p-3 shadow-xs space-y-1.5 sticky top-40">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Core Modules
            </div>

            {/* 1. Overview */}
            <button
              onClick={() => setActiveModule('overview')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeModule === 'overview'
                  ? 'bg-[#0066CC] text-white shadow-sm'
                  : 'text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview</span>
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                activeModule === 'overview' ? 'bg-white/20 text-white' : 'bg-[#F1F5F9] text-[#64748B]'
              }`}>
                {approvedMembers.length + secondaryAdminsList.length}
              </span>
            </button>

            {/* 2. Members */}
            <button
              onClick={() => setActiveModule('members')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeModule === 'members'
                  ? 'bg-[#0066CC] text-white shadow-sm'
                  : 'text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Members</span>
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                activeModule === 'members' ? 'bg-white/20 text-white' : 'bg-[#F1F5F9] text-[#64748B]'
              }`}>
                {membersList.length}
              </span>
            </button>

            {/* 3. Secondary Admins */}
            <button
              onClick={() => setActiveModule('secondary_admins')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeModule === 'secondary_admins'
                  ? 'bg-[#0066CC] text-white shadow-sm'
                  : 'text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4" />
                <span>Secondary Admins</span>
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                activeModule === 'secondary_admins' ? 'bg-white/20 text-white' : 'bg-[#F1F5F9] text-[#64748B]'
              }`}>
                {secondaryAdminsList.length}
              </span>
            </button>

            {/* 4. Mentors */}
            <button
              onClick={() => setActiveModule('mentors')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeModule === 'mentors'
                  ? 'bg-[#0066CC] text-white shadow-sm'
                  : 'text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <GraduationCap className="w-4 h-4" />
                <span>Mentors</span>
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                activeModule === 'mentors' ? 'bg-white/20 text-white' : 'bg-[#F1F5F9] text-[#64748B]'
              }`}>
                {mentors.length}
              </span>
            </button>

            {/* 5. Events */}
            <button
              onClick={() => setActiveModule('events')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeModule === 'events'
                  ? 'bg-[#0066CC] text-white shadow-sm'
                  : 'text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4" />
                <span>Events</span>
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                activeModule === 'events' ? 'bg-white/20 text-white' : 'bg-[#F1F5F9] text-[#64748B]'
              }`}>
                {events.length}
              </span>
            </button>
          </nav>
        </aside>

        {/* ==========================================
            MODULE CONTENT ROUTER (Strictly 5 Views)
            ========================================== */}
        <main className="lg:col-span-9 space-y-6">

          {/* ==========================================
              MODULE 1: OVERVIEW
              ========================================== */}
          {activeModule === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Header & Subtitle */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-xs">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#0F172A] font-serif">
                    Overview
                  </h2>
                  <p className="text-xs uppercase font-bold tracking-wider text-[#64748B] mt-1">
                    Administrative Directory — MANAGE APPROVED MEMBERS AND ADMINISTRATIVE STAFF
                  </p>
                </div>

                {/* Directory Switcher: Dual Pill Toggle [ APPROVED MEMBERS ] vs [ SECONDARY ADMINS ] */}
                <div className="inline-flex p-1 bg-[#F1F5F9] rounded-full border border-[#E2E8F0]">
                  <button
                    onClick={() => setOverviewTab('approved')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      overviewTab === 'approved'
                        ? 'bg-[#0066CC] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    APPROVED MEMBERS ({approvedMembers.length})
                  </button>
                  <button
                    onClick={() => setOverviewTab('admins')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      overviewTab === 'admins'
                        ? 'bg-[#0066CC] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    SECONDARY ADMINS ({secondaryAdminsList.length})
                  </button>
                </div>
              </div>

              {/* Member Grid: 3-column white rounded cards with names & (+) expand trigger */}
              {loading ? (
                <div className="py-20 text-center text-[#64748B]">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#0066CC] mb-2" />
                  <p className="text-sm font-semibold">Loading real executive directory from MongoDB...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(overviewTab === 'approved' ? approvedMembers : secondaryAdminsList).map((person) => (
                    <div
                      key={person._id}
                      className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {person.profileImage ? (
                          <img
                            src={person.profileImage}
                            alt={person.name}
                            className="w-11 h-11 rounded-full object-cover border border-[#E2E8F0]"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-[#EBF5FF] text-[#0066CC] flex items-center justify-center font-bold text-sm">
                            {person.name ? person.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#0F172A] truncate">
                            {person.name || person.email}
                          </p>
                          <p className="text-xs text-[#64748B] truncate">
                            {person.position || (person.role === 'admin' ? 'Administrator' : 'Member')}
                          </p>
                        </div>
                      </div>

                      {/* (+) Expand Trigger Button */}
                      <button
                        onClick={() => setSelectedMemberModal(person)}
                        className="w-8 h-8 rounded-full bg-[#F1F5F9] group-hover:bg-[#0066CC] group-hover:text-white text-[#0F172A] flex items-center justify-center transition-all flex-shrink-0"
                        title="View Executive Dossier"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {(overviewTab === 'approved' ? approvedMembers : secondaryAdminsList).length === 0 && (
                    <div className="col-span-3 py-16 bg-white rounded-3xl border border-[#E2E8F0] text-center text-[#64748B]">
                      <Users className="w-8 h-8 mx-auto text-[#94A3B8] mb-2" />
                      <p className="text-sm font-bold text-[#0F172A]">No records found</p>
                      <p className="text-xs">No active {overviewTab === 'approved' ? 'approved members' : 'secondary admins'} currently in database.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Detail Modal (On Clicking Member Card) */}
              {selectedMemberModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
                  <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E2E8F0] space-y-6 relative">
                    <button
                      onClick={() => setSelectedMemberModal(null)}
                      className="absolute top-5 right-5 p-1.5 rounded-full text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    {/* Centered Circular ImageKit Profile Avatar + ACCEPTED badge + MEMBER label */}
                    <div className="text-center flex flex-col items-center">
                      <div className="relative">
                        {selectedMemberModal.profileImage ? (
                          <img
                            src={selectedMemberModal.profileImage}
                            alt={selectedMemberModal.name}
                            className="w-24 h-24 rounded-full object-cover border-4 border-[#E2E8F0] shadow-sm"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-[#0066CC] text-white flex items-center justify-center text-2xl font-bold">
                            {selectedMemberModal.name ? selectedMemberModal.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        <span className="absolute bottom-0 right-0 px-2 py-0.5 bg-[#137333] text-white text-[10px] font-extrabold rounded-full border-2 border-white shadow-xs">
                          ACCEPTED
                        </span>
                      </div>

                      <h3 className="text-xl font-extrabold text-[#0F172A] font-serif mt-3">
                        {selectedMemberModal.name || 'Executive Member'}
                      </h3>
                      <p className="text-xs uppercase font-bold tracking-wider text-[#0066CC]">
                        {selectedMemberModal.role === 'admin' ? 'SECONDARY ADMIN' : 'MEMBER'}
                      </p>
                    </div>

                    {/* Two Info Cards: CONTACT METHOD (email) and PRIMARY LOCATION (City, Pincode) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-3 text-xs">
                        <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block mb-1">
                          CONTACT METHOD
                        </span>
                        <div className="flex items-center gap-1.5 text-[#0F172A] font-semibold truncate" title={selectedMemberModal.email}>
                          <Mail className="w-3.5 h-3.5 text-[#0066CC] flex-shrink-0" />
                          <span className="truncate">{selectedMemberModal.email}</span>
                        </div>
                      </div>

                      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-3 text-xs">
                        <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block mb-1">
                          PRIMARY LOCATION
                        </span>
                        <div className="flex items-center gap-1.5 text-[#0F172A] font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-[#0066CC] flex-shrink-0" />
                          <span>{selectedMemberModal.city || 'Mumbai'}, {selectedMemberModal.pincode || '400001'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Blue Pill Action Button: [ View Professional Network ] */}
                    <div>
                      <a
                        href={selectedMemberModal.linkedin || 'https://linkedin.com'}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-bold transition-all shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Professional Network</span>
                      </a>
                    </div>

                    {/* Footer Buttons: [ UNDO APPROVAL ] and [ REMOVE ] (soft pink #FEE2E2, red text #DC2626) */}
                    <div className="flex items-center gap-3 pt-2 border-t border-[#E2E8F0]">
                      <button
                        onClick={() => handleUpdateMemberStatus(selectedMemberModal._id, 'pending')}
                        className="flex-1 py-2 px-3 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>UNDO APPROVAL</span>
                      </button>

                      <button
                        onClick={() => handleDeleteMember(selectedMemberModal._id)}
                        className="flex-1 py-2 px-3 rounded-full bg-[#FEE2E2] hover:bg-[#FCD8D8] text-[#DC2626] text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>REMOVE</span>
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              MODULE 2: MEMBERS
              ========================================== */}
          {activeModule === 'members' && (
            <div className="space-y-6 animate-fade-in">
              {/* Header & Subtitle Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-xs">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#0F172A] font-serif">
                    Members
                  </h2>
                  <p className="text-xs uppercase font-bold tracking-wider text-[#64748B] mt-1">
                    Member Review / Member Waitlist / Member Approved / Member Rejected
                  </p>
                </div>
              </div>

              {/* Filter Bar: Pill segmented control + Search Input Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="inline-flex p-1 bg-white rounded-full border border-[#E2E8F0] shadow-xs w-full sm:w-auto">
                  <button
                    onClick={() => setMemberStatusTab('waitlist')}
                    className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      memberStatusTab === 'waitlist'
                        ? 'bg-[#0066CC] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    WAITLIST ({membersList.filter((m) => m.status === 'pending').length})
                  </button>
                  <button
                    onClick={() => setMemberStatusTab('accepted')}
                    className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      memberStatusTab === 'accepted'
                        ? 'bg-[#0066CC] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    APPROVED ({membersList.filter((m) => m.status === 'accepted').length})
                  </button>
                  <button
                    onClick={() => setMemberStatusTab('rejected')}
                    className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      memberStatusTab === 'rejected'
                        ? 'bg-[#0066CC] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    REJECTED ({membersList.filter((m) => m.status === 'rejected').length})
                  </button>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search by name, email, status..."
                    className="w-full pl-9 pr-4 py-2 rounded-full border border-[#E2E8F0] bg-white text-xs focus:ring-2 focus:ring-[#0066CC] focus:outline-none shadow-xs"
                  />
                </div>
              </div>

              {/* Grid View: Real User documents from MongoDB */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMembers.map((m) => (
                  <div
                    key={m._id}
                    onClick={() => setSelectedMemberDrawer(m)}
                    className="bg-white rounded-3xl border border-[#E2E8F0] p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-3">
                        {m.profileImage ? (
                          <img
                            src={m.profileImage}
                            alt={m.name}
                            className="w-12 h-12 rounded-full object-cover border border-[#E2E8F0]"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#EBF5FF] text-[#0066CC] flex items-center justify-center font-bold text-base">
                            {m.name ? m.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                          m.status === 'accepted'
                            ? 'bg-[#E6F4EA] text-[#137333]'
                            : m.status === 'pending'
                            ? 'bg-[#FEF3C7] text-[#92400E]'
                            : 'bg-[#FEE2E2] text-[#DC2626]'
                        }`}>
                          {m.status}
                        </span>
                      </div>

                      <h4 className="text-base font-extrabold text-[#0F172A] truncate">
                        {m.name || 'Anonymous Leader'}
                      </h4>
                      <p className="text-xs text-[#0066CC] font-semibold truncate">
                        {m.position || 'C-Suite Executive'}
                      </p>
                      <p className="text-xs text-[#64748B] truncate mt-0.5">
                        {m.company || 'Enterprise'}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#E2E8F0] mt-4 flex items-center justify-between text-xs text-[#64748B]">
                      <span>{m.city || 'India'}</span>
                      <span className="font-semibold text-[#0066CC]">Review &rarr;</span>
                    </div>
                  </div>
                ))}

                {filteredMembers.length === 0 && (
                  <div className="col-span-3 py-16 bg-white rounded-3xl border border-[#E2E8F0] text-center text-[#64748B]">
                    <Users className="w-8 h-8 mx-auto text-[#94A3B8] mb-2" />
                    <p className="text-sm font-bold text-[#0F172A]">No members found</p>
                    <p className="text-xs">No records matching the selected status and search query.</p>
                  </div>
                )}
              </div>

              {/* Member Action Drawer */}
              {selectedMemberDrawer && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
                  <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E2E8F0] space-y-6 relative">
                    <button
                      onClick={() => setSelectedMemberDrawer(null)}
                      className="absolute top-5 right-5 p-1.5 rounded-full text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-4">
                      {selectedMemberDrawer.profileImage ? (
                        <img
                          src={selectedMemberDrawer.profileImage}
                          alt={selectedMemberDrawer.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-[#0066CC]"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-[#0066CC] text-white flex items-center justify-center text-xl font-bold">
                          {selectedMemberDrawer.name ? selectedMemberDrawer.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-extrabold text-[#0F172A] font-serif">
                          {selectedMemberDrawer.name}
                        </h3>
                        <p className="text-xs text-[#0066CC] font-semibold">
                          {selectedMemberDrawer.position} • {selectedMemberDrawer.company}
                        </p>
                        <p className="text-xs text-[#64748B] mt-0.5">
                          {selectedMemberDrawer.email}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
                      <div>
                        <span className="text-[10px] font-bold text-[#64748B] uppercase block">Phone:</span>
                        <span className="font-semibold text-[#0F172A]">{selectedMemberDrawer.phone || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#64748B] uppercase block">Location:</span>
                        <span className="font-semibold text-[#0F172A]">{selectedMemberDrawer.city || 'Mumbai'}, {selectedMemberDrawer.pincode || '400001'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#64748B] uppercase block">Current Status:</span>
                        <span className="font-extrabold uppercase text-[#0066CC]">{selectedMemberDrawer.status}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#64748B] uppercase block">Role:</span>
                        <span className="font-extrabold uppercase text-[#0F172A]">{selectedMemberDrawer.role}</span>
                      </div>
                    </div>

                    {/* Action Drawer Buttons: Approve or Reject */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => handleUpdateMemberStatus(selectedMemberDrawer._id, 'accepted')}
                        className="flex-1 py-2.5 px-4 rounded-full bg-[#137333] hover:bg-[#0f5c29] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        <Check className="w-4 h-4" />
                        <span>APPROVE MEMBER</span>
                      </button>

                      <button
                        onClick={() => handleUpdateMemberStatus(selectedMemberDrawer._id, 'rejected')}
                        className="flex-1 py-2.5 px-4 rounded-full bg-[#DC2626] hover:bg-[#b91c1c] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        <X className="w-4 h-4" />
                        <span>REJECT</span>
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              MODULE 3: SECONDARY ADMINS
              ========================================== */}
          {activeModule === 'secondary_admins' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-xs">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#0F172A] font-serif">
                    Secondary Admins
                  </h2>
                  <p className="text-xs uppercase font-bold tracking-wider text-[#64748B] mt-1">
                    MODERATE ADMINISTRATIVE STAFF APPLICATIONS
                  </p>
                </div>
              </div>

              {/* Filter Bar: [ WAITLIST ] | [ APPROVED ] | [ REJECTED ] + Search Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="inline-flex p-1 bg-white rounded-full border border-[#E2E8F0] shadow-xs w-full sm:w-auto">
                  <button
                    onClick={() => setAdminStatusTab('waitlist')}
                    className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      adminStatusTab === 'waitlist'
                        ? 'bg-[#0066CC] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    WAITLIST ({membersList.filter((m) => m.status === 'pending').length})
                  </button>
                  <button
                    onClick={() => setAdminStatusTab('accepted')}
                    className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      adminStatusTab === 'accepted'
                        ? 'bg-[#0066CC] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    APPROVED ({secondaryAdminsList.length})
                  </button>
                  <button
                    onClick={() => setAdminStatusTab('rejected')}
                    className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      adminStatusTab === 'rejected'
                        ? 'bg-[#0066CC] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    REJECTED ({membersList.filter((m) => m.status === 'rejected').length})
                  </button>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="Search administrators..."
                    className="w-full pl-9 pr-4 py-2 rounded-full border border-[#E2E8F0] bg-white text-xs focus:ring-2 focus:ring-[#0066CC] focus:outline-none shadow-xs"
                  />
                </div>
              </div>

              {/* Grid View & Promotion Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAdmins.map((adm) => (
                  <div
                    key={adm._id}
                    className="bg-white rounded-3xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-3">
                        {adm.profileImage ? (
                          <img
                            src={adm.profileImage}
                            alt={adm.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-[#0066CC]"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#EBF5FF] text-[#0066CC] flex items-center justify-center font-bold text-base">
                            {adm.name ? adm.name.charAt(0).toUpperCase() : 'A'}
                          </div>
                        )}
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                          adm.role === 'admin'
                            ? 'bg-[#EBF5FF] text-[#0066CC]'
                            : 'bg-[#F1F5F9] text-[#64748B]'
                        }`}>
                          {adm.role === 'admin' ? 'ACTIVE ADMIN' : 'MEMBER'}
                        </span>
                      </div>

                      <h4 className="text-base font-extrabold text-[#0F172A] truncate">
                        {adm.name || 'Staff Member'}
                      </h4>
                      <p className="text-xs text-[#0066CC] font-semibold truncate">
                        {adm.position || 'Executive Operations'}
                      </p>
                      <p className="text-xs text-[#64748B] truncate mt-0.5">
                        {adm.email}
                      </p>
                    </div>

                    {/* Promotion Controls */}
                    <div className="pt-3 border-t border-[#E2E8F0] flex items-center gap-2">
                      {adm.role !== 'admin' ? (
                        <button
                          onClick={() => handleToggleAdminRole(adm._id, 'admin')}
                          className="w-full py-2 px-3 rounded-full bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-bold transition-all"
                        >
                          PROMOTE TO ADMIN
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleAdminRole(adm._id, 'member')}
                          disabled={adm.isMainAdmin}
                          className={`w-full py-2 px-3 rounded-full text-xs font-bold transition-all ${
                            adm.isMainAdmin
                              ? 'bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed'
                              : 'bg-[#FEE2E2] hover:bg-[#FCD8D8] text-[#DC2626]'
                          }`}
                        >
                          {adm.isMainAdmin ? 'SUPER ADMIN (IMMUTABLE)' : 'REVOKE ADMIN'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {filteredAdmins.length === 0 && (
                  <div className="col-span-3 py-16 bg-white rounded-3xl border border-[#E2E8F0] text-center text-[#64748B]">
                    <UserCheck className="w-8 h-8 mx-auto text-[#94A3B8] mb-2" />
                    <p className="text-sm font-bold text-[#0F172A]">No administrators found</p>
                    <p className="text-xs">No records currently match this filter.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==========================================
              MODULE 4: MENTORS
              ========================================== */}
          {activeModule === 'mentors' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-xs">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#0F172A] font-serif">
                    Mentors
                  </h2>
                  <p className="text-xs uppercase font-bold tracking-wider text-[#64748B] mt-1">
                    C-SUITE EXECUTIVE ADVISORS DIRECTORY
                  </p>
                </div>

                {/* Top Right Primary Blue Pill Button [ + NEW MENTOR ] */}
                <button
                  onClick={() => handleOpenMentorDrawer()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-bold tracking-wide transition-all shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>NEW MENTOR</span>
                </button>
              </div>

              {/* Table View: MENTOR, CITY, ACTIONS */}
              <div className="bg-white rounded-3xl border border-[#E2E8F0] overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="py-3.5 px-6">Mentor</th>
                      <th className="py-3.5 px-6">City</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {mentors.map((m) => (
                      <tr key={m._id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={m.photoUrl || m.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80'}
                              alt={m.name}
                              className="w-10 h-10 rounded-full object-cover border border-[#E2E8F0]"
                            />
                            <div>
                              <p className="text-sm font-bold text-[#0F172A]">{m.name}</p>
                              <p className="text-xs text-[#64748B]">{m.designation || 'C-Suite Advisor'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-semibold text-[#0F172A]">
                          {m.city || 'Mumbai'}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleOpenMentorDrawer(m)}
                              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0066CC] hover:bg-[#EBF5FF]"
                              title="Edit Mentor"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMentor(m._id)}
                              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEE2E2]"
                              title="Delete Mentor"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {mentors.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-[#64748B]">
                          No mentors currently registered in MongoDB.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add/Edit Mentor Drawer */}
              {mentorDrawerOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
                  <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E2E8F0] space-y-5 relative">
                    <button
                      onClick={() => setMentorDrawerOpen(false)}
                      className="absolute top-5 right-5 p-1.5 rounded-full text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div>
                      <h3 className="text-xl font-extrabold text-[#0F172A] font-serif">
                        {editingMentorId ? 'Edit Mentor Profile' : 'Add New Mentor'}
                      </h3>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        ImageKit.io CDN integration enabled
                      </p>
                    </div>

                    <form onSubmit={handleSaveMentor} className="space-y-4 text-xs">
                      {/* Name */}
                      <div>
                        <label className="block font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                          NAME *
                        </label>
                        <input
                          type="text"
                          value={mentorFormData.name}
                          onChange={(e) => setMentorFormData({ ...mentorFormData, name: e.target.value })}
                          required
                          placeholder="e.g. Arun M. Parameswaran"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#0066CC] focus:outline-none"
                        />
                      </div>

                      {/* City */}
                      <div>
                        <label className="block font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                          CITY
                        </label>
                        <input
                          type="text"
                          value={mentorFormData.city}
                          onChange={(e) => setMentorFormData({ ...mentorFormData, city: e.target.value })}
                          placeholder="e.g. Mumbai, Bengaluru, Delhi NCR"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#0066CC] focus:outline-none"
                        />
                      </div>

                      {/* LinkedIn URL */}
                      <div>
                        <label className="block font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                          LINKEDIN URL
                        </label>
                        <input
                          type="url"
                          value={mentorFormData.linkedinUrl}
                          onChange={(e) => setMentorFormData({ ...mentorFormData, linkedinUrl: e.target.value })}
                          placeholder="https://linkedin.com/in/username"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#0066CC] focus:outline-none"
                        />
                      </div>

                      {/* Image Upload Dropzone */}
                      <div>
                        <label className="block font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                          MENTOR PHOTO
                        </label>
                        <div className="border-2 border-dashed border-[#CBD5E1] hover:border-[#0066CC] rounded-2xl p-4 text-center cursor-pointer transition-colors relative bg-[#F8FAFC]">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleMentorFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          {mentorFilePreview ? (
                            <div className="flex items-center justify-center gap-3">
                              <img
                                src={mentorFilePreview}
                                alt="Preview"
                                className="w-12 h-12 rounded-full object-cover border border-[#0066CC]"
                              />
                              <div className="text-left">
                                <p className="font-bold text-[#0F172A]">Photo Selected</p>
                                <p className="text-[10px] text-[#64748B]">Click to change file</p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <UploadCloud className="w-6 h-6 mx-auto text-[#0066CC]" />
                              <p className="font-bold text-[#0F172A]">Upload photo</p>
                              <p className="text-[10px] text-[#64748B]">PNG, JPG, WEBP up to 5MB</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Full-width blue pill [ SAVE MENTOR ] */}
                      <button
                        type="submit"
                        disabled={savingMentor}
                        className="w-full py-3 rounded-full bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                      >
                        {savingMentor ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>UPLOADING TO IMAGEKIT...</span>
                          </>
                        ) : (
                          <span>SAVE MENTOR</span>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              MODULE 5: EVENTS
              ========================================== */}
          {activeModule === 'events' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-xs">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#0F172A] font-serif">
                    Events
                  </h2>
                  <p className="text-xs uppercase font-bold tracking-wider text-[#64748B] mt-1">
                    EXECUTIVE CONCLAVES & ROUNDTABLE CALENDAR
                  </p>
                </div>

                {/* Top Right Primary Blue Pill Button [ + NEW EVENT ] */}
                <button
                  onClick={() => handleOpenEventDrawer()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-bold tracking-wide transition-all shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>NEW EVENT</span>
                </button>
              </div>

              {/* Sub-Header Stream: Horizontal scroll list of ARCHIVE STREAM past event badges */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0066CC] block mb-2">
                  ARCHIVE STREAM (PAST EVENTS)
                </span>
                <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin">
                  {pastEvents.map((pe) => (
                    <div
                      key={pe._id}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] text-xs flex-shrink-0"
                    >
                      <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                      <span className="font-bold text-[#0F172A] truncate max-w-[200px]">{pe.title}</span>
                      <span className="text-[10px] text-[#64748B]">• {pe.date}</span>
                    </div>
                  ))}

                  {pastEvents.length === 0 && (
                    <span className="text-xs text-[#64748B]">No past conclaves in archive stream.</span>
                  )}
                </div>
              </div>

              {/* Table View: EVENT (Title), MENTOR (Assigned Speaker), LOCATION, TYPE, ACTIONS */}
              <div className="bg-white rounded-3xl border border-[#E2E8F0] overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="py-3.5 px-6">Event</th>
                      <th className="py-3.5 px-6">Mentor</th>
                      <th className="py-3.5 px-6">Location</th>
                      <th className="py-3.5 px-6">Type</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {events.map((ev) => {
                      const isUpcoming = (ev.type || '').toUpperCase() === 'UPCOMING';
                      return (
                        <tr key={ev._id} className="hover:bg-[#F8FAFC] transition-colors">
                          <td className="py-4 px-6 font-bold text-[#0F172A]">
                            <p className="truncate max-w-[240px]">{ev.title}</p>
                            <p className="text-[10px] text-[#64748B] font-normal">{ev.date}</p>
                          </td>
                          <td className="py-4 px-6 text-[#0F172A] font-semibold">
                            {ev.speakerMentor || 'Advisory Board'}
                          </td>
                          <td className="py-4 px-6 text-[#64748B]">
                            {ev.location || 'Mumbai, India'}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase ${
                              isUpcoming
                                ? 'bg-[#EBF5FF] text-[#0066CC] border border-[#BFDBFE]'
                                : 'bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]'
                            }`}>
                              {isUpcoming ? 'UPCOMING' : 'PAST'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => handleOpenEventDrawer(ev)}
                                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0066CC] hover:bg-[#EBF5FF]"
                                title="Edit Event"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(ev._id)}
                                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEE2E2]"
                                title="Delete Event"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {events.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-[#64748B]">
                          No events found in database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add/Edit Event Drawer */}
              {eventDrawerOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
                  <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E2E8F0] space-y-4 my-8 relative max-h-[90vh] overflow-y-auto">
                    <button
                      onClick={() => setEventDrawerOpen(false)}
                      className="absolute top-5 right-5 p-1.5 rounded-full text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div>
                      <h3 className="text-xl font-extrabold text-[#0F172A] font-serif">
                        {editingEventId ? 'Edit Event Conclave' : 'Create New Conclave'}
                      </h3>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        ImageKit.io CDN multi-image gallery enabled
                      </p>
                    </div>

                    <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
                      {/* Event Title */}
                      <div>
                        <label className="block font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                          EVENT TITLE *
                        </label>
                        <input
                          type="text"
                          value={eventFormData.title}
                          onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                          required
                          placeholder="e.g. CXO Connect Annual Leadership Conclave"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#0066CC] focus:outline-none"
                        />
                      </div>

                      {/* Mentor Name */}
                      <div>
                        <label className="block font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                          MENTOR NAME
                        </label>
                        <input
                          type="text"
                          value={eventFormData.speakerMentor}
                          onChange={(e) => setEventFormData({ ...eventFormData, speakerMentor: e.target.value })}
                          placeholder="e.g. Arun M. Parameswaran"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#0066CC] focus:outline-none"
                        />
                      </div>

                      {/* Location & Date */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                            LOCATION
                          </label>
                          <input
                            type="text"
                            value={eventFormData.location}
                            onChange={(e) => setEventFormData({ ...eventFormData, location: e.target.value })}
                            placeholder="e.g. Mumbai, India"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#0066CC] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                            DATE
                          </label>
                          <input
                            type="text"
                            value={eventFormData.date}
                            onChange={(e) => setEventFormData({ ...eventFormData, date: e.target.value })}
                            placeholder="e.g. November 14, 2026"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#0066CC] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Type (Upcoming / Past) */}
                      <div>
                        <label className="block font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                          TYPE
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setEventFormData({ ...eventFormData, type: 'UPCOMING' })}
                            className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                              eventFormData.type === 'UPCOMING'
                                ? 'bg-[#0066CC] text-white border-[#0066CC]'
                                : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]'
                            }`}
                          >
                            UPCOMING
                          </button>
                          <button
                            type="button"
                            onClick={() => setEventFormData({ ...eventFormData, type: 'PAST' })}
                            className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                              eventFormData.type === 'PAST'
                                ? 'bg-[#0F172A] text-white border-[#0F172A]'
                                : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]'
                            }`}
                          >
                            PAST
                          </button>
                        </div>
                      </div>

                      {/* Registration URL */}
                      <div>
                        <label className="block font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                          REGISTRATION URL
                        </label>
                        <input
                          type="url"
                          value={eventFormData.registrationUrl}
                          onChange={(e) => setEventFormData({ ...eventFormData, registrationUrl: e.target.value })}
                          placeholder="https://cxoconnect.com/register/event-id"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#0066CC] focus:outline-none"
                        />
                      </div>

                      {/* Event Gallery Dropzone: CLICK OR DRAG IMAGES TO UPLOAD (MAX 10 IMAGES ALLOWED) */}
                      <div>
                        <label className="block font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                          CLICK OR DRAG IMAGES TO UPLOAD (MAX 10 IMAGES ALLOWED)
                        </label>
                        <div className="border-2 border-dashed border-[#CBD5E1] hover:border-[#0066CC] rounded-2xl p-4 text-center cursor-pointer transition-colors relative bg-[#F8FAFC]">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleGalleryFilesChange}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <UploadCloud className="w-6 h-6 mx-auto text-[#0066CC] mb-1" />
                          <p className="font-bold text-[#0F172A]">Drag & drop event gallery photos</p>
                          <p className="text-[10px] text-[#64748B]">Batch uploads to ImageKit.io CDN</p>
                        </div>

                        {/* Previews */}
                        {galleryPreviews.length > 0 && (
                          <div className="grid grid-cols-5 gap-2 mt-2">
                            {galleryPreviews.map((imgUrl, idx) => (
                              <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-[#E2E8F0]">
                                <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Full-width blue pill [ SAVE EVENT ] */}
                      <button
                        type="submit"
                        disabled={savingEvent}
                        className="w-full py-3 rounded-full bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                      >
                        {savingEvent ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>UPLOADING TO IMAGEKIT...</span>
                          </>
                        ) : (
                          <span>SAVE EVENT</span>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig({ ...modalConfig, isOpen: false })}
        isDanger={modalConfig.isDanger}
      />
    </div>
  );
};

export default Dashboard;
