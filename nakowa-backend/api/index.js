/**
 * Vercel Serverless Entry Point for NestJS
 * 
 * This file exports the built NestJS application for Vercel serverless functions.
 * The application is built to dist/src/main.js and we export it as a handler.
 */

// Import the compiled NestJS bootstrap
const { bootstrap } = require('../dist/src/main');

// Cache the app instance
let cachedApp = null;

module.exports = async (req, res) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || 'https://nakowa-three.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-cron-secret');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }

  try {
    // Get or create the NestJS app instance (with caching)
    if (!cachedApp) {
      console.log('🚀 Initializing NestJS app...');
      cachedApp = await bootstrap();
    }
    
    // Get the underlying Express instance
    const server = cachedApp.getHttpServer();
    
    // Handle the request
    return server(req, res);
  } catch (error) {
    console.error('❌ Error handling request:', error);
    return res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message,
    });
  }
};

