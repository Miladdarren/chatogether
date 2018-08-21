const jwt = require('jsonwebtoken');
const keys = require('../config/keys');

exports.signJWT = (res, payload) => {
    jwt.sign(payload, keys.secretOrKey, keys.jwtExpires, (err, token) => {
        res.json({
            success: true,
            token: 'Bearer ' + token
        });
    });
};

exports.randomString = () => {
    const length = 10;
    return Math.round(
        Math.pow(36, length + 1) - Math.random() * Math.pow(36, length)
    )
        .toString(36)
        .slice(1);
};
