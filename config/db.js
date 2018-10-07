const mongoose = require('mongoose');
const Redis = require('ioredis');
const keys = require('./keys');

const dbURI = process.env.MONGODB_URI;
const redisURI = process.env.REDIS_URI;
const redisClient = new Redis(redisURI);

mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);

// Configure redis caching system
const exec = mongoose.Query.prototype.exec;

// Cashe a query or not
mongoose.Query.prototype.cache = function(options) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options);

    return this;
};

mongoose.Query.prototype.exec = async function() {
    // If query does not need to be cached, skip caching
    if (!this.useCache) {
        return exec.apply(this, arguments);
    }

    // Key for caching query
    const redisKey = JSON.stringify(
        Object.assign({}, this.getQuery(), {
            collection: this.mongooseCollection.name
        })
    );

    // Check if there is a cached value for this key
    const cachedValue = await redisClient.hget(this.hashKey, redisKey);

    // If there is, return it
    if (cachedValue) {
        console.log('Served from REDIS');

        const data = JSON.parse(cachedValue);

        // Model it like a mongoDB document
        const doc = Array.isArray(data)
            ? data.map(d => new this.model(d))
            : new this.model(data);

        return doc;
    }

    // Otherwise, issue the query and store the result in redis
    const result = await exec.apply(this, arguments);

    // All cached values will expire in "keys.redisExpiration" seconds
    redisClient.hset(
        this.hashKey,
        redisKey,
        JSON.stringify(result),
        'EX',
        keys.redisExpiration
    );

    return result;
};

const connect = () => {
    mongoose.connect(
        dbURI,
        { useNewUrlParser: true }
    );
};

// Connect to mongo host, set retry on initial fail
const connectMongo = () => {
    connect();
    // CONNECTION EVENTS
    mongoose.connection.on('connected', () => {
        console.log(`Mongoose connected to ${dbURI}`);
    });

    mongoose.connection.on('error', err => {
        console.log(`Mongoose connection error: ${err}`);
        setTimeout(connect, 4000);
    });

    redisClient.on('connect', () => {
        console.log(`Redis connected to ${redisURI}`);
    });

    redisClient.on('error', err => {
        console.log(`Redis connection error: ${err}`);
    });
};

module.exports = {
    connectMongo,
    flushCache(hashKey) {
        redisClient.del(JSON.stringify(hashKey));
    }
};
