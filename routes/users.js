const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const keys = require('../config/keys');
const mongoose = require('mongoose');
const { sendError } = require('../libs/utilities');

// Validator configuration
const validate = require('express-validation');
const validation = require('../validation/index');

// Load User model
const User = require('../models/User');

// Error messages
const errMessages = {};
errMessages.server = 'Server Problem';
errMessages.noUsers = 'There are no users registered yet!';
errMessages.noUser = 'No user found';
errMessages.badCurrentPassword = 'Incorrect current password';

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
        User.find(
            {},
            'firstName lastName username email avatar experience social'
        )
            .then(users => {
                if (!users) {
                    return sendError(res, 404, errMessages.noUsers);
                }

                res.json(users);
            })
            .catch(err => {
                sendError(res, 500, errMessages.server, err);
            });
    }
);

// @route  GET users/:usernameOrUserId
// @desc   Get profile by username or user ID
// @access Private
router.get(
    '/:usernameOrUserId',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
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
                                return sendError(res, 404, errMessages.noUser);
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
                            sendError(res, 404, errMessages.noUser, err);
                        });
                }
            })
            .catch(err => {
                sendError(res, 500, errMessages.server, err);
            });
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
                // Password does not match
                if (!isMatch) {
                    return sendError(res, 400, errMessages.badCurrentPassword);
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
                    .catch(err => {
                        sendError(res, 500, errMessages.server, err);
                    });
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
            .catch(err => {
                sendError(res, 500, errMessages.server, err);
            });
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
                sendError(res, 500, errMessages.server, err);
            });
    }
);

module.exports = router;
