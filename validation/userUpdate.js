const joi = require('joi');

module.exports = {
    body: {
        firstName: joi
            .string()
            .trim()
            .min(3)
            .max(30)
            .required(),
        lastName: joi
            .string()
            .trim()
            .min(3)
            .max(30)
            .required(),
        username: joi
            .string()
            .trim()
            .alphanum()
            .lowercase()
            .min(3)
            .max(30)
            .required(),
        email: joi
            .string()
            .trim()
            .email()
            .lowercase()
            .required(),
        linkedin: joi
            .string()
            .trim()
            .uri()
            .optional(),
        instagram: joi
            .string()
            .trim()
            .uri()
            .optional(),
        telegram: joi
            .string()
            .trim()
            .uri()
            .optional(),
        github: joi
            .string()
            .trim()
            .uri()
            .optional(),
        currentPassword: joi.required(),
        newPassword: joi
            .string()
            .min(5)
            .max(30)
            .optional(),
        newConfirmPassword: joi
            .valid(joi.ref('newPassword'))
            .optional()
            .options({
                language: { any: { allowOnly: 'must match new password' } }
            })
    }
};
