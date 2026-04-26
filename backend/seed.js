/**
 * seed.js — CRM Database Seeder
 * =====================================================
 * Creates 3 test users (Admin, Manager, Agent) and
 * 10 sample leads assigned across all roles.
 *
 * Run with:   node seed.js
 * Clear data: node seed.js --clear
 * =====================================================
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Lead = require('./models/Lead');
const Activity = require('./models/Activity');

dotenv.config();

const seed = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/crm_db';
    console.log('\n================================================');
    console.log('🌱 CRM DATABASE SEEDER');
    console.log('================================================');
    console.log(`📦 Connecting to: ${mongoUri}`);

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully!\n');

    // If --clear flag is passed, wipe everything first
    if (process.argv.includes('--clear')) {
      console.log('🗑️  Clearing existing data...');
      await User.deleteMany({});
      await Lead.deleteMany({});
      await Activity.deleteMany({});
      console.log('✅ All collections cleared.\n');
    }

    // ============================================================
    // STEP 1: Create / Update Test Users
    // ============================================================
    console.log('👤 Seeding Users...');

    const usersToSeed = [
      { name: 'Alex Carter',   email: 'admin@example.com',   password: '123456', role: 'Admin',   title: 'System Administrator' },
      { name: 'Sarah Johnson', email: 'manager@example.com', password: '123456', role: 'Manager', title: 'Sales Team Lead' },
      { name: 'Raj Patel',     email: 'agent@example.com',   password: '123456', role: 'Agent',   title: 'Sales Representative' },
    ];

    const createdUsers = {};

    for (const userData of usersToSeed) {
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`   ↪ User "${userData.name}" (${userData.role}) already exists — skipping.`);
        createdUsers[userData.role] = existing;
      } else {
        const user = await User.create(userData);
        createdUsers[userData.role] = user;
        console.log(`   ✅ Created ${userData.role}: ${userData.name} (${userData.email})`);
      }
    }

    // ============================================================
    // STEP 2: Create 10 Sample Leads
    // ============================================================
    console.log('\n📋 Seeding Leads...');

    const sampleLeads = [
      {
        name: 'Michael Brown',
        email: 'michael.brown@techcorp.com',
        phone: '+1-555-0101',
        company: 'TechCorp Solutions',
        status: 'New',
        value: 15000,
        user: createdUsers['Admin']._id,
        assignedTo: createdUsers['Agent']._id,
        notes: 'Interested in enterprise plan. Follow up next Monday.',
      },
      {
        name: 'Emily Davis',
        email: 'emily.davis@financeplus.com',
        phone: '+1-555-0102',
        company: 'FinancePlus Inc.',
        status: 'Contacted',
        value: 8500,
        user: createdUsers['Manager']._id,
        assignedTo: createdUsers['Agent']._id,
        notes: 'Had initial call. Sending proposal.',
      },
      {
        name: 'James Wilson',
        email: 'james.wilson@retailgiant.com',
        phone: '+1-555-0103',
        company: 'RetailGiant Ltd.',
        status: 'Qualified',
        value: 32000,
        user: createdUsers['Admin']._id,
        assignedTo: createdUsers['Agent']._id,
        notes: 'Qualified after demo. Budget confirmed.',
      },
      {
        name: 'Lisa Martinez',
        email: 'lisa.m@healthcareplus.org',
        phone: '+1-555-0104',
        company: 'HealthCare Plus',
        status: 'Closed',
        value: 45000,
        user: createdUsers['Manager']._id,
        assignedTo: null,
        notes: 'Deal closed! Signed 12-month contract.',
      },
      {
        name: 'Robert Taylor',
        email: 'r.taylor@buildingco.com',
        phone: '+1-555-0105',
        company: 'BuildingCo Contractors',
        status: 'Lost',
        value: 12000,
        user: createdUsers['Admin']._id,
        assignedTo: createdUsers['Agent']._id,
        notes: 'Went with competitor. Price was the deciding factor.',
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@edutech.in',
        phone: '+91-98765-43210',
        company: 'EduTech India Pvt. Ltd.',
        status: 'New',
        value: 7200,
        user: createdUsers['Manager']._id,
        assignedTo: null,
        notes: 'Inbound lead via website. Schedule discovery call.',
      },
      {
        name: 'Daniel Lee',
        email: 'daniel.lee@startupx.io',
        phone: '+1-555-0107',
        company: 'StartupX Ventures',
        status: 'Contacted',
        value: 5000,
        user: createdUsers['Admin']._id,
        assignedTo: createdUsers['Agent']._id,
        notes: 'Early-stage startup. Growth potential high.',
      },
      {
        name: 'Amara Okonkwo',
        email: 'a.okonkwo@globalimports.ng',
        phone: '+234-80-1234-5678',
        company: 'Global Imports Co.',
        status: 'Qualified',
        value: 22500,
        user: createdUsers['Manager']._id,
        assignedTo: null,
        notes: 'Wants custom integration. Technical review pending.',
      },
      {
        name: 'Sophie Chen',
        email: 'sophie.chen@fashionbrand.com',
        phone: '+1-555-0109',
        company: 'LuxeFashion Brand',
        status: 'New',
        value: 9800,
        user: createdUsers['Admin']._id,
        assignedTo: createdUsers['Agent']._id,
        notes: 'Referred by Michael Brown. High priority.',
      },
      {
        name: 'Marcus Thompson',
        email: 'm.thompson@logisticsco.com',
        phone: '+1-555-0110',
        company: 'ThompsonLogistics LLC',
        status: 'Contacted',
        value: 18000,
        user: createdUsers['Manager']._id,
        assignedTo: createdUsers['Agent']._id,
        notes: 'Looking to automate their sales pipeline.',
      },
    ];

    let leadsCreated = 0;
    for (const leadData of sampleLeads) {
      const existing = await Lead.findOne({ email: leadData.email });
      if (existing) {
        console.log(`   ↪ Lead "${leadData.name}" already exists — skipping.`);
      } else {
        await Lead.create(leadData);
        leadsCreated++;
        console.log(`   ✅ Lead #${leadsCreated}: ${leadData.name} (${leadData.company}) — Status: ${leadData.status}`);
      }
    }

    // ============================================================
    // STEP 3: Seed Initial Activity Log
    // ============================================================
    console.log('\n📝 Seeding Activity Logs...');

    const activityCount = await Activity.countDocuments();
    if (activityCount === 0) {
      await Activity.create([
        {
          user: createdUsers['Admin']._id,
          type: 'Login',
          description: 'Alex Carter (Admin) logged into the CRM system',
        },
        {
          user: createdUsers['Manager']._id,
          type: 'Lead Created',
          description: 'Sarah Johnson created new lead: Lisa Martinez',
          lead: (await Lead.findOne({ email: 'lisa.m@healthcareplus.org' }))?._id,
        },
        {
          user: createdUsers['Agent']._id,
          type: 'Status Changed',
          description: 'Raj Patel changed status of "Michael Brown" from New → Contacted',
          lead: (await Lead.findOne({ email: 'michael.brown@techcorp.com' }))?._id,
        },
      ]);
      console.log('   ✅ Created 3 sample activity log entries.');
    } else {
      console.log(`   ↪ Activity logs already exist (${activityCount} entries) — skipping.`);
    }

    // ============================================================
    // SUMMARY
    // ============================================================
    console.log('\n================================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('================================================');
    console.log('\n📌 TEST LOGIN CREDENTIALS:');
    console.log('   Role    | Email               | Password');
    console.log('   --------|---------------------|----------');
    console.log('   Admin   | admin@example.com   | 123456');
    console.log('   Manager | manager@example.com | 123456');
    console.log('   Agent   | agent@example.com   | 123456');
    console.log('\n📊 DATA SEEDED:');
    console.log(`   Users: 3 (Admin, Manager, Agent)`);
    console.log(`   Leads: ${leadsCreated} new leads created`);
    console.log('   Activities: Sample login/action logs');
    console.log('\n🚀 You can now run: npm start (in /backend)');
    console.log('================================================\n');

    process.exit(0);
  } catch (err) {
    console.error(`\n❌ SEEDING ERROR: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }
};

seed();
