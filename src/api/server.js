#!/usr/bin/env node

/**
 * Konomi System API Server
 * Combines REST and WebSocket APIs
 */

import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { KonomiSystem } from '../core/konomi-system.js';
import { createRESTAPI } from './rest-api.js';
import { createWebSocketAPI } from './websocket-api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '../..');

// Configuration
const PORT = process.env.PORT || 3001;
const WS_PORT = process.env.WS_PORT || 3002;
const HOST = process.env.HOST || '0.0.0.0';

async function startServer() {
  console.log('🧬 Konomi System API Server');
  console.log('================================================\n');

  // Initialize Konomi System
  const konomi = new KonomiSystem({
    logLevel: process.env.LOG_LEVEL || 'info',
    cpuCores: parseInt(process.env.CPU_CORES || '4'),
    maxCubes: parseInt(process.env.MAX_CUBES || '1000000')
  });

  await konomi.initialize();

  // Create Express app
  const app = express();

  // Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // CORS
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Request logging
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    });
    next();
  });

  // Mount REST API
  app.use('/api', createRESTAPI(konomi));

  // Serve static files (docs for GitHub Pages preview)
  app.use('/docs', express.static(path.join(PROJECT_ROOT, 'docs')));
  app.use('/dist', express.static(path.join(PROJECT_ROOT, 'dist')));

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      name: 'Konomi System API',
      version: '1.0.0',
      endpoints: {
        rest: `http://${HOST}:${PORT}/api`,
        websocket: `ws://${HOST}:${WS_PORT}`,
        health: `http://${HOST}:${PORT}/api/health`,
        stats: `http://${HOST}:${PORT}/api/stats`,
        docs: `http://${HOST}:${PORT}/docs`
      },
      stats: konomi.getStats()
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'Not found',
      path: req.url
    });
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  });

  // Create HTTP server for REST API
  const restServer = http.createServer(app);

  restServer.listen(PORT, HOST, () => {
    console.log(`📡 REST API: http://${HOST}:${PORT}`);
    console.log(`   Health:   http://${HOST}:${PORT}/api/health`);
    console.log(`   Stats:    http://${HOST}:${PORT}/api/stats`);
  });

  // Create separate HTTP server for WebSocket
  const wsApp = express();
  const wsServer = http.createServer(wsApp);

  // Initialize WebSocket API
  const wss = createWebSocketAPI(wsServer, konomi);

  wsServer.listen(WS_PORT, HOST, () => {
    console.log(`🔌 WebSocket: ws://${HOST}:${WS_PORT}`);
  });

  console.log('\n✅ Server ready!\n');

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);

    // Close servers
    restServer.close(() => {
      console.log('   REST server closed');
    });

    wsServer.close(() => {
      console.log('   WebSocket server closed');
    });

    // Shutdown Konomi System
    await konomi.shutdown();

    console.log('✅ Shutdown complete');
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  return { restServer, wsServer, konomi };
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

export { startServer };
