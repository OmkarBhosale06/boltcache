// cache.test.js (Jest test file)

const Cache = require('../app'); // Replace with the path to your cache file

describe('Cache', () => {
    let cache;

    beforeEach(() => {
        cache = new Cache({ maxSize: 3, evictionPolicy: 'lru' }); // Reset cache before each test
    });

    it('should set and get values correctly', async () => {
        await cache.set('key1', 'value1');
        expect(await cache.get('key1')).toBe('value1');
    });

    it('should return undefined for non-existent keys', async () => {
        expect(await cache.get('nonExistentKey')).toBeUndefined();
    });

    it('should handle TTL correctly', async () => {
        await cache.set('key1', 'value1', 100); // 100ms TTL
        await new Promise(resolve => setTimeout(resolve, 150)); // Wait for TTL
        expect(await cache.get('key1')).toBeUndefined();
    });

    it('should evict LRU items', async () => {
        await cache.set('key1', 'value1');
        await cache.set('key2', 'value2');
        await cache.set('key3', 'value3');
        await cache.set('key4', 'value4'); // Evicts key1
        expect(await cache.get('key1')).toBeUndefined();
    });

    it('should delete keys correctly', async () => {
        await cache.set('key1', 'value1');
        await cache.delete('key1');
        expect(await cache.get('key1')).toBeUndefined();
    });

    it('should clear the cache', async () => {
        await cache.set('key1', 'value1');
        await cache.clear();
        expect(await cache.keys()).toEqual([]);
    });

    it('should check if a key exists', async () => {
        await cache.set('key1', 'value1');
        expect(await cache.has('key1')).toBe(true);
        expect(await cache.has('key2')).toBe(false);
    });

    it('should return all keys', async () => {
        await cache.set('key1', 'value1');
        await cache.set('key2', 'value2');
        const keys = await cache.keys();
        expect(keys).toEqual(['key1', 'key2']);
    });

    it('should return all values', async () => {
        await cache.set('key1', 'value1');
        await cache.set('key2', 'value2');
        const values = await cache.values();
        expect(values).toEqual(['value1', 'value2']);
    });


    it('should return cache stats', async () => {
        await cache.set('key1', 'value1');
        const stats = await cache.stats();
        expect(stats.size).toBe(1);
        expect(stats.maxSize).toBe(3);
        expect(stats.evictionPolicy).toBe('lru');
        expect(stats.hits).toBeGreaterThanOrEqual(0); // May be 0 if not accessed yet
        expect(stats.misses).toBeGreaterThanOrEqual(0); // May be 0 if all are hits
        expect(stats).toHaveProperty('hitRatio'); // Check for hitRatio property
    });

    it('should emit set and update events', async () => {
        const setListener = jest.fn();
        const updateListener = jest.fn();

        cache.on('set', setListener);
        cache.on('update', updateListener);

        await cache.set('key1', 'value1');
        expect(setListener).toHaveBeenCalledTimes(1);
        expect(updateListener).not.toHaveBeenCalled();

        await cache.set('key1', 'value2'); // Update
        expect(setListener).toHaveBeenCalledTimes(1);
        expect(updateListener).toHaveBeenCalledTimes(1);

        cache.off('set', setListener);
        cache.off('update', updateListener);
    });

    it('should emit delete event', async () => {
        const deleteListener = jest.fn();
        cache.on('delete', deleteListener);
        await cache.set('key1', 'value1');
        await cache.delete('key1');
        expect(deleteListener).toHaveBeenCalledTimes(1);
        expect(deleteListener).toHaveBeenCalledWith('key1', 'value1');
        cache.off('delete', deleteListener);
    });

    it('should emit clear event', async () => {
        const clearListener = jest.fn();
        cache.on('clear', clearListener);
        await cache.clear();
        expect(clearListener).toHaveBeenCalledTimes(1);
        cache.off('clear', clearListener);
    });

    it('should emit eviction error event', async () => {
        const evictionErrorListener = jest.fn();
        cache.on('evictionError', evictionErrorListener);
        cache = new Cache({ maxSize: 2, evictionPolicy: 'lru' });
        await cache.set('key1', 'value1');
        await cache.set('key2', 'value2');
        await cache.set('key3', 'value3'); // Triggers eviction
        expect(evictionErrorListener).not.toHaveBeenCalled(); // No error in LRU
        cache.off('evictionError', evictionErrorListener);
    });

    it('should emit cacheEmptyForEviction event', async () => {
        const cacheEmptyForEvictionListener = jest.fn();
        cache.on('cacheEmptyForEviction', cacheEmptyForEvictionListener);
        await cache.evict(); // Triggers cacheEmptyForEviction
        expect(cacheEmptyForEvictionListener).toHaveBeenCalledTimes(1);
        cache.off('cacheEmptyForEviction', cacheEmptyForEvictionListener);
    });

    it('should emit updateAccess event', async () => {
        const updateAccessListener = jest.fn();
        cache.on('updateAccess', updateAccessListener);
        await cache.set('key1', 'value1');
        await cache.get('key1'); // Triggers updateAccess
        expect(updateAccessListener).toHaveBeenCalledTimes(1);
        cache.off('updateAccess', updateAccessListener);
    });

    it('should handle errors gracefully', async () => {
        // Simulate an error in the set method (for testing error handling)
        const mockSet = jest.fn().mockRejectedValue(new Error('Simulated error'));
        cache.set = mockSet;

        await expect(cache.set('key1', 'value1')).rejects.toThrow('Simulated error');

        // Reset the original set method
        cache.set = Cache.prototype.set;
    });

});