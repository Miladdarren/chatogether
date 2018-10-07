const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const keys = require('../config/keys');
const mongoose = require('mongoose');
const { sendError } = require('../libs/utilities');
const fs = require('fs');
const async = require('async');
const { flushCache } = require('../config/db');

// Validator configuration
const validate = require('express-validation');
const validation = require('../validation/index');

// User profile pic upload config
const picUpload = require('../config/picUpload');

// Load User model
const User = require('../models/User');

// Error messages
const errMessages = {};
errMessages.server = 'Server Problem';
errMessages.noUsers = 'There are no users registered yet!';
errMessages.noUser = 'No user found';
errMessages.badCurrentPassword = 'Incorrect current password';
errMessages.usernameExist = 'Username already exist!';
errMessages.emailExist = 'Email already exist!';

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
            .cache('allUsers')
            .then(users => {
                if (!users) {
                    return sendError(res, 404, errMessages.noUsers);
                }

                res.json({ success: true, users: users });
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
        const profile = {};
        async.series([
            // Check for existing username
            callback => {
                if (req.body.username !== req.user.username) {
                    User.findOne({
                        username: req.body.username
                    }).then(user => {
                        // Username exist
                        if (user) {
                            sendError(res, 400, errMessages.usernameExist);
                            callback(errMessages.usernameExist);
                        } else callback();
                    });
                } else callback();
            },
            // Check for existing email
            callback => {
                if (req.body.email !== req.user.email) {
                    User.findOne({ email: req.body.email }).then(user => {
                        // Email exist
                        if (user) {
                            sendError(res, 400, errMessages.emailExist);
                            callback(errMessages.emailExist);
                        } else callback();
                    });
                } else callback();
            },
            // Changing password
            callback => {
                if (req.body.newPassword && req.body.newConfirmPassword) {
                    // Check current password
                    bcrypt
                        .compare(req.body.currentPassword, req.user.password)
                        .then(isMatch => {
                            // Password does not match
                            if (!isMatch) {
                                sendError(
                                    res,
                                    400,
                                    errMessages.badCurrentPassword
                                );
                                callback(errMessages.badCurrentPassword);
                            } else {
                                // Synchronous password hashing
                                profile.password = bcrypt.hashSync(
                                    req.body.newPassword,
                                    keys.saltFactor
                                );
                                callback();
                            }
                        });
                } else callback();
            },
            // Username and email do not exist so upadate the user
            callback => {
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

                // Update user
                User.findByIdAndUpdate(
                    req.user.id,
                    { $set: profile },
                    { new: true }
                )
                    .then(user => {
                        // Clear user from cache
                        flushCache(req.user.id);

                        res.json(user);
                        callback();
                    })
                    .catch(err => {
                        sendError(res, 500, errMessages.server, err);
                        callback();
                    });
            }
        ]);
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
        User.findById(req.user.id)
            .cache(req.user.id)
            .then(user => {
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

                user.save().then(user => {
                    // Clear user from cache
                    flushCache(req.user.id);
                    res.json(user);
                });
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
            .cache(req.user.id)
            .then(user => {
                // Get remove index
                const removeIndex = user.experience
                    .map(item => item.id)
                    .indexOf(req.params.exp_id);

                // Splice out of array
                user.experience.splice(removeIndex, 1);

                // Save
                user.save().then(user => {
                    // Clear user from cache
                    flushCache(req.user.id);
                    res.json(user);
                });
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
                // Clear user from cache
                flushCache(req.user.id);
                res.json({ success: true });
            })
            .catch(err => {
                sendError(res, 500, errMessages.server, err);
            });
    }
);

// @route  POST users/uploadpic
// @desc   Upload user profile picture
// @access Private
router.post(
    '/uploadpic',
    passport.authenticate('jwt', { session: false }),
    picUpload,
    (req, res) => {
        if (!req.file) {
            return res.status(422).json({ success: false });
        } else {
            const profile = {};
            profile.avatar = req.file.filename;

            // Deleting previous user photo if exist
            if (req.user.avatar !== '') {
                fs.unlink(`profilePics/${req.user.avatar}`, err => {
                    if (err) console.log(err);
                });
            }

            // Update user avatar
            User.findByIdAndUpdate(
                req.user.id,
                { $set: profile },
                { new: true }
            )
                .then(() => {
                    // Clear user from cache
                    flushCache(req.user.id);
                    res.json({ success: true });
                })
                .catch(err => {
                    sendError(res, 500, errMessages.server, err);
                });
        }
    }
);

module.exports = router;
