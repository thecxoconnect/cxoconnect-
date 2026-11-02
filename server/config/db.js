import mongoose from 'mongoose';

// Disable command buffering so queries fail fast into catch blocks rather than hanging serverless execution
mongoose.set('bufferCommands', false);

let connectionPromise = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const uri = process.env.MONGO_URI || 'mongodb+srv://thecxoconnect_db_user:cxoconnect2026@cluster0.vkg73ib.mongodb.net/cxoconnect?retryWrites=true&w=majority';

  connectionPromise = (async () => {
    try {
      console.log('[MongoDB] Connecting to MongoDB Atlas...');
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000, // 8-second timeout for serverless cold starts
        connectTimeoutMS: 8000,
        maxPoolSize: 10
      });
      console.log(`[MongoDB] Connected successfully to ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (error) {
      console.error(`[MongoDB Connection Error] ${error.message}`);
      connectionPromise = null; // Reset promise on error to allow clean retries
      throw error;
    }
  })();

  return connectionPromise;
};

export default connectDB;
