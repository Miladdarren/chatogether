const express = require('express');
const router = express.Router();
const passport = require('passport');
const Conversation = require('../models/Conversation');

// @route  GET messages/
// @desc   Get chat-room conversation
// @access Private
router.get(
    '/',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        let response = { success: true };
        Conversation.getChatRoom((err, chatRoom) => {
            if (err || chatRoom === null) {
                response.success = false;
                response.msg = 'There was an error on getting the conversation';
                res.json(response);
            } else {
                response.msg = 'Conversation retrieved successfuly';
                response.conversation = chatRoom;
                res.json(response);
            }
        });
    }
);

// @route  GET messages/:name1/:name2
// @desc   Get private conversation
// @access Private
router.get(
    '/:name1/:name2',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        let response = { success: true };
        Conversation.getConversationByName(
            req.params.name1,
            req.params.name2,
            (err, conversation) => {
                if (err) {
                    response.success = false;
                    response.msg =
                        'There was an error on getting the conversation';
                    res.json(response);
                } else {
                    response.msg = 'Conversation retrieved successfuly';
                    response.conversation = conversation;
                    res.json(response);
                }
            }
        );
    }
);

module.exports = router;
