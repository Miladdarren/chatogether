const joi = require('joi');

module.exports = {
    body: {
        title: joi
            .string()
            .trim()
            .min(3)
            .max(30)
            .required(),
        company: joi
            .string()
            .trim()
            .min(3)
            .max(30)
            .required(),
        from: joi
            .date()
            .max('now')
            .required(),
        to: joi
            .date()
            .min(joi.ref('from'))
            .optional(),
        current: joi
            .boolean()
            .default(false)
            .optional(),
        description: joi
            .string()
            .trim()
            .required()
    }
};
