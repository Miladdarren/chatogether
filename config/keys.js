const env = require('../env');

module.exports = {
    secretOrKey: env.secretOrKey,
    saltFactor: env.saltFactor,
    jwtExpires: { expiresIn: env.jwtExpires },
    googleAuth: {
        clientID: env.googleClientID,
        clientSecret: env.googleClientSecret,
        callbackURL: env.googleCallbackURL
    },
    githubAuth: {
        clientID: env.githubClientID,
        clientSecret: env.githubClientSecret,
        callbackURL: env.githubCallbackURL,
        scope: ['user:email'] // Fetch private emails
    }
};
