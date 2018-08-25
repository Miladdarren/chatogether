const express = require('express');
const router = express.Router();
const passport = require('passport');

// Load User model
const User = require('../models/User');

// @route  GET users/current
// @desc   Return current logged in user
// @access Private
router.get(
    '/current',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        res.json({
            id: req.user.id,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            username: req.user.username,
            email: req.user.email,
            avatar: req.user.avatar,
            experience: req.user.experience,
            social: req.user.social
        });
    }
);

// @route  GET users/all
// @desc   Return all users
// @access Private
router.get(
    '/all',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const errors = {};

        User.find(
            {},
            'firstName lastName username email avatar experience social'
        )
            .then(users => {
                if (!users) {
                    errors.nouser = 'No user';
                    return res.status(404).json(errors);
                }

                res.json(users);
            })
            .catch(err => console.log(err));
    }
);

// @route  GET users/:usernameOrUserId
// @desc   Get profile by username or user ID
// @access Private
router.get(
    '/:usernameOrUserId',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const errors = {};

        // Find user by username or ID
        User.findOne({ username: req.params.usernameOrUserId })
            .then(user => {
                if (user) {
                    return res.json({
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        username: user.username,
                        email: user.email,
                        avatar: user.avatar,
                        experience: user.experience,
                        social: user.social
                    });
                }

                User.findById(req.params.usernameOrUserId)
                    .then(user => {
                        if (!user) {
                            errors.nouser = 'User not found';
                            return res.status(404).json(errors);
                        }

                        res.json({
                            id: user.id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            username: user.username,
                            email: user.email,
                            avatar: user.avatar,
                            experience: user.experience,
                            social: user.social
                        });
                    })
                    .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
    }
);

module.exports = router;
