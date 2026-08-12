import dotenv from 'dotenv';
dotenv.config();

// Handle serverless / Vercel read-only filesystem: /tmp is the only writable directory on Vercel
const defaultDbUrl = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
  ? 'file:/tmp/local.db'
  : 'file:local.db';

const config = {
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  databaseUrl: process.env.DATABASE_URL || defaultDbUrl,
  databaseAuthToken: process.env.DATABASE_AUTH_TOKEN || '',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiry: process.env.JWT_EXPIRY || '7d',
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

export default config;
