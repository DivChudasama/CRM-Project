const mongoose = require('mongoose');

const connectToDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env file');
    }
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ [DATABASE] Connected to MongoDB: ' + conn.connection.name);
  } catch (err) {
    console.error(`\n❌ DATABASE CONNECTION ERROR: ${err.message}`);
    console.log('Ensure MongoDB service is running or IP is whitelisted.');
    throw err;
  }
};

module.exports = connectToDB;
