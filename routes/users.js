const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const keys = require('../config/keys');
const mongoose = require('mongoose');

// Validator configuration
const validate = require('express-validation');
const validation = require('../validation/index');

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

        // Find user by username
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
                } else if (
                    // Check if usernameOrUserId is a valid ID
                    typeof req.params.usernameOrUserId !==
                    mongoose.Types.ObjectId
                ) {
                    // Find user by ID
                    User.findById(req.params.usernameOrUserId)
                        .then(user => {
                            if (!user) {
                                errors.nouser = 'User not found';
                                res.status(404).json(errors);
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
                        .catch(err => {
                            console.log(err);
                            errors.nouser = 'User not found';
                            res.status(404).json(errors);
                        });
                } else {
                    errors.nouser = 'User not found';
                    res.status(404).json(errors);
                }
            })
            .catch(err => console.log(err));
    }
);

// @route  PATCH users/current
// @desc   Update current user
// @access Private
router.patch(
    '/current',
    passport.authenticate('jwt', { session: false }),
    validate(validation.userUpdate),
    (req, res) => {
        // Check current password
        bcrypt
            .compare(req.body.currentPassword, req.user.password)
            .then(isMatch => {
                const errors = {};

                // Password does not match
                if (!isMatch) {
                    errors.badpassword = 'Incorrect current password';
                    return res.status(400).json(errors);
                }

                // Password matched //

                const profile = {};

                // Required fields
                profile.firstName = req.body.firstName;
                profile.lastName = req.body.lastName;
                profile.username = req.body.username;
                profile.email = req.body.email;

                // Optional fields
                if (req.body.avatar) profile.avatar = req.body.avatar;

                // Social
                profile.social = {};
                if (req.body.linkedin)
                    profile.social.linkedin = req.body.linkedin;
                if (req.body.instagram)
                    profile.social.instagram = req.body.instagram;
                if (req.body.telegram)
                    profile.social.telegram = req.body.telegram;
                if (req.body.github) profile.social.github = req.body.github;

                // Password reset
                if (req.body.newPassword && req.body.newConfirmPassword) {
                    // Synchronous password hashing
                    profile.password = bcrypt.hashSync(
                        req.body.newPassword,
                        keys.saltFactor
                    );
                }

                // Update user
                User.findByIdAndUpdate(
                    req.user.id,
                    { $set: profile },
                    { new: true }
                )
                    .then(user => res.json(user))
                    .catch(err => console.log(err));
            });
    }
);

// @route  PATCH users/experience
// @desc   Add experience to profile
// @access Private
router.patch(
    '/experience',
    passport.authenticate('jwt', { session: false }),
    validate(validation.experience),
    (req, res) => {
        User.findById(req.user.id).then(user => {
            const newExp = {
                title: req.body.title,
                company: req.body.company,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            };

            // Add to exp array
            user.experience.push(newExp);

            user.save().then(user => res.json(user));
        });
    }
);

// @route  DELETE users/experience/:exp_id
// @desc   Delete experience from profile
// @access Private
router.delete(
    '/experience/:exp_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        User.findById(req.user.id)
            .then(user => {
                // Get remove index
                const removeIndex = user.experience
                    .map(item => item.id)
                    .indexOf(req.params.exp_id);

                // Splice out of array
                user.experience.splice(removeIndex, 1);

                // Save
                user.save().then(user => res.json(user));
            })
            .catch(err => console.log(err));
    }
);

// @route  DELETE users/current
// @desc   Delete user profile
// @access Private
router.delete(
    '/current',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        User.findByIdAndRemove(req.user.id)
            .then(() => {
                res.json({ success: true });
            })
            .catch(err => {
                console.log(err);
                res.status(404).json(err);
            });
    }
);

module.exports = router;
