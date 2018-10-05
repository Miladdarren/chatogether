const express = require('express');
const router = express.Router();
const passport = require('passport');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// @route  GET messages/
// @desc   Get chat-room conversation
// @access Private
router.get(
    '/',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const response = { success: true };

        Conversation.findOne({ name: 'chat-room' }).then(conversation => {
            // Chat-room does not exist so create it
            if (!conversation) {
                const chatRoom = new Conversation({ name: 'chat-room' });

                chatRoom
                    .save()
                    .then(conversation => {
                        response.conversation = conversation;
                        res.json(response);
                    })
                    .catch(err => {
                        console.log(err);
                        response.success = false;
                        res.json(response);
                    });
            } else {
                // Chat-room exist so fetch its messages
                Message.find({ conversationId: conversation._id })
                    .then(messages => {
                        // Add messages array to conversation object
                        const conversationObj = Object.assign(
                            {},
                            conversation,
                            {
                                messages: messages
                            }
                        );
                        response.conversation = conversationObj;
                        res.json(response);
                    })
                    .catch(err => {
                        console.log(err);
                        response.success = false;
                        res.json(response);
                    });
            }
        });
    }
);

// @route  GET messages/:user1/:user2
// @desc   Get private conversation
// @access Private
router.get(
    '/:user1/:user2',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const response = { success: true };

        const combo1 = '' + req.params.user1 + '-' + req.params.user2;
        const combo2 = '' + req.params.user2 + '-' + req.params.user1;

        Conversation.findOne()
            .or([{ name: combo1 }, { name: combo2 }])
            .then(conversation => {
                // Conversation does not exist so create it
                if (!conversation) {
                    User.find()
                        .or([
                            { username: req.params.user1 },
                            { username: req.params.user2 }
                        ])
                        .then(users => {
                            // User1 or user2 does not exist
                            if (users.length !== 2) {
                                response.success = false;
                                return res.json(response);
                            }

                            // Both users exist
                            const mihai1 = {
                                id: users[0]._id,
                                username: users[0].username
                            };
                            const mihai2 = {
                                id: users[1]._id,
                                username: users[1].username
                            };
                            const participants = [mihai1, mihai2];

                            const newConv = new Conversation({
                                participants: participants,
                                name:
                                    '' + mihai1.username + '-' + mihai2.username
                            });

                            newConv
                                .save()
                                .then(conversation => {
                                    response.conversation = conversation;
                                    res.json(response);
                                })
                                .catch(err => {
                                    console.log(err);
                                    response.success = false;
                                    res.json(response);
                                });
                        })
                        .catch(err => console.log(err));
                } else {
                    // Conversation exist so fetch its messages
                    Message.find({ conversationId: conversation._id })
                        .then(messages => {
                            // Add messages array to conversation object
                            const conversationObj = Object.assign(
                                {},
                                conversation,
                                {
                                    messages: messages
                                }
                            );
                            response.conversation = conversationObj;
                            res.json(response);
                        })
                        .catch(err => {
                            console.log(err);
                            response.success = false;
                            res.json(response);
                        });
                }
            });
    }
);

module.exports = router;
