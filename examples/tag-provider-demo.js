/**
 * Example: Tag Provider Usage
 * Demonstrates SCADA-style parameter management
 */

import { TagProvider, TagGroup } from '../src/tag-provider/index.js';
import { MountingBracket } from '../models/brackets/mounting-bracket.js';

// Create global tag provider
const tags = new TagProvider();

// Example 1: Basic tag operations
console.log('=== Example 1: Basic Tag Operations ===\n');

tags.registerTag('machine.temperature', {
  defaultValue: 20,
  unit: '°C',
  min: -10,
  max: 100,
  description: 'Machine operating temperature'
});

tags.setValue('machine.temperature', 25);
console.log('Temperature:', tags.getValue('machine.temperature'), '°C');

// Subscribe to changes
tags.subscribe('machine.temperature', (value, oldValue) => {
  console.log(`Temperature changed: ${oldValue}°C -> ${value}°C`);
});

tags.setValue('machine.temperature', 30);

// Example 2: Tag Groups
console.log('\n=== Example 2: Tag Groups ===\n');

const printerSettings = new TagGroup('printer', tags);
printerSettings.addTag('temperature', { defaultValue: 200, unit: '°C' });
printerSettings.addTag('speed', { defaultValue: 50, unit: 'mm/s' });
printerSettings.addTag('layer_height', { defaultValue: 0.2, unit: 'mm' });

console.log('Printer settings:', printerSettings.getAllValues());

// Example 3: Integration with 3D Models
console.log('\n=== Example 3: Model Integration ===\n');

const bracket = new MountingBracket({}, tags);

// Parameters are now managed by tag provider
bracket.tagGroup.subscribe('width', (value) => {
  console.log(`Bracket width changed to ${value}mm`);
  console.log('Regenerating geometry...');
  bracket.regenerate();
});

bracket.setParam('width', 75);
bracket.setParam('height', 40);

console.log('\nBracket parameters:', bracket.params);

// Example 4: Range Validation and Alarms
console.log('\n=== Example 4: Range Validation ===\n');

tags.registerTag('motor.rpm', {
  defaultValue: 1000,
  min: 0,
  max: 5000,
  unit: 'RPM'
});

// This will trigger an alarm and clamp to max
tags.setValue('motor.rpm', 6000);
console.log('Motor RPM (clamped):', tags.getValue('motor.rpm'));

// Example 5: History Tracking
console.log('\n=== Example 5: History Tracking ===\n');

for (let i = 0; i < 5; i++) {
  tags.setValue('motor.rpm', 1000 + i * 500);
}

const history = tags.getHistory('motor.rpm', 5);
console.log('Recent RPM history:');
history.forEach((record, i) => {
  console.log(`  ${i + 1}. ${record.value} RPM at ${new Date(record.timestamp).toLocaleTimeString()}`);
});

// Example 6: Export/Import for Persistence
console.log('\n=== Example 6: Export/Import ===\n');

const snapshot = tags.exportValues(['machine.temperature', 'motor.rpm']);
console.log('Exported snapshot:', snapshot);

// Could save to localStorage or file
// localStorage.setItem('tagSnapshot', JSON.stringify(snapshot));

// Later, restore values
tags.importValues(snapshot);
console.log('Values restored from snapshot');

console.log('\n=== Examples Complete ===\n');
console.log('The tag provider system enables SCADA-like functionality for your 3D models!');
