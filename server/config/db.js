import mongoose from 'mongoose';

// Disable Mongoose command buffering so queries fail fast into catch blocks
// instead of hanging for 10 seconds and timing out Vercel serverless execution
mongoose.set('bufferCommands', false);

let cachedConnection = null;
let connectionPromise = null;
let lastFailureTime = 0;
const COOLDOWN_MS = 30000; // 30s cooldown after connection failure before retrying

/**
 * Robust MongoDB connection with serverless connection pooling & caching
 */
export const connectDB = async () => {
  // If connection is already established, reuse it immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If a connection attempt is currently in progress, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }

  // If recently failed, honor cooldown so requests return fallback data immediately
  if (Date.now() - lastFailureTime < COOLDOWN_MS) {
    return null;
  }

  let remoteUri = process.env.MONGO_URI;
  if (remoteUri) {
    // Automatically strip any accidentally left angle brackets in passwords: e.g. :<password>@ -> :password@
    remoteUri = remoteUri.replace(/:(?:<([^>]+)>)@/, ':$1@');
  }

  const localUri = process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/cxoconnect';

  connectionPromise = (async () => {
    // 1. Try remote MongoDB (e.g. MongoDB Atlas)
    if (remoteUri && !remoteUri.includes('127.0.0.1') && !remoteUri.includes('localhost')) {
      try {
        console.log('[MongoDB] Connecting to remote cluster...');
        const conn = await mongoose.connect(remoteUri, {
          serverSelectionTimeoutMS: 2500,
          connectTimeoutMS: 2500
        });
        console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
        cachedConnection = conn;
        lastFailureTime = 0;
        return conn;
      } catch (error) {
        console.warn(`[MongoDB Warning] Remote connection failed (${error.message}).`);
        lastFailureTime = Date.now();
      }
    }

    // 2. Try local MongoDB (only in local development or if explicitly configured)
    if (!process.env.VERCEL) {
      try {
        console.log('[MongoDB] Connecting to local MongoDB...');
        const conn = await mongoose.connect(localUri, {
          serverSelectionTimeoutMS: 2000,
          connectTimeoutMS: 2000
        });
        console.log(`[MongoDB] Connected to local instance: ${conn.connection.host}/${conn.connection.name}`);
        cachedConnection = conn;
        lastFailureTime = 0;
        return conn;
      } catch (error) {
        console.warn(`[MongoDB Warning] Local instance connection failed (${error.message}).`);
        lastFailureTime = Date.now();
      }
    }

    console.warn('[MongoDB Notice] Operating in fallback mode. Database queries will return resilient curated structures.');
    lastFailureTime = Date.now();
    return null;
  })().finally(() => {
    connectionPromise = null;
  });

  return connectionPromise;
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Database disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`[MongoDB] Runtime error: ${err.message}`);
});

export default connectDB;

