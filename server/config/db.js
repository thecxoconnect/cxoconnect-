import mongoose from 'mongoose';

mongoose.set('bufferCommands', false);
let connectionPromise = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connectionPromise) return connectionPromise;

  const uri = process.env.MONGO_URI || 'mongodb+srv://thecxoconnect_db_user:cxoconnect2026@cluster0.vkg73ib.mongodb.net/cxoconnect?retryWrites=true&w=majority';

  connectionPromise = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
    maxPoolSize: 10
  }).catch(err => {
    connectionPromise = null;
    throw err;
  });

  return connectionPromise;
};

export default connectDB;
