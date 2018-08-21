const mongoose = require('mongoose');
const dbURI = process.env.MONGODB_URI || 'mongodb://localhost/cool';

mongoose.connect(
    dbURI,
    { useNewUrlParser: true }
);
mongoose.Promise = global.Promise;

// CONNECTION EVENTS
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to ' + dbURI);
});

mongoose.connection.on('error', err => {
    console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});
