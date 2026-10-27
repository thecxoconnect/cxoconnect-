import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const seedData = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cxo_connect';
  console.log(`[Seed] Connecting to ${mongoUri}...`);
  await mongoose.connect(mongoUri);

  console.log('[Seed] Seeding initial members and administrators for The CXO Network...');

  // 1. Super Admin: theanvisharma@gmail.com
  let superAdmin = await User.findOne({ email: 'theanvisharma@gmail.com' });
  if (!superAdmin) {
    superAdmin = new User({ email: 'theanvisharma@gmail.com' });
  }
  superAdmin.name = 'Anvi Sharma';
  superAdmin.designation = 'Managing Director & Founder';
  superAdmin.position = 'Managing Director & Founder';
  superAdmin.company = 'CXO Connect Global / HRSG';
  superAdmin.phone = '+91 9820012345';
  superAdmin.city = 'Mumbai';
  superAdmin.pincode = '400001';
  superAdmin.role = 'admin';
  superAdmin.isMainAdmin = true;
  superAdmin.status = 'approved';
  superAdmin.profileComplete = true;
  superAdmin.isEmailVerified = true;
  superAdmin.password = 'AdminPass2026!'; // Will be hashed by pre-save
  await superAdmin.save();
  console.log('  ✓ Super Admin seeded: theanvisharma@gmail.com / AdminPass2026!');

  // 2. HRSG Admin: admin@myhrsg.org
  let hrsgAdmin = await User.findOne({ email: 'admin@myhrsg.org' });
  if (!hrsgAdmin) {
    hrsgAdmin = new User({ email: 'admin@myhrsg.org' });
  }
  hrsgAdmin.name = 'HRSG Executive Secretariat';
  hrsgAdmin.designation = 'Director of Membership Operations';
  hrsgAdmin.position = 'Director of Membership Operations';
  hrsgAdmin.company = 'HRSG Global';
  hrsgAdmin.phone = '+91 9819988776';
  hrsgAdmin.city = 'New Delhi';
  hrsgAdmin.pincode = '110001';
  hrsgAdmin.role = 'admin';
  hrsgAdmin.isMainAdmin = true;
  hrsgAdmin.status = 'approved';
  hrsgAdmin.profileComplete = true;
  hrsgAdmin.isEmailVerified = true;
  hrsgAdmin.password = 'AdminPass2026!';
  await hrsgAdmin.save();
  console.log('  ✓ HRSG Admin seeded: admin@myhrsg.org / AdminPass2026!');

  // 3. Active Member: rajesh.mehta@tata.com
  let member1 = await User.findOne({ email: 'rajesh.mehta@tata.com' });
  if (!member1) {
    member1 = new User({ email: 'rajesh.mehta@tata.com' });
  }
  member1.name = 'Rajesh Mehta';
  member1.designation = 'Chief Digital Officer';
  member1.position = 'Chief Digital Officer';
  member1.company = 'Tata Sons';
  member1.phone = '+91 9833344556';
  member1.city = 'Mumbai';
  member1.linkedin = 'https://linkedin.com/in/rajesh-mehta-cxo';
  member1.areasOfInterest = ['AI & Tech Transformation', 'Cross-Border Expansion'];
  member1.role = 'member';
  member1.status = 'approved';
  member1.profileComplete = true;
  member1.isEmailVerified = true;
  member1.password = 'MemberPass2026!';
  member1.approvedAt = new Date(Date.now() - 5 * 86400000);
  await member1.save();
  console.log('  ✓ Active Member seeded: rajesh.mehta@tata.com / MemberPass2026!');

  // 4. Active Member: priya.nair@infosys.com
  let member2 = await User.findOne({ email: 'priya.nair@infosys.com' });
  if (!member2) {
    member2 = new User({ email: 'priya.nair@infosys.com' });
  }
  member2.name = 'Priya Nair';
  member2.designation = 'Chief Human Resources Officer';
  member2.position = 'Chief Human Resources Officer';
  member2.company = 'Infosys Limited';
  member2.phone = '+91 9845011223';
  member2.city = 'Bengaluru';
  member2.areasOfInterest = ['Future of Work & Talent', 'C-Suite Strategy & Governance'];
  member2.role = 'member';
  member2.status = 'approved';
  member2.profileComplete = true;
  member2.isEmailVerified = true;
  member2.password = 'MemberPass2026!';
  member2.approvedAt = new Date(Date.now() - 3 * 86400000);
  await member2.save();
  console.log('  ✓ Active Member seeded: priya.nair@infosys.com / MemberPass2026!');

  // 5. Pending Applicant: vikram.aditya@reliance.com
  let applicant1 = await User.findOne({ email: 'vikram.aditya@reliance.com' });
  if (!applicant1) {
    applicant1 = new User({ email: 'vikram.aditya@reliance.com' });
  }
  applicant1.name = 'Vikram Aditya';
  applicant1.designation = 'President & Chief Financial Officer';
  applicant1.position = 'President & Chief Financial Officer';
  applicant1.company = 'Reliance Industries';
  applicant1.linkedin = 'https://linkedin.com/in/vikram-aditya';
  applicant1.areasOfInterest = ['C-Suite Strategy & Governance', 'ESG & Sustainability'];
  applicant1.role = 'member';
  applicant1.status = 'pending';
  applicant1.termsAccepted = true;
  applicant1.appliedAt = new Date(Date.now() - 2 * 3600000);
  await applicant1.save();
  console.log('  ✓ Pending Applicant seeded: vikram.aditya@reliance.com');

  // 6. Pending Applicant: sanjana.kapoor@hdfcbank.com
  let applicant2 = await User.findOne({ email: 'sanjana.kapoor@hdfcbank.com' });
  if (!applicant2) {
    applicant2 = new User({ email: 'sanjana.kapoor@hdfcbank.com' });
  }
  applicant2.name = 'Sanjana Kapoor';
  applicant2.designation = 'Chief Technology Officer';
  applicant2.position = 'Chief Technology Officer';
  applicant2.company = 'HDFC Bank';
  applicant2.linkedin = 'https://linkedin.com/in/sanjana-kapoor';
  applicant2.areasOfInterest = ['AI & Tech Transformation'];
  applicant2.role = 'member';
  applicant2.status = 'pending';
  applicant2.termsAccepted = true;
  applicant2.appliedAt = new Date(Date.now() - 12 * 3600000);
  await applicant2.save();
  console.log('  ✓ Pending Applicant seeded: sanjana.kapoor@hdfcbank.com');

  // 7. Declined Applicant: test.declined@corp.com
  let declined = await User.findOne({ email: 'test.declined@corp.com' });
  if (!declined) {
    declined = new User({ email: 'test.declined@corp.com' });
  }
  declined.name = 'Dev Sharma';
  declined.designation = 'Junior Manager';
  declined.position = 'Junior Manager';
  declined.company = 'Startup Co';
  declined.status = 'declined';
  declined.role = 'member';
  await declined.save();
  console.log('  ✓ Declined Record seeded: test.declined@corp.com');

  console.log('[Seed] Seeding completed successfully!');
  await mongoose.connection.close();
};

seedData().catch((err) => {
  console.error('[Seed Error]', err);
  process.exit(1);
});
