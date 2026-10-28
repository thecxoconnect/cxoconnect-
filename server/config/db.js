import mongoose from 'mongoose';

/**
 * Robust MongoDB connection with automatic local fallback
 */
export const connectDB = async () => {
  const remoteUri = process.env.MONGO_URI;
  const localUri = process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/cxoconnect';

  if (remoteUri && !remoteUri.includes('127.0.0.1') && !remoteUri.includes('localhost')) {
    try {
      console.log('[MongoDB] Attempting remote connection to Atlas Cluster...');
      const conn = await mongoose.connect(remoteUri, {
        serverSelectionTimeoutMS: 5000
      });
      console.log(`[MongoDB] Connected successfully to Atlas: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (error) {
      console.warn(`[MongoDB Warning] Remote Atlas connection failed (${error.message}). Falling back to local MongoDB...`);
    }
  }

  try {
    const conn = await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 4000
    });
    console.log(`[MongoDB] Connected successfully to local instance: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Fatal Error] Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Database disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`[MongoDB] Runtime error: ${err.message}`);
});

export default connectDB;
