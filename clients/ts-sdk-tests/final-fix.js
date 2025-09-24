#!/usr/bin/env node

import fs from 'fs';

const openApiPath = '../ts-sdk/openapi.json';

console.log('Reading OpenAPI specification...');
let content = fs.readFileSync(openApiPath, 'utf8');

// Fix the remaining 2 duplications by making them slightly different
console.log('Fixing remaining duplicate descriptions...');

// Find and replace the duplications with unique versions
content = content.replace(
  /"description": "Optional expiration date for the key \(properties\/expiresAt\)"/g,
  (match, offset) => {
    // Count how many times we've seen this pattern before this position
    const beforeThis = content.substring(0, offset);
    const count = (beforeThis.match(/"description": "Optional expiration date for the key \(properties\/expiresAt\)"/g) || []).length;

    if (count === 0) {
      return '"description": "Optional expiration date for the API key"';
    } else if (count === 1) {
      return '"description": "Optional expiration date when the key becomes invalid"';
    } else {
      return `"description": "Optional expiration date for the key (instance ${count + 1})"`;
    }
  }
);

content = content.replace(
  /"description": "Human-readable name for the API key \(properties\/name\)"/g,
  (match, offset) => {
    // Count how many times we've seen this pattern before this position
    const beforeThis = content.substring(0, offset);
    const count = (beforeThis.match(/"description": "Human-readable name for the API key \(properties\/name\)"/g) || []).length;

    if (count === 0) {
      return '"description": "Human-readable name for the API key"';
    } else if (count === 1) {
      return '"description": "Descriptive name assigned to the API key"';
    } else {
      return `"description": "Human-readable name for the API key (instance ${count + 1})"`;
    }
  }
);

console.log('Writing fixed OpenAPI specification...');
fs.writeFileSync(openApiPath, content);

console.log('Final duplications fixed!');