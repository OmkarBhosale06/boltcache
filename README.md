# Asynchronous Cache Library

A high-performance, asynchronous caching library for JavaScript with customizable eviction policies and event emission.  Built for speed and flexibility in modern asynchronous environments.

## Installation

```bash
npm install asynchronous-cache-library
# or
yarn add asynchronous-cache-library

const Cache = require('asynchronous-cache-library');

// Create a cache instance with options (maxSize, ttl, evictionPolicy)
const cache = new Cache({ maxSize: 100, ttl: 60000, evictionPolicy: 'lru' });

// Setting a value (using Promises)
cache.set('myKey', 'myValue')
  .then(({ key, value }) => console.log(`Set ${key}: ${value}`))
  .catch(err => console.error("Error setting value:", err));

// Getting a value (using Promises)
cache.get('myKey')
  .then(value => console.log(`Got value: ${value}`))
  .catch(err => console.error("Error getting value:", err));

// Checking if a key exists (using Promises)
cache.has('myKey')
  .then(exists => console.log(`Key exists: ${exists}`))
  .catch(err => console.error("Error checking key:", err));

// Deleting a value (using Promises)
cache.delete('myKey')
  .then(() => console.log('Value deleted'))
  .catch(err => console.error("Error deleting value:", err));

// Clearing the cache (using Promises)
cache.clear()
  .then(() => console.log('Cache cleared'))
  .catch(err => console.error("Error clearing cache:", err));


// Event listeners for cache operations
cache.on('set-update', (key, value) => {
  console.log(`Value set or updated: ${key} - ${value}`);
});

cache.on('delete', (key, value) => {
    console.log(`Value deleted: ${key} - ${value}`);
});

cache.on('clear', () => {
    console.log(`Cache cleared`);
});

cache.on('Error', (key, value, error) => {
  console.error("Cache Error:", error);
});

cache.on('evictionError', (error) => {
    console.error("Eviction Error:", error)
})

cache.on('cacheEmptyForEviction', () => {
    console.log('Cache is empty for eviction')
})

cache.on('updateAccess', (accessQueue) => {
    console.log('Access queue updated:', accessQueue);
})

// Using keys(), values(), and stats()
cache.keys().then(keys => console.log("Keys in cache:", keys));
cache.values().then(values => console.log("Values in cache:", values));
cache.stats().then(stats => console.log("Cache Stats:", stats));