/**
 * Vercel Serverless Entry Point for NestJS
 * 
 * This file exports the built NestJS application for Vercel serverless functions.
 * The application is built to dist/src/main.js and we export it as a handler.
 */

// Import the compiled NestJS bootstrap
const { bootstrap } = require('../dist/src/main');

module.exports = async (req, res) => {
  // Get or create the NestJS app instance
  const app = await bootstrap();
  
  // Get the underlying Express instance
  const server = app.getHttpServer();
  
  // Handle the request
  return server(req, res);
};
