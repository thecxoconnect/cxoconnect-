import mongoose from 'mongoose';

// Disable Mongoose command buffering so queries fail fast into catch blocks
// instead of hanging indefinitely during Vercel serverless execution
mongoose.set('bufferCommands', false);

let cachedConnection = null;
let connectionPromise = null;

/**
 * Optimized MongoDB Atlas connection for Vercel Serverless Functions
 */
export const connectDB = async () => {
  // 1. If connection is already open and ready, reuse it immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // 2. If a connection promise is already in progress, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }

  let remoteUri = process.env.MONGO_URI;
  if (!remoteUri) {
    console.error('[MongoDB Error] MONGO_URI environment variable is missing!');
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  // Clean password brackets if left accidentally: e.g. :<password>@ -> :password@
  remoteUri = remoteUri.replace(/:(?:<([^>]+)>)@/, ':$1@');

  connectionPromise = (async () => {
    try {
      console.log('[MongoDB] Connecting to MongoDB Atlas...');

      const conn = await mongoose.connect(remoteUri, {
        serverSelectionTimeoutMS: 8000, // 8s timeout gives Atlas enough time on cold starts
        connectTimeoutMS: 8000,
        maxPoolSize: 10,                 // Maintain up to 10 socket connections for serverless
      });

      console.log(`[MongoDB] Connected successfully to ${conn.connection.host}/${conn.connection.name}`);
      cachedConnection = conn;
      return conn;
    } catch (error) {
      console.error(`[MongoDB Connection Error] ${error.message}`);
      // Reset cached promise on failure so the next incoming request attempts a fresh connection
      connectionPromise = null;
      throw error;
    }
  })();

  return connectionPromise;
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Database connection disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`[MongoDB] Runtime error: ${err.message}`);
});

export default connectDB;