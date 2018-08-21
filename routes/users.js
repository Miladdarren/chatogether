const express = require('express');
const router = express.Router();
const passport = require('passport');

/* GET users listing. */
router.get(
    '/',
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

module.exports = router;
