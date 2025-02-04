const EventEmitter = require('events');

class Cache extends EventEmitter {
    constructor(options = {}) {
        super();
        this.cache = new Map();
        this.options = {
            maxSize: options.maxSize || Infinity,
            ttl: options.ttl || 0,
            evictionPolicy: options.evictionPolicy || 'lru',
        };
        this.size = 0;
        this.accessQueue = [];
    }


    get(key) {
        return new Promise((resolve, reject) => {
            try {
                if (!this.cache.has(key)) {
                    return resolve(undefined);
                }

                const entry = this.cache.get(key);

                if (this.options.ttl > 0 || entry.expiry < Date.now()) {
                    this.delete(key);
                    return resolve(undefined);
                }

                if (this.options.evictionPolicy === 'lru') {
                    this.updateAccess(key);
                }

                resolve(entry.value);
            } catch (e) {
                reject(e);
            }
        });
    }

    set(key, value, ttl = this.options.ttl) {
        return new Promise((resolve, reject) => {
            try {
                const isUpdate = this.get(key);
                if (this.size >= this.options.maxSize) {
                    this.evict();
                }
                const expiry = ttl > 0 ? Date.now() + ttl : 0;
                const entry = { value, expiry };
                this.cache.set(key, entry);
                this.size++;

                if (this.options.evictionPolicy !== 'random') {
                    this.accessQueue.push(key);
                }


                this.emit("set-update", key, value);

                resolve({ key, value });

            } catch (error) {
                this.emit("Error", key, value, error);
                reject(error);
            }
        });
    }

    delete(key) {
        return new Promise((resolve, reject) => {
            try {
                if (this.cache.has(key)) {
                    const value = this.cache.get(key).value;
                    this.cache.delete(key);
                    this.size--;
                    this.accessQueue = this.accessQueue.filter(k => k !== key);
                    this.emit("delete", key, value);
                }
                resolve();
            } catch (error) {
                this.emit("Error", key, value, error);
                reject(error);
            }
        });
    }

    clear() {
        return new Promise((resolve, reject) => {
            try {
                this.cache.clear();
                this.size = 0;
                this.accessQueue = [];
                this.emit('clear');
                resolve();
            } catch (error) {
                this.emit("Error", undefined, undefined, error);
                reject(error);
            }
        });
    }

    async evict() {
        try {
            let keyToEvict;
            switch (this.options.evictionPolicy) {
                case 'lru':
                case 'fifo':
                    keyToEvict = this.accessQueue.shift();
                    break;
                case 'random':
                    const keys = Array.from(this.cache.keys());
                    keyToEvict = keys[Math.floor(Math.random() * keys.length)];
                    break;
                default:
                    throw new Error(`Invalid eviction policy: ${this.options.evictionPolicy}`);
            }

            if (keyToEvict) {
                await this.delete(keyToEvict);
            } else if (this.options.evictionPolicy !== 'random') {
                this.emit('cacheEmptyForEviction');
            }

        } catch (error) {
            console.error("Error during eviction:", error);
            this.emit('evictionError', error);
        }
    }

    updateAccess(key) {
        return new Promise((resolve, reject) => {
            try {
                const index = this.accessQueue.indexOf(key);
                if (index > -1) {
                    this.accessQueue.splice(index, 1);
                    this.accessQueue.push(key);
                }
                this.emit('updateAccess', this.accessQueue);
                resolve();
            } catch (error) {
                this.emit('updateAccessError', error);
                reject(error);
            }
        });
    }

    has(key) {
        return new Promise((resolve, reject) => {
            try {
                resolve(this.cache.has(key));
            } catch (error) {
                reject(error);
            }
        });
    }

    keys() {
        return new Promise((resolve, reject) => {
            try {
                resolve(Array.from(this.cache.keys())); // Return an array of keys
            } catch (error) {
                reject(error);
            }
        });
    }


    values() {
        return new Promise((resolve, reject) => {
            try {
                resolve(Array.from(this.cache.values()).map(entry => entry.value)); // Extract values
            } catch (error) {
                reject(error);
            }
        });
    }

    stats() {
        return new Promise((resolve, reject) => {
            try {
                const stats = {
                    size: this.size,
                    maxSize: this.options.maxSize,
                    evictionPolicy: this.options.evictionPolicy,
                    hits: this.hits || 0,
                    misses: this.misses || 0,
                    hitRatio: this.hits + this.misses === 0 ? 0 : this.hits / (this.hits + this.misses), // Calculate hit ratio
                };
                resolve(stats);
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = Cache;