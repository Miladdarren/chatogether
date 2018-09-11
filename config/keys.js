const secretOrKey = process.env.SECRET_OR_KEY;
const jwtExpires = process.env.JWT_EXPIRES;

const googleClientID = process.env.GOOGLE_AUTH_ID;
const googleClientSecret = process.env.GOOGLE_AUTH_SECRET;
const googleCallbackURL =
    process.env.GOOGLE_AUTH_URL || 'http://localhost:3000/auth/google';

const githubClientID = process.env.GITHUB_AUTH_ID;
const githubClientSecret = process.env.GITHUB_AUTH_SECRET;
const githubCallbackURL =
    process.env.GITHUB_AUTH_URL || 'http://localhost:3000/auth/github';

const linkedinClientID = process.env.LINKEDIN_AUTH_ID;
const linkedinClientSecret = process.env.LINKEDIN_AUTH_SECRET;
const linkedinCallbackURL =
    process.env.LINKEDIN_AUTH_URL || 'http://localhost:3000/auth/linkedin';

module.exports = {
    secretOrKey: secretOrKey,
    saltFactor: 10,
    jwtExpires: { expiresIn: jwtExpires },
    cookieOptions: {
        expires: new Date(Date.now() + 3600000)
    },
    googleAuth: {
        clientID: googleClientID,
        clientSecret: googleClientSecret,
        callbackURL: googleCallbackURL
    },
    githubAuth: {
        clientID: githubClientID,
        clientSecret: githubClientSecret,
        callbackURL: githubCallbackURL,
        scope: ['user:email'] // Fetch private emails
    },
    linkedinAuth: {
        clientID: linkedinClientID,
        clientSecret: linkedinClientSecret,
        callbackURL: linkedinCallbackURL,
        scope: ['r_emailaddress', 'r_basicprofile']
    }
};
