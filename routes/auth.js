const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const keys = require('../config/keys');
const passport = require('passport');
const { signJWT } = require('../libs/utilities');

// Load User model
const User = require('../models/User');

// @route  POST auth/register
// @desc   Register user
// @access Public
router.post('/register', (req, res) => {
    const errors = {};

    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    // Search for existing user
    User.find()
        .or([{ username: username }, { email: email }])
        .then(users => {
            // User exist
            if (users.length !== 0) {
                for (let user of users) {
                    if (user.username === username)
                        errors.usernameexist = 'Username already exist!';

                    if (user.email === email)
                        errors.emailexist = 'Email already exist!';
                }

                return res.status(400).json(errors);
            }

            // Registering user //

            // Creating new user
            const newUser = new User({
                firstName: firstName,
                lastName: lastName,
                username: username,
                email: email,
                password: password
            });

            // Hashing password
            bcrypt
                .hash(password, keys.saltFactor)
                .then(hash => {
                    newUser.password = hash;

                    // Saving user in database
                    newUser
                        .save()
                        .then(user => res.json(user))
                        .catch(err => console.log(err));
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
});

// @route  POST auth/login
// @desc   Login user
// @access Public
router.post('/login', (req, res) => {
    const errors = {};
    const emailOrUsername = req.body.emailOrUsername;
    const password = req.body.password;

    // Find
    User.findOne()
        .or([{ username: emailOrUsername }, { email: emailOrUsername }])
        .then(user => {
            if (!user) {
                errors.nouser = 'User not found';
                return res.status(404).json(errors);
            }

            // Check password
            bcrypt.compare(password, user.password).then(isMatch => {
                // Password does not match
                if (!isMatch) {
                    errors.badpassword = 'Incorrect password';
                    return res.status(400).json(errors);
                }

                // User matched //

                // Create JWT payload
                const payload = {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    avatar: user.avatar
                };

                // Sign token
                signJWT(res, payload);
            });
        })
        .catch(err => console.log(err));
});

// GOOGLE OAUTH2 //

// @route  GET auth/google
// @desc   Redirect to google for authentication
// @access Public
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false
    }),
    (req, res) => {
        // Create JWT payload
        const payload = {
            id: req.user.id,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            username: req.user.username,
            avatar: req.user.avatar
        };

        // Sign token
        signJWT(res, payload);
    }
);

// Github OAUTH2 //

// @route  GET auth/github
// @desc   Redirect to gihub for authentication
// @access Public
router.get(
    '/github',
    passport.authenticate('github', { session: false }),
    (req, res) => {
        // Create JWT payload
        const payload = {
            id: req.user.id,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            username: req.user.username,
            avatar: req.user.avatar
        };

        // Sign token
        signJWT(res, payload);
    }
);

module.exports = router;
