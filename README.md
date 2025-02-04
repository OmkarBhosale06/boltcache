# BoltCache

A high-performance, asynchronous caching library for JavaScript with customizable eviction policies and event emission.  Built for speed and flexibility in modern asynchronous environments.

## Installation

```bash
npm install BoltCache
# or
yarn add BoltCache

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


API Documentation
new Cache(options)
Creates a new cache instance.

options (object, optional): Cache configuration options.
maxSize (number, optional): Maximum number of entries. Defaults to Infinity.
ttl (number, optional): Time-to-live in milliseconds. Defaults to 0 (no expiration).
evictionPolicy (string, optional): Eviction policy: 'lru' (default), 'fifo', or 'random'.
cache.get(key)
Retrieves a value by key.

key (any): The cache key.
Returns: Promise<any | undefined> - Resolves with the value or undefined if not found or expired.

cache.set(key, value, ttl)
Stores a value with a key.

key (any): The cache key.
value (any): The value to store.
ttl (number, optional): Time-to-live in milliseconds (overrides the default ttl).
Returns: Promise<{ key: any, value: any }> - Resolves with the key and value.

cache.delete(key)
Deletes a value by key.

key (any): The cache key.
Returns: Promise<void> - Resolves when the deletion is complete.

cache.clear()
Clears the entire cache.

Returns: Promise<void> - Resolves when the cache is cleared.

cache.evict()
Evicts an item based on the eviction policy.  Called automatically by set when maxSize is reached.

Returns: Promise<void> - Resolves when an item has been evicted (if any).

cache.has(key)
Checks if a key exists (and is not expired).

key (any): The cache key.
Returns: Promise<boolean> - Resolves with true if the key exists, false otherwise.

cache.keys()
Returns all keys in the cache.

Returns: Promise<Array<any>> - Resolves with an array of keys.

cache.values()
Returns all values in the cache.

Returns: Promise<Array<any>> - Resolves with an array of values.

cache.stats()
Returns cache statistics.

Returns: Promise<{ size: number, maxSize: number, evictionPolicy: string, hits?: number, misses?: number, hitRatio?: number }> - Resolves with a stats object.

Events
The Cache class extends EventEmitter and emits these events:

set-update: Value set or updated. Arguments: key, value.
delete: Value deleted. Arguments: key, value.
clear: Cache cleared.
Error: Error during a cache operation. Arguments: key (may be undefined), value (may be undefined), error.
evictionError: Error during eviction. Arguments: error.
cacheEmptyForEviction: Cache is empty during eviction (non-random policy).
updateAccess: Access queue updated (LRU). Arguments: accessQueue.
Contributing
Contributions are welcome! Please see the CONTRIBUTING.md file for guidelines (or create one).


MIT License

Copyright (c) 2025 Omkar Bhosale

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.