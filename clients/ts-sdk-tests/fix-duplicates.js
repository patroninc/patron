#!/usr/bin/env node

import fs from 'fs';

const openApiPath = '../ts-sdk/openapi.json';

console.log('Reading OpenAPI specification...');
const openApiSpec = JSON.parse(fs.readFileSync(openApiPath, 'utf8'));

// Track occurrences of each description and make them unique
const descriptionOccurrences = new Map();

function findAndFixDuplicateDescriptions(obj, currentPath = '') {
  if (Array.isArray(obj)) {
    return obj.map((item, index) => findAndFixDuplicateDescriptions(item, `${currentPath}[${index}]`));
  }

  if (obj && typeof obj === 'object') {
    const result = {};

    for (const [key, value] of Object.entries(obj)) {
      if (key === 'description' && typeof value === 'string') {
        // Track occurrence and create unique description
        if (!descriptionOccurrences.has(value)) {
          descriptionOccurrences.set(value, 0);
        }

        const count = descriptionOccurrences.get(value);
        descriptionOccurrences.set(value, count + 1);

        let uniqueDescription = value;

        // If this is not the first occurrence, make it unique
        if (count > 0) {
          // Extract context from path to create meaningful variations
          const pathSegments = currentPath.split(/[./]/).filter(Boolean);

          // Common context-specific modifications
          if (value === '# Errors\\nReturns error if database query fails or connection issues occur') {
            if (pathSegments.includes('api-keys')) {
              uniqueDescription = '# API Key Errors\\nReturns error if API key database query fails or connection issues occur';
            } else if (pathSegments.includes('series')) {
              uniqueDescription = '# Series Errors\\nReturns error if series database query fails or connection issues occur';
            } else if (pathSegments.includes('posts')) {
              uniqueDescription = '# Post Errors\\nReturns error if post database query fails or connection issues occur';
            } else {
              uniqueDescription = `${value} (Context: ${pathSegments.slice(-2).join('/')})`;
            }
          } else if (value.includes('Filter by active status')) {
            if (pathSegments.includes('api-keys')) {
              uniqueDescription = 'Filter API keys by their active/inactive status';
            } else if (pathSegments.includes('series')) {
              uniqueDescription = 'Filter series by their active/inactive status';
            } else if (pathSegments.includes('posts')) {
              uniqueDescription = 'Filter posts by their active/inactive status';
            } else {
              uniqueDescription = `${value} (${pathSegments.slice(-2).join('/')})`;
            }
          } else if (value.includes('Maximum number')) {
            const resourceMatch = value.match(/Maximum number of (\\w+)/);
            if (resourceMatch) {
              const resource = resourceMatch[1];
              if (pathSegments.includes('series') && resource === 'API') {
                uniqueDescription = value.replace('API keys', 'series');
              } else if (pathSegments.includes('posts') && resource === 'API') {
                uniqueDescription = value.replace('API keys', 'posts');
              } else {
                uniqueDescription = `${value} (for ${pathSegments.slice(-2).join('/')})`;
              }
            } else {
              uniqueDescription = `${value} (${count + 1})`;
            }
          } else if (value.includes('UUID offset')) {
            if (pathSegments.includes('series')) {
              uniqueDescription = value.replace('API keys', 'series');
            } else if (pathSegments.includes('posts')) {
              uniqueDescription = value.replace('API keys', 'posts');
            } else {
              uniqueDescription = `${value} (${pathSegments.slice(-2).join('/')})`;
            }
          } else {
            // Generic approach for other duplicates
            const context = pathSegments.slice(-2).join('/') || `occurrence-${count + 1}`;
            uniqueDescription = `${value} (${context})`;
          }
        }

        result[key] = uniqueDescription;
      } else if (key === 'is_active') {
        // Fix snake_case to camelCase
        result['isActive'] = findAndFixDuplicateDescriptions(value, `${currentPath}.isActive`);
      } else {
        result[key] = findAndFixDuplicateDescriptions(value, `${currentPath}.${key}`);
      }
    }

    return result;
  }

  return obj;
}

console.log('Fixing duplicate descriptions...');
const fixedSpec = findAndFixDuplicateDescriptions(openApiSpec);

console.log('Description occurrence counts:');
for (const [desc, count] of descriptionOccurrences.entries()) {
  if (count > 1) {
    console.log(`- "${desc.substring(0, 50)}..." appeared ${count} times`);
  }
}

console.log('Writing fixed OpenAPI specification...');
fs.writeFileSync(openApiPath, JSON.stringify(fixedSpec, null, 2));

console.log('OpenAPI specification has been updated to eliminate duplicate descriptions!');