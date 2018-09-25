const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// User schema
const UserSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        username: {
            type: String,
            lowercase: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            unique: true
        },
        avatar: {
            type: String
        },
        password: {
            type: String,
            required: true
        },
        experience: [
            {
                title: {
                    type: String,
                    required: true
                },
                company: {
                    type: String,
                    required: true
                },
                from: {
                    type: Date,
                    required: true
                },
                to: {
                    type: Date
                },
                current: {
                    type: Boolean,
                    default: false
                },
                description: {
                    type: String
                }
            }
        ],
        social: {
            linkedin: {
                type: String
            },
            instagram: {
                type: String
            },
            telegram: {
                type: String
            },
            github: {
                type: String
            }
        }
    },
    { timestamps: true }
);

UserSchema.statics.getUserByUsername = (username, callback) => {
    return User.findOne({ username: username }, callback);
};

const User = mongoose.model('User', UserSchema);
module.exports = User;
