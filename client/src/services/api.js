import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_URL || 'https://cxoconnect-2bui.vercel.app/api';
const baseURL = rawBaseURL.replace(/\/+$/, '');

axios.defaults.baseURL = baseURL;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: automatically append JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cxo_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: handle 401 unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If expired token, clear storage
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/verify-otp') {
        // Only clear if on protected route
        // localStorage.removeItem('cxo_token');
        // localStorage.removeItem('cxo_user');
      }
    }
    return Promise.reject(error);
  }
);

// 1. Auth Module
export const authService = {
  manualAuth: (email, role = 'member') => api.post('/auth/manual', { email, role }),
  verifyOTP: (email, otp, token) => api.post('/auth/verify-otp', { email, otp, token }),
  resendOTP: (email) => api.post('/auth/resend-otp', { email }),
  completeProfile: (profileData) => api.post('/auth/complete-profile', profileData),
  getMe: () => api.get('/auth/me'),
  logout: () => {
    localStorage.removeItem('cxo_token');
    localStorage.removeItem('cxo_user');
    window.location.href = '/';
  }
};

// 2. Members Module
export const memberService = {
  getMembers: (params) => api.get('/members', { params }),
  getMemberStats: () => api.get('/members/stats'),
  getMemberById: (id) => api.get(`/members/${id}`),
  updateMemberStatus: (id, status) => api.put(`/members/${id}/status`, { status }),
  updateMemberRole: (id, role, isMainAdmin) => api.put(`/members/${id}/role`, { role, isMainAdmin }),
  deleteMember: (id) => api.delete(`/members/${id}`)
};

// 3. Events Module
export const eventService = {
  getEvents: (params) => api.get('/events', { params }),
  getEventById: (id) => api.get(`/events/${id}`),
  createEvent: (data) => api.post('/events', data),
  updateEvent: (id, data) => api.put(`/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  rsvpEvent: (id) => api.post(`/events/${id}/rsvp`)
};

// 4. Comments & Insights Module
export const commentService = {
  getComments: (params) => api.get('/comments', { params }),
  createComment: (data) => api.post('/comments', data),
  likeComment: (id) => api.post(`/comments/${id}/like`),
  deleteComment: (id) => api.delete(`/comments/${id}`)
};

// 5. Committee & Advisory Board Module
export const committeeService = {
  getCommittee: (params) => api.get('/committee', { params }),
  createCommitteeMember: (data) => api.post('/committee', data),
  updateCommitteeMember: (id, data) => api.put(`/committee/${id}`, data),
  deleteCommitteeMember: (id) => api.delete(`/committee/${id}`)
};

// 6. Mentors Module
export const mentorService = {
  getMentors: () => api.get('/mentors'),
  requestMentorship: (data) => api.post('/mentors/request', data),
  createMentor: (data) => api.post('/mentors', data),
  updateMentor: (id, data) => api.put(`/mentors/${id}`, data),
  deleteMentor: (id) => api.delete(`/mentors/${id}`)
};

// 7. Sponsors & Partners Module
export const sponsorService = {
  getSponsors: () => api.get('/sponsors'),
  submitPartnerInquiry: (data) => api.post('/sponsors/inquiry', data),
  createSponsor: (data) => api.post('/sponsors', data),
  deleteSponsor: (id) => api.delete(`/sponsors/${id}`)
};

// 8. Quiz & Assessment Module
export const quizService = {
  getQuestions: () => api.get('/quiz/questions'),
  submitQuiz: (answers) => api.post('/quiz/submit', { answers })
};

// 9. Contact Module
export const contactService = {
  submitContact: (data) => api.post('/contact', data)
};

// 10. Regional Chapters Module
export const chapterService = {
  getChapters: () => api.get('/chapters'),
  createChapter: (data) => api.post('/chapters', data)
};

// 11. ImageKit Upload Auth
export const imagekitService = {
  getAuthParams: () => api.get('/imagekit/auth')
};

// 12. Full Administrative Hub Service
export const adminService = {
  // Module 1: Overview & Directory
  getOverview: () => api.get('/admin/overview'),
  getStats: () => api.get('/admin/stats'),
  exportReport: (status = 'accepted') =>
    api.get(`/admin/export?status=${status}`, { responseType: 'blob' }),

  // Module 2: Members & Secondary Admins
  getMembers: (params) => api.get('/admin/members', { params }),
  updateMemberStatus: (id, status) => api.patch(`/admin/members/${id}/status`, { status }),
  toggleMemberRole: (id, role) => api.put(`/admin/members/${id}/role`, { role }),
  deleteMember: (id) => api.delete(`/admin/members/${id}`),

  // Module 3: Mentors & Committee
  getMentors: () => api.get('/admin/mentors'),
  createMentor: (formData) => api.post('/admin/mentors', formData),
  updateMentor: (id, formData) => api.put(`/admin/mentors/${id}`, formData),
  deleteMentor: (id) => api.delete(`/admin/mentors/${id}`),
  getCommittee: () => api.get('/admin/committee'),
  createCommittee: (formData) => api.post('/admin/committee', formData),
  deleteCommittee: (id) => api.delete(`/admin/committee/${id}`),

  // Module 4: Sponsors & Partners
  getSponsors: () => api.get('/admin/sponsors'),
  createSponsor: (formData) => api.post('/admin/sponsors', formData),
  updateSponsor: (id, formData) => api.put(`/admin/sponsors/${id}`, formData),
  deleteSponsor: (id) => api.delete(`/admin/sponsors/${id}`),

  // Module 5: Testimonials Engine
  getTestimonials: () => api.get('/admin/testimonials'),
  createTestimonial: (formData) => api.post('/admin/testimonials', formData),
  updateTestimonial: (id, formData) => api.put(`/admin/testimonials/${id}`, formData),
  deleteTestimonial: (id) => api.delete(`/admin/testimonials/${id}`),

  // Module 6: Events & Conclaves
  getEvents: (params) => api.get('/admin/events', { params }),
  createEvent: (formData) => api.post('/admin/events', formData),
  updateEvent: (id, formData) => api.put(`/admin/events/${id}`, formData),
  deleteEvent: (id) => api.delete(`/admin/events/${id}`),

  // Module 7: Quiz Management
  getQuestions: () => api.get('/admin/quiz/questions'),
  createQuestion: (data) => api.post('/admin/quiz/questions', data),
  updateQuestion: (id, data) => api.put(`/admin/quiz/questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`/admin/quiz/questions/${id}`),

  // Module 8: Mass Mailer / Broadcast
  sendMassMail: (data) => api.post('/admin/mass-mail', data)
};

// 13. Knowledge Hub Resources & Public Stats
export const resourceService = {
  getFrameworks: () => api.get('/resources/frameworks'),
  getCertifications: () => api.get('/resources/certifications'),
  getPublicStats: () => api.get('/members/public-stats')
};

export default api;
