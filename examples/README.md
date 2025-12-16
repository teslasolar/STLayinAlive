# Examples

Example code demonstrating STLayinAlive features.

## Files

### `tag-provider-demo.js`
Comprehensive demonstration of the SCADA-style tag provider system.

**Run it:**
```bash
node examples/tag-provider-demo.js
```

**Features demonstrated:**
- Basic tag registration and updates
- Tag groups for organizing parameters
- Integration with 3D models
- Range validation and alarms
- History tracking
- Export/import for persistence

### `custom-model.js`
Step-by-step guide to creating custom parametric models.

**Run it:**
```bash
node examples/custom-model.js
```

**Includes:**
- SimpleBox: Basic box with cavity
- SimpleGear: Simplified gear model
- Best practices for model creation
- Parameter management

## Quick Start

**Create a new model:**

```javascript
import { ModelBase } from '../src/core/model-base.js';
import { createBox, ops } from '../src/core/primitives.js';

export class MyModel extends ModelBase {
  getDefaultParams() {
    return {
      width: 50,
      height: 30
    };
  }

  generate() {
    const { width, height } = this.params;
    return createBox(width, height, 10);
  }
}
```

**Use with tag provider:**

```javascript
import { TagProvider } from '../src/tag-provider/index.js';
import { MyModel } from './my-model.js';

const tags = new TagProvider();
const model = new MyModel({}, tags);

// Parameters are now managed by tags
model.tagGroup.subscribe('width', () => {
  model.regenerate();
});

model.setParam('width', 75); // Auto-triggers regeneration
```

**Export to STL:**

```javascript
import { saveSTLNode } from '../src/exporters/index.js';

const geometry = model.generate();
await saveSTLNode(geometry, './output.stl');
```

## Advanced Usage

See the model files in `models/` directory for more complex examples:
- [models/brackets/mounting-bracket.js](../models/brackets/mounting-bracket.js) - Parametric bracket with holes
- [models/konomi-parts/enclosure.js](../models/konomi-parts/enclosure.js) - Complex enclosure with ventilation
- [models/accessories/cable-clip.js](../models/accessories/cable-clip.js) - Cable management clip

## Integration with SCADA Systems

The tag provider can integrate with external SCADA/IoT systems:

```javascript
// Read from external system
externalSystem.on('parameter-update', (name, value) => {
  tags.setValue(name, value);
});

// Write to external system
tags.subscribe('*', (value, oldValue, tag) => {
  externalSystem.sendUpdate(tag.name, value);
});
```

Perfect for manufacturing environments where parameters come from:
- PLCs and industrial controllers
- IoT sensors
- Web interfaces
- Mobile apps
- Database systems
