import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.warn('[DB WARNING] MONGO_URI is not defined. Server will run in degraded mode (offline local fallback enabled).');
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[DB SUCCESS] MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.error(`[DB ERROR] MongoDB Connection Failed: ${error.message}`);
    // Do not crash server so health checks and static endpoints can still respond
    return false;
  }
};

export const isDbConnected = () => {
  return isConnected && mongoose.connection.readyState === 1;
};
