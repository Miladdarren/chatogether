const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const cors = require('cors');

// Routes modules
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');

const app = express();

// Connecting to mongoDB
require('./config/db');

// Passport middleware
app.use(passport.initialize());

// Passport Config
require('./config/passport')(passport);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'profilePics')));

app.use('/users', usersRouter);
app.use('/auth', authRouter);

// Catch all other GET requests and return 404 page
app.get('*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public/assets/404.html'));
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500).json(err);
});

module.exports = app;
