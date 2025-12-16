/**
 * WebSocket API for Konomi System
 * Provides real-time communication for Cube operations
 */

import { WebSocketServer } from 'ws';

export function createWebSocketAPI(server, konomi) {
  const wss = new WebSocketServer({ server });
  const clients = new Set();

  wss.on('connection', (ws, req) => {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    clients.add(ws);

    console.log(`🔌 WebSocket client connected: ${clientId}`);
    console.log(`   Total clients: ${clients.size}`);

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      clientId: clientId,
      timestamp: Date.now()
    }));

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        const { action, ...params } = message;

        let result;

        switch (action) {
          case 'ping':
            result = { pong: true, timestamp: Date.now() };
            break;

          case 'initialize':
            result = await handleInitialize(konomi, params);
            break;

          case 'process':
            result = await handleProcess(konomi, params);
            break;

          case 'connect':
            result = await handleConnect(konomi, params);
            break;

          case 'status':
            result = await handleStatus(konomi, params);
            break;

          case 'coordinate':
            result = await handleCoordinate(konomi, params);
            break;

          case 'stats':
            result = await handleStats(konomi, params);
            break;

          case 'broadcast':
            result = broadcast(clients, ws, params.message);
            break;

          default:
            throw new Error(`Unknown action: ${action}`);
        }

        ws.send(JSON.stringify({
          success: true,
          action,
          result,
          timestamp: Date.now()
        }));

      } catch (error) {
        ws.send(JSON.stringify({
          success: false,
          error: error.message,
          timestamp: Date.now()
        }));
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      console.log(`🔌 WebSocket client disconnected: ${clientId}`);
      console.log(`   Total clients: ${clients.size}`);
    });

    ws.on('error', (error) => {
      console.error(`❌ WebSocket error for ${clientId}:`, error.message);
    });
  });

  return wss;
}

/**
 * Initialize BlockArray or Cube
 */
async function handleInitialize(konomi, params) {
  const { type, id, dimensions, position } = params;

  if (type === 'blockarray') {
    const ba = konomi.createBlockArray(id, dimensions);
    return {
      type: 'blockarray',
      id,
      dimensions: ba.dims,
      metadata: ba.metadata
    };
  } else if (type === 'cube') {
    const cube = konomi.createCube(id, position);
    return {
      type: 'cube',
      id,
      position: cube.position,
      vertices: cube.constructor.VERTICES
    };
  } else {
    throw new Error(`Invalid type: ${type}. Must be 'blockarray' or 'cube'`);
  }
}

/**
 * Process text at vertex
 */
async function handleProcess(konomi, params) {
  const { cubeId, vertex, text, context } = params;

  const cube = konomi.getCube(cubeId);
  if (!cube) {
    throw new Error(`Cube '${cubeId}' not found`);
  }

  const result = await cube.processVertex(vertex, text, context);

  return {
    cubeId,
    vertex,
    state: cube.getState(vertex),
    result
  };
}

/**
 * Connect two vertices
 */
async function handleConnect(konomi, params) {
  const { cubeId, source, target, weight } = params;

  const cube = konomi.getCube(cubeId);
  if (!cube) {
    throw new Error(`Cube '${cubeId}' not found`);
  }

  cube.connect(source, target, weight || 1.0);

  return {
    cubeId,
    connection: { source, target, weight: weight || 1.0 },
    edges: cube.getAllEdges().length
  };
}

/**
 * Get status of cube or vertex
 */
async function handleStatus(konomi, params) {
  const { cubeId, vertex } = params;

  const cube = konomi.getCube(cubeId);
  if (!cube) {
    throw new Error(`Cube '${cubeId}' not found`);
  }

  if (vertex) {
    return {
      cubeId,
      vertex,
      state: cube.getState(vertex),
      data: cube.getData(vertex),
      connections: cube.getConnections(vertex)
    };
  } else {
    return {
      cubeId,
      states: cube.getState(),
      stats: cube.getStats(),
      edges: cube.getAllEdges()
    };
  }
}

/**
 * Coordinate task across all vertices
 */
async function handleCoordinate(konomi, params) {
  const { cubeId, task, context } = params;

  const cube = konomi.getCube(cubeId);
  if (!cube) {
    throw new Error(`Cube '${cubeId}' not found`);
  }

  const result = await cube.coordinate(task, context);

  return {
    cubeId,
    task,
    result,
    states: cube.getState()
  };
}

/**
 * Get system statistics
 */
async function handleStats(konomi, params) {
  const { cubeId, arrayId } = params;

  if (cubeId) {
    const cube = konomi.getCube(cubeId);
    if (!cube) {
      throw new Error(`Cube '${cubeId}' not found`);
    }
    return {
      type: 'cube',
      id: cubeId,
      stats: cube.getStats()
    };
  } else if (arrayId) {
    const ba = konomi.getBlockArray(arrayId);
    if (!ba) {
      throw new Error(`BlockArray '${arrayId}' not found`);
    }
    return {
      type: 'blockarray',
      id: arrayId,
      stats: ba.getStats()
    };
  } else {
    return {
      type: 'system',
      stats: konomi.getStats()
    };
  }
}

/**
 * Broadcast message to all clients except sender
 */
function broadcast(clients, sender, message) {
  let sent = 0;
  for (const client of clients) {
    if (client !== sender && client.readyState === 1) { // OPEN
      client.send(JSON.stringify({
        type: 'broadcast',
        message,
        timestamp: Date.now()
      }));
      sent++;
    }
  }
  return { broadcastSent: sent };
}
