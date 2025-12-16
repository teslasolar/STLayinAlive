# Tag Provider System

SCADA-style real-time value management for parametric 3D models.

## Overview

The Tag Provider system enables real-time parameter management similar to industrial SCADA systems. It provides:

- **Real-time Updates**: Subscribe to parameter changes
- **Data Validation**: Min/max range checking
- **Quality Indicators**: Track data quality (GOOD, BAD, UNCERTAIN)
- **Historical Data**: Automatic history tracking
- **Alarms**: Automatic alarm generation for out-of-range values
- **Grouped Tags**: Organize related parameters together

## Basic Usage

```javascript
import { TagProvider } from './tag-provider.js';

const tags = new TagProvider();

// Register a tag
tags.registerTag('bracket.width', {
  defaultValue: 50,
  unit: 'mm',
  min: 10,
  max: 200,
  description: 'Bracket width dimension'
});

// Subscribe to changes
tags.subscribe('bracket.width', (newValue, oldValue, tag) => {
  console.log(`Width changed from ${oldValue} to ${newValue}${tag.unit}`);
  regenerateModel();
});

// Update value
tags.setValue('bracket.width', 75);
```

## Tag Groups

Organize related parameters:

```javascript
import { TagProvider, TagGroup } from './tag-provider.js';

const tags = new TagProvider();
const bracket = new TagGroup('bracket', tags);

// Add tags to group
bracket.addTag('width', { defaultValue: 50, unit: 'mm' });
bracket.addTag('height', { defaultValue: 30, unit: 'mm' });
bracket.addTag('thickness', { defaultValue: 3, unit: 'mm' });

// Set values using local names
bracket.setValue('width', 75);
bracket.setValue('height', 40);

// Get all group values
const params = bracket.getAllValues();
// { width: 75, height: 40, thickness: 3 }
```

## Tag Configuration

```javascript
tags.registerTag('tagName', {
  defaultValue: 0,        // Initial value
  dataType: 'number',     // 'number', 'string', 'boolean'
  unit: 'mm',             // Engineering unit
  min: 0,                 // Minimum allowed value
  max: 100,               // Maximum allowed value
  description: 'Tag description',
  writeable: true         // Allow setValue operations
});
```

## History and Alarms

```javascript
// Get tag history
const history = tags.getHistory('bracket.width', 50);

// Check alarms
tags.setValue('bracket.width', 250); // Exceeds max, creates alarm

// Export/Import for persistence
const snapshot = tags.exportValues();
localStorage.setItem('parameters', JSON.stringify(snapshot));

// Later...
const saved = JSON.parse(localStorage.getItem('parameters'));
tags.importValues(saved);
```

## Integration with 3D Models

```javascript
class ParametricBracket extends ModelBase {
  constructor() {
    super('bracket');
    
    // Create tag group for this model
    this.tags = new TagGroup('bracket', globalTagProvider);
    this.tags.addTag('width', { defaultValue: 50, min: 10, max: 200 });
    this.tags.addTag('height', { defaultValue: 30, min: 10, max: 100 });
    
    // Subscribe to changes
    this.tags.subscribe('width', () => this.regenerate());
    this.tags.subscribe('height', () => this.regenerate());
  }
  
  generate() {
    const params = this.tags.getAllValues();
    // Use params.width, params.height to generate geometry
  }
}
```
