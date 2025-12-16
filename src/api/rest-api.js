/**
 * REST API for Konomi System
 * Provides HTTP endpoints for BlockArray and Cube operations
 */

import express from 'express';

export function createRESTAPI(konomi) {
  const router = express.Router();

  // Health check
  router.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      initialized: konomi.initialized,
      uptime: konomi.getStats().uptimeFormatted
    });
  });

  // Get system statistics
  router.get('/stats', (req, res) => {
    res.json({
      success: true,
      stats: konomi.getStats()
    });
  });

  // ========== BlockArray Endpoints ==========

  // Create BlockArray template
  router.post('/template/create', async (req, res) => {
    try {
      const { id, dimensions } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Missing required field: id'
        });
      }

      const ba = konomi.createBlockArray(id, dimensions);

      res.json({
        success: true,
        templateId: id,
        dimensions: ba.dims,
        metadata: ba.metadata
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Create BlockArray instance
  router.post('/instance/create', async (req, res) => {
    try {
      const { templateId, instanceId, dimensions } = req.body;

      if (!instanceId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required field: instanceId'
        });
      }

      let dims = dimensions;

      // If templateId provided, use template dimensions
      if (templateId) {
        const template = konomi.getBlockArray(templateId);
        if (!template) {
          return res.status(404).json({
            success: false,
            error: `Template '${templateId}' not found`
          });
        }
        dims = template.dims;
      }

      const instance = konomi.createBlockArray(instanceId, dims);

      res.json({
        success: true,
        instanceId: instanceId,
        dimensions: instance.dims,
        metadata: instance.metadata
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get value at coordinate
  router.get('/value', (req, res) => {
    try {
      const { arrayId, x, y, z } = req.query;

      if (!arrayId || x === undefined || y === undefined || z === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters: arrayId, x, y, z'
        });
      }

      const ba = konomi.getBlockArray(arrayId);
      if (!ba) {
        return res.status(404).json({
          success: false,
          error: `BlockArray '${arrayId}' not found`
        });
      }

      const value = ba.get(parseInt(x), parseInt(y), parseInt(z));

      res.json({
        success: true,
        arrayId,
        position: [parseInt(x), parseInt(y), parseInt(z)],
        value
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Set value at coordinate
  router.post('/value', (req, res) => {
    try {
      const { arrayId, x, y, z, value } = req.body;

      if (!arrayId || x === undefined || y === undefined || z === undefined || value === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: arrayId, x, y, z, value'
        });
      }

      const ba = konomi.getBlockArray(arrayId);
      if (!ba) {
        return res.status(404).json({
          success: false,
          error: `BlockArray '${arrayId}' not found`
        });
      }

      ba.set(parseInt(x), parseInt(y), parseInt(z), value);

      res.json({
        success: true,
        arrayId,
        position: [parseInt(x), parseInt(y), parseInt(z)],
        value,
        metadata: ba.metadata
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get BlockArray info
  router.get('/array/:id', (req, res) => {
    try {
      const { id } = req.params;
      const ba = konomi.getBlockArray(id);

      if (!ba) {
        return res.status(404).json({
          success: false,
          error: `BlockArray '${id}' not found`
        });
      }

      res.json({
        success: true,
        arrayId: id,
        dimensions: ba.dims,
        stats: ba.getStats()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // LLM process at coordinate
  router.post('/llm/process', async (req, res) => {
    try {
      const { arrayId, x, y, z, text } = req.body;

      if (!arrayId || x === undefined || y === undefined || z === undefined || !text) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: arrayId, x, y, z, text'
        });
      }

      const ba = konomi.getBlockArray(arrayId);
      if (!ba) {
        return res.status(404).json({
          success: false,
          error: `BlockArray '${arrayId}' not found`
        });
      }

      // Ensure LLM exists at coordinate
      if (!ba.getLLM(x, y, z)) {
        ba.placeLLM(x, y, z);
      }

      const result = await ba.processAt(parseInt(x), parseInt(y), parseInt(z), text);

      res.json({
        success: true,
        arrayId,
        position: [parseInt(x), parseInt(y), parseInt(z)],
        result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Face interlock operation
  router.post('/llm/interlock', async (req, res) => {
    try {
      const { arrayId, face } = req.body;

      if (!arrayId || !face) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: arrayId, face'
        });
      }

      const processed = await konomi.faceInterlock(arrayId, face);

      res.json({
        success: true,
        arrayId,
        face,
        processed
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ========== Cube Endpoints ==========

  // Create Cube
  router.post('/cube/create', (req, res) => {
    try {
      const { id, position } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Missing required field: id'
        });
      }

      const cube = konomi.createCube(id, position);

      res.json({
        success: true,
        cubeId: id,
        position: cube.position,
        vertices: cube.constructor.VERTICES,
        states: cube.getState()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get Cube info
  router.get('/cube/:id', (req, res) => {
    try {
      const { id } = req.params;
      const cube = konomi.getCube(id);

      if (!cube) {
        return res.status(404).json({
          success: false,
          error: `Cube '${id}' not found`
        });
      }

      res.json({
        success: true,
        cubeId: id,
        position: cube.position,
        states: cube.getState(),
        stats: cube.getStats(),
        edges: cube.getAllEdges()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Process at vertex
  router.post('/cube/:id/process', async (req, res) => {
    try {
      const { id } = req.params;
      const { vertex, text, context } = req.body;

      if (!vertex || !text) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: vertex, text'
        });
      }

      const cube = konomi.getCube(id);
      if (!cube) {
        return res.status(404).json({
          success: false,
          error: `Cube '${id}' not found`
        });
      }

      const result = await cube.processVertex(vertex, text, context);

      res.json({
        success: true,
        cubeId: id,
        vertex,
        result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Coordinate task
  router.post('/cube/:id/coordinate', async (req, res) => {
    try {
      const { id } = req.params;
      const { task, context } = req.body;

      if (!task) {
        return res.status(400).json({
          success: false,
          error: 'Missing required field: task'
        });
      }

      const cube = konomi.getCube(id);
      if (!cube) {
        return res.status(404).json({
          success: false,
          error: `Cube '${id}' not found`
        });
      }

      const result = await cube.coordinate(task, context);

      res.json({
        success: true,
        cubeId: id,
        result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Connect vertices
  router.post('/cube/:id/connect', (req, res) => {
    try {
      const { id } = req.params;
      const { source, target, weight } = req.body;

      if (!source || !target) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: source, target'
        });
      }

      const cube = konomi.getCube(id);
      if (!cube) {
        return res.status(404).json({
          success: false,
          error: `Cube '${id}' not found`
        });
      }

      cube.connect(source, target, weight);

      res.json({
        success: true,
        cubeId: id,
        connection: { source, target, weight: weight || 1.0 }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // List all resources
  router.get('/list', (req, res) => {
    res.json({
      success: true,
      blockArrays: konomi.listBlockArrays(),
      cubes: konomi.listCubes(),
      llms: konomi.listLLMs()
    });
  });

  return router;
}
