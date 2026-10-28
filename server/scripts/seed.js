import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../models/User.js';
import Event from '../models/Event.js';
import Committee from '../models/Committee.js';
import Mentor from '../models/Mentor.js';
import Sponsor from '../models/Sponsor.js';
import Question from '../models/Question.js';
import Chapter from '../models/Chapter.js';
import Framework from '../models/Framework.js';
import Certification from '../models/Certification.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cxoconnect';

async function seedDatabase() {
  try {
    const primaryUri = process.env.MONGO_URI;
    const fallbackUri = 'mongodb://127.0.0.1:27017/cxoconnect';

    try {
      console.log('[Seed] Connecting to MongoDB at', primaryUri ? primaryUri.split('@')[1] || primaryUri : fallbackUri);
      await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 3000 });
      console.log('[Seed] Connected to primary MongoDB successfully.');
    } catch (primaryErr) {
      console.warn('[Seed Warning] Primary MongoDB connection failed, falling back to local MongoDB:', primaryErr.message);
      await mongoose.connect(fallbackUri, { serverSelectionTimeoutMS: 5000 });
      console.log('[Seed] Connected to local MongoDB fallback successfully.');
    }

    // 1. Seed Users (Super Admin and Executive Members)
    console.log('[Seed] Seeding Users...');
    await User.deleteMany({});

    const users = [
      {
        name: 'Anvi Sharma',
        email: 'theanvisharma@gmail.com',
        phone: '+91 98200 12345',
        company: 'CXO Connect Global',
        position: 'Managing Director & Founder',
        linkedin: 'https://linkedin.com/in/anvi-sharma-cxo',
        city: 'Mumbai',
        pincode: '400001',
        profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
        role: 'admin',
        isMainAdmin: true,
        status: 'accepted',
        profileComplete: true,
        isEmailVerified: true
      },
      {
        name: 'Chief Admin',
        email: 'admin@cxoconnect.com',
        phone: '+91 98200 99999',
        company: 'CXO Connect Enterprise',
        position: 'Head of Executive Operations',
        linkedin: 'https://linkedin.com/company/cxo-connect',
        city: 'Bengaluru',
        pincode: '560001',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
        role: 'admin',
        isMainAdmin: true,
        status: 'accepted',
        profileComplete: true,
        isEmailVerified: true
      },
      {
        name: 'Rajesh K. Singhania',
        email: 'rajesh.singhania@apextech.com',
        phone: '+91 98111 23456',
        company: 'Apex Technologies Ltd',
        position: 'Chief Executive Officer',
        linkedin: 'https://linkedin.com/in/rajesh-singhania-ceo',
        city: 'Mumbai',
        pincode: '400051',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
        role: 'member',
        isMainAdmin: false,
        status: 'accepted',
        profileComplete: true,
        isEmailVerified: true
      },
      {
        name: 'Dr. Sunita Deshmukh',
        email: 'sunita.d@zenithfin.com',
        phone: '+91 98222 34567',
        company: 'Zenith Financial Services',
        position: 'Chief Financial Officer',
        linkedin: 'https://linkedin.com/in/dr-sunita-deshmukh-cfo',
        city: 'Bengaluru',
        pincode: '560025',
        profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
        role: 'member',
        isMainAdmin: false,
        status: 'accepted',
        profileComplete: true,
        isEmailVerified: true
      },
      {
        name: 'Aditya Vardhan',
        email: 'aditya.v@nexusai.io',
        phone: '+91 99333 45678',
        company: 'Nexus AI Cloud',
        position: 'Chief Technology Officer',
        linkedin: 'https://linkedin.com/in/aditya-vardhan-cto',
        city: 'Hyderabad',
        pincode: '500081',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
        role: 'member',
        isMainAdmin: false,
        status: 'pending',
        profileComplete: true,
        isEmailVerified: true
      },
      {
        name: 'Meera Nair',
        email: 'meera.nair@omnicorp.com',
        phone: '+91 97444 56789',
        company: 'OmniCorp Consumer Global',
        position: 'Chief Human Resources Officer',
        linkedin: 'https://linkedin.com/in/meera-nair-chro',
        city: 'Delhi NCR',
        pincode: '122002',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
        role: 'member',
        isMainAdmin: false,
        status: 'pending',
        profileComplete: true,
        isEmailVerified: true
      },
      {
        name: 'Vikramaditya Mehta',
        email: 'vikram.mehta@axiscapital.com',
        phone: '+91 98333 11223',
        company: 'Axis Capital India',
        position: 'Executive Vice President',
        linkedin: 'https://linkedin.com/in/vikram-mehta',
        city: 'Mumbai',
        pincode: '400001',
        profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
        role: 'admin',
        isMainAdmin: false,
        status: 'accepted',
        profileComplete: true,
        isEmailVerified: true
      },
      {
        name: 'Neha Roy Chowdhury',
        email: 'neha.roy@deloitte.com',
        phone: '+91 98444 22334',
        company: 'Deloitte Strategy',
        position: 'Executive Director',
        linkedin: 'https://linkedin.com/in/neha-roy',
        city: 'Delhi NCR',
        pincode: '122002',
        profileImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80',
        role: 'admin',
        isMainAdmin: false,
        status: 'pending',
        profileComplete: true,
        isEmailVerified: true
      },
      {
        name: 'Karanvir Malhotra',
        email: 'karanvir.m@venturex.vc',
        phone: '+91 98555 33445',
        company: 'VentureX Partners',
        position: 'Managing Partner',
        linkedin: 'https://linkedin.com/in/karanvir-m',
        city: 'Bengaluru',
        pincode: '560001',
        profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
        role: 'member',
        isMainAdmin: false,
        status: 'rejected',
        profileComplete: true,
        isEmailVerified: true
      }
    ];

    const insertedUsers = await User.insertMany(users);
    console.log(`[Seed] ${insertedUsers.length} Users seeded.`);

    // 2. Seed Mentors
    console.log('[Seed] Seeding Mentors...');
    await Mentor.deleteMany({});
    const mentors = [
      {
        name: 'Arun M. Parameswaran',
        designation: 'Former President & MD',
        company: 'Salesforce India',
        expertise: ['Enterprise SaaS Scaling', 'Board Governance', 'GTM Strategy'],
        bio: 'Over 28 years driving exponential revenue expansions, executive talent grooming, and cross-border digital shifts.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
        linkedin: 'https://linkedin.com',
        availableForMentorship: true
      },
      {
        name: 'Nandita Gurjar',
        designation: 'Independent Director & Ex-Global CHRO',
        company: 'Infosys',
        expertise: ['Culture Transformation', 'Executive Compensation', 'Succession Planning'],
        bio: 'Senior board advisor orchestrating large-scale workforce evolution, board governance, and global HR leadership.',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
        linkedin: 'https://linkedin.com',
        availableForMentorship: true
      },
      {
        name: 'Raghavan Sreenivasan',
        designation: 'Managing Partner & CIO',
        company: 'Equitas Global Capital',
        expertise: ['M&A Valuation', 'Capital Allocation', 'Private Equity'],
        bio: 'Seasoned investment titan advising founders and CEOs on $2B+ structured buyouts and public debt offerings.',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
        linkedin: 'https://linkedin.com',
        availableForMentorship: true
      },
      {
        name: 'Pooja Bhattacharya',
        designation: 'Chief AI & Product Officer',
        company: 'HyperScale Labs',
        expertise: ['Generative AI Architecture', 'Enterprise Transformation', 'Product Velocity'],
        bio: 'Recognized global AI thought leader pioneering autonomous agent frameworks for Fortune 500 banks and retail.',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
        linkedin: 'https://linkedin.com',
        availableForMentorship: true
      }
    ];
    await Mentor.insertMany(mentors);
    console.log('[Seed] Mentors seeded.');

    // 3. Seed Committee Members
    console.log('[Seed] Seeding Committee...');
    await Committee.deleteMany({});
    const committee = [
      {
        name: 'Deepak Parekh',
        designation: 'Honorary Chairman',
        company: 'CXO Connect Advisory Council',
        category: 'Advisory Board',
        bio: 'Distinguished veteran shaping corporate governance and financial strategy frameworks for over 4 decades.',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
        linkedin: 'https://linkedin.com',
        order: 1
      },
      {
        name: 'Shobana Kamineni',
        designation: 'Executive Vice Chairperson',
        company: 'HealthTech Global',
        category: 'Advisory Board',
        bio: 'Pioneer of enterprise healthcare infrastructure and cross-industry leadership advisory.',
        image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80',
        linkedin: 'https://linkedin.com',
        order: 2
      },
      {
        name: 'Vikramaditya Mehta',
        designation: 'Chairperson - West Region',
        company: 'Vanguard Industrial Group',
        category: 'Executive Committee',
        bio: 'Leading strategic regional engagements and high-level CEO roundtables across Mumbai and Pune.',
        image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
        linkedin: 'https://linkedin.com',
        order: 3
      },
      {
        name: 'Priyanka Sen',
        designation: 'Chairperson - North Region',
        company: 'Horizon Energy Partners',
        category: 'Executive Committee',
        bio: 'Spearheading North India leadership conclaves, green energy roundtables, and policy discussions.',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
        linkedin: 'https://linkedin.com',
        order: 4
      }
    ];
    await Committee.insertMany(committee);
    console.log('[Seed] Committee seeded.');

    // 4. Seed Events
    console.log('[Seed] Seeding Events...');
    await Event.deleteMany({});
    const events = [
      {
        title: 'CXO Connect Annual Leadership Conclave 2026',
        speakerMentor: 'Arun M. Parameswaran',
        description: 'The premier national congregation of 250+ C-Suite leaders, Board Directors, and institutional investors exploring macroeconomic shifts, AI governance, and capital reallocation.',
        date: 'November 14, 2026',
        eventDate: new Date('2026-11-14T09:00:00Z'),
        time: '09:00 AM - 05:30 PM IST',
        venue: 'The Grand Ballroom, The Taj Mahal Palace',
        location: 'Colaba, Mumbai, India',
        category: 'Leadership Summit',
        type: 'UPCOMING',
        registrationUrl: 'https://cxoconnect.com/register/annual-conclave-2026',
        banner: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=80',
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
          'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&q=80',
          'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&q=80'
        ],
        speakers: [
          { name: 'Arun M. Parameswaran', position: 'Ex-MD', company: 'Salesforce India', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80' },
          { name: 'Sunita Deshmukh', position: 'CFO', company: 'Zenith Financial', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&q=80' }
        ],
        attendees: [insertedUsers[0]._id, insertedUsers[2]._id],
        status: 'UPCOMING'
      },
      {
        title: 'C-Suite Closed-Door Roundtable: Enterprise AI in Boardrooms',
        speakerMentor: 'Aditya Vardhan',
        description: 'An exclusive Chatham House Rule gathering for CEOs, CIOs, and CDOs on deploying sovereign AI infrastructure, data provenance, and enterprise risk controls.',
        date: 'December 04, 2026',
        eventDate: new Date('2026-12-04T16:00:00Z'),
        time: '04:00 PM - 07:30 PM IST',
        venue: 'The Oberoi',
        location: 'MG Road, Bengaluru, India',
        category: 'C-Suite Roundtable',
        type: 'UPCOMING',
        registrationUrl: 'https://cxoconnect.com/register/ai-roundtable-2026',
        banner: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600&q=80',
          'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&q=80'
        ],
        speakers: [
          { name: 'Aditya Vardhan', position: 'CTO', company: 'Nexus AI Cloud', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80' }
        ],
        attendees: [insertedUsers[0]._id, insertedUsers[3]._id],
        status: 'UPCOMING'
      },
      {
        title: 'Global CFO Masterclass: Navigating Currency & Credit Markets',
        speakerMentor: 'Raghavan Sreenivasan',
        description: 'A deep-dive financial masterclass detailing liquidity hedging, balance sheet fortification, and debt syndication amidst volatile interest-rate cycles.',
        date: 'January 18, 2027',
        eventDate: new Date('2027-01-18T14:00:00Z'),
        time: '02:00 PM - 06:00 PM IST',
        venue: 'ITC Maurya',
        location: 'Chanakyapuri, New Delhi, India',
        category: 'Executive Masterclass',
        type: 'UPCOMING',
        registrationUrl: 'https://cxoconnect.com/register/cfo-masterclass-2027',
        banner: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80',
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80'
        ],
        speakers: [
          { name: 'Raghavan Sreenivasan', position: 'Managing Partner', company: 'Equitas Global Capital', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80' }
        ],
        attendees: [insertedUsers[1]._id],
        status: 'UPCOMING'
      },
      {
        title: 'National Governance Summit 2025: Board Oversight & ESG',
        speakerMentor: 'Nandita Gurjar',
        description: 'Annual assembly on independent director liabilities, audit committee responsibilities, and executive remuneration alignment.',
        date: 'October 12, 2025',
        eventDate: new Date('2025-10-12T09:30:00Z'),
        time: '09:30 AM - 04:30 PM IST',
        venue: 'The Leela Palace',
        location: 'Bengaluru, India',
        category: 'Governance Conclave',
        type: 'PAST',
        registrationUrl: '',
        banner: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&q=80',
          'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&q=80'
        ],
        speakers: [
          { name: 'Nandita Gurjar', position: 'Board Member', company: 'Infosys', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80' }
        ],
        attendees: [insertedUsers[0]._id],
        status: 'PAST'
      },
      {
        title: 'APAC Executive Conclave 2025: Cross-Border Digital Expansion',
        speakerMentor: 'Marcus Chen',
        description: 'Singapore conclave addressing cross-border enterprise SaaS distribution, tax treaties, and Southeast Asian market penetration.',
        date: 'August 22, 2025',
        eventDate: new Date('2025-08-22T10:00:00Z'),
        time: '10:00 AM - 05:00 PM SGT',
        venue: 'Marina Bay Sands Convention Centre',
        location: 'Singapore',
        category: 'Global Conclave',
        type: 'PAST',
        registrationUrl: '',
        banner: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80',
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80'
        ],
        speakers: [],
        attendees: [],
        status: 'PAST'
      }
    ];
    await Event.insertMany(events);
    console.log('[Seed] Events seeded.');

    // 5. Seed Sponsors
    console.log('[Seed] Seeding Sponsors...');
    await Sponsor.deleteMany({});
    const sponsors = [
      {
        name: 'Tata Consultancy Services',
        tier: 'Strategic Partner',
        logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80',
        website: 'https://www.tcs.com',
        description: 'Global leader in IT services, consulting, and digital business solutions.',
        order: 1
      },
      {
        name: 'Goldman Sachs Global',
        tier: 'Platinum Sponsor',
        logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80',
        website: 'https://www.goldmansachs.com',
        description: 'Leading global investment banking, securities, and investment management firm.',
        order: 2
      },
      {
        name: 'Amazon Web Services',
        tier: 'Platinum Sponsor',
        logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80',
        website: 'https://aws.amazon.com',
        description: 'World-leading comprehensive cloud adoption platform powering enterprise AI.',
        order: 3
      },
      {
        name: 'McKinsey & Company',
        tier: 'Knowledge Partner',
        logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80',
        website: 'https://www.mckinsey.com',
        description: 'Global management consulting firm providing trusted counsel to leaders.',
        order: 4
      },
      {
        name: 'Bain & Company',
        tier: 'Gold Sponsor',
        logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80',
        website: 'https://www.bain.com',
        description: 'Management consultants solving pivotal strategic challenges for executive boards.',
        order: 5
      }
    ];
    await Sponsor.insertMany(sponsors);
    console.log('[Seed] Sponsors seeded.');

    // 6. Seed Chapters
    console.log('[Seed] Seeding Chapters...');
    await Chapter.deleteMany({});
    const chapters = [
      {
        city: 'Mumbai',
        country: 'India',
        leadName: 'Vikramaditya Mehta',
        leadEmail: 'mumbai@cxoconnect.com',
        activeMembersCount: 420,
        image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&q=80'
      },
      {
        city: 'Delhi NCR',
        country: 'India',
        leadName: 'Priyanka Sen',
        leadEmail: 'delhi@cxoconnect.com',
        activeMembersCount: 380,
        image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80'
      },
      {
        city: 'Bengaluru',
        country: 'India',
        leadName: 'Karthik Ramanathan',
        leadEmail: 'bengaluru@cxoconnect.com',
        activeMembersCount: 510,
        image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&q=80'
      },
      {
        city: 'Hyderabad',
        country: 'India',
        leadName: 'Ananya Reddy',
        leadEmail: 'hyderabad@cxoconnect.com',
        activeMembersCount: 290,
        image: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?w=600&q=80'
      },
      {
        city: 'Singapore & APAC',
        country: 'Singapore',
        leadName: 'Marcus Chen',
        leadEmail: 'singapore@cxoconnect.com',
        activeMembersCount: 215,
        image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80'
      },
      {
        city: 'Dubai & MENA',
        country: 'UAE',
        leadName: 'Tariq Al-Mansoor',
        leadEmail: 'dubai@cxoconnect.com',
        activeMembersCount: 195,
        image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80'
      }
    ];
    await Chapter.insertMany(chapters);
    console.log('[Seed] Chapters seeded.');

    // 7. Seed Questions
    console.log('[Seed] Seeding Questions...');
    await Question.deleteMany({});
    const questions = [
      {
        questionText: 'When facing unexpected macroeconomic volatility or supply disruptions, your primary executive focus is:',
        category: 'Strategic Leadership',
        options: [
          { text: 'Pivot business model rapidly towards high-margin digital streams', trait: 'Agile Disruptor', points: 20 },
          { text: 'Reinforce cash reserves, freeze discretionary opex, and optimize supply chain', trait: 'Operational Maestro', points: 15 },
          { text: 'Communicate transparently with all stakeholders and protect talent morale', trait: 'Empathetic Leader', points: 15 },
          { text: 'Seek M&A opportunities and distressed asset acquisitions', trait: 'Visionary Strategist', points: 20 }
        ],
        order: 1
      },
      {
        questionText: 'In evaluating AI enterprise transformation across your business units, you prioritize:',
        category: 'Technology & Innovation',
        options: [
          { text: 'Radical redesign of customer-facing touchpoints with generative agents', trait: 'Visionary Strategist', points: 20 },
          { text: 'Robust governance, enterprise data security, and compliance rails', trait: 'Operational Maestro', points: 15 },
          { text: 'Continuous upskilling programs ensuring seamless employee adoption', trait: 'Empathetic Leader', points: 15 },
          { text: 'Fast, scrappy internal POCs to outpace competitors within 90 days', trait: 'Agile Disruptor', points: 20 }
        ],
        order: 2
      },
      {
        questionText: 'Your board of directors demands a 35% growth acceleration while maintaining EBITDA margins. You:',
        category: 'Corporate Governance',
        options: [
          { text: 'Champion cross-border expansion and strategic joint ventures', trait: 'Visionary Strategist', points: 20 },
          { text: 'Automate manual operational workflows and negotiate supplier contracts', trait: 'Operational Maestro', points: 15 },
          { text: 'Incentivize top sales and product leaders through high-impact equity grants', trait: 'Empathetic Leader', points: 15 },
          { text: 'Launch a new direct-to-enterprise SaaS division targeting untapped verticals', trait: 'Agile Disruptor', points: 20 }
        ],
        order: 3
      },
      {
        questionText: 'When high-performing C-suite peers disagree fundamentally on corporate strategy, you:',
        category: 'Executive Alignment',
        options: [
          { text: 'Convene an offsite workshop to synthesize shared long-term objectives', trait: 'Empathetic Leader', points: 20 },
          { text: 'Present audited data, financial simulations, and unit economics to decide', trait: 'Operational Maestro', points: 15 },
          { text: 'Break the tie definitively using your conviction and executive mandate', trait: 'Visionary Strategist', points: 20 },
          { text: 'Run parallel small-scale experiments to let market validation decide', trait: 'Agile Disruptor', points: 20 }
        ],
        order: 4
      }
    ];
    await Question.insertMany(questions);
    console.log('[Seed] Questions seeded.');

    // 8. Seed Frameworks (Knowledge Hub)
    console.log('[Seed] Seeding Frameworks...');
    await Framework.deleteMany({});
    const frameworks = [
      {
        title: 'Enterprise AI Governance Blueprint 2026',
        category: 'Technology & AI Strategy',
        author: 'CXO Connect Technology Advisory Council',
        readTime: '18 min read',
        summary: 'A comprehensive operational framework detailing multi-agent orchestration guardrails, IP provenance validation, and regulatory compliance protocols for board-level oversight.',
        order: 1
      },
      {
        title: 'Capital Reallocation in High-Interest Cycles',
        category: 'Corporate Finance & M&A',
        author: 'CFO Strategic Working Group',
        readTime: '22 min read',
        summary: 'Strategic methodologies for CFOs navigating liquidity hedging, debt refinancing, and evaluating opportunistic bolt-on acquisitions during macroeconomic shifts.',
        order: 2
      },
      {
        title: 'Boardroom Succession & Leadership Continuity',
        category: 'Governance & People',
        author: 'Executive Nomination Committee',
        readTime: '15 min read',
        summary: 'Structured assessment models to identify, groom, and transition critical C-Suite and Independent Director roles while safeguarding corporate culture.',
        order: 3
      },
      {
        title: 'Cross-Border Supply Chain Fortification',
        category: 'Operations & Resilience',
        author: 'Global Supply Chain Council',
        readTime: '20 min read',
        summary: 'Dual-shoring playbooks, tier-2 vendor visibility architectures, and geopolitical risk mitigation roadmaps for multinational operating companies.',
        order: 4
      }
    ];
    await Framework.insertMany(frameworks);
    console.log('[Seed] Frameworks seeded.');

    // 9. Seed Certifications (Knowledge Hub)
    console.log('[Seed] Seeding Certifications...');
    await Certification.deleteMany({});
    const certifications = [
      {
        title: 'Certified Executive Board Director (CEBD)',
        issuer: 'CXO Connect Governance Academy',
        duration: '8 Weeks Intensive',
        level: 'Boardroom Track',
        modules: [
          'Fiduciary Duties & Audit Committee Stewardship',
          'Enterprise Cyber Risk Governance',
          'Executive Compensation & Shareholder Activism',
          'Crisis Management & Chatham House Offsites'
        ],
        order: 1
      },
      {
        title: 'Chief Technology Officer Strategy Master (CTO-SM)',
        issuer: 'CXO Connect Technology Council',
        duration: '6 Weeks',
        level: 'Enterprise Tech Track',
        modules: [
          'Enterprise Architecture for Sovereign AI',
          'Cloud Economics & FinOps Governance',
          'Zero-Trust Security for Executive Infrastructure',
          'Engineering Culture Transformation'
        ],
        order: 2
      },
      {
        title: 'Strategic CFO Capital Markets Fellowship',
        issuer: 'CXO Connect Finance Institute',
        duration: '10 Weeks',
        level: 'Executive Finance Track',
        modules: [
          'Cross-Border Debt Syndication & Hedging',
          'Private Equity Deal Structuring & Due Diligence',
          'Investor Relations & Earnings Call Messaging',
          'Automated Treasury Architecture'
        ],
        order: 3
      }
    ];
    await Certification.insertMany(certifications);
    console.log('[Seed] Certifications seeded.');

    console.log('\n=============================================');
    console.log(' CXO Connect Database Seeded Successfully!');
    console.log(' Admin accounts ready:');
    console.log('  1. theanvisharma@gmail.com (Super Admin)');
    console.log('  2. admin@cxoconnect.com (Main Admin)');
    console.log('=============================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
}

seedDatabase();
