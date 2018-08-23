const env = require('../env');

module.exports = {
    secretOrKey: env.secretOrKey,
    saltFactor: env.saltFactor,
    jwtExpires: { expiresIn: env.jwtExpires },
    googleAuth: {
        clientID: env.googleClientID,
        clientSecret: env.googleClientSecret,
        callbackURL: env.googleCallbackURL
    }
};
