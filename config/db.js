const mongoose = require('mongoose');
const dbURI = process.env.MONGODB_URI || 'mongodb://localhost/cool';

mongoose.Promise = global.Promise;

const connectMongo = () => {
    mongoose.connect(
        dbURI,
        { useNewUrlParser: true }
    );
};

// Connect to mongo host, set retry on initial fail
const init = () => {
    connectMongo();
    // CONNECTION EVENTS
    mongoose.connection.on('connected', () => {
        console.log('Mongoose connected to ' + dbURI);
    });

    mongoose.connection.on('error', err => {
        console.log('Mongoose connection error: ' + err);
        setTimeout(connectMongo, 4000);
    });
};

module.exports = init;
