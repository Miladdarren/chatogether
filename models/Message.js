const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// message schema
const MessageSchema = new Schema({
    created: {
        type: Date,
        required: true
    },
    from: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    conversationId: {
        type: String,
        required: true
    },
    inChatRoom: {
        type: Boolean
    }
});

MessageSchema.statics.addMessage = (message, callback) => {
    message.save(callback);
};

MessageSchema.statics.getMessages = callback => {
    Message.find({}, callback);
};

MessageSchema.statics.getMessagesByConv = (id, callback) => {
    Message.find({ conversationId: id }, callback);
};

const Message = mongoose.model('Message', MessageSchema);
module.exports = Message;
