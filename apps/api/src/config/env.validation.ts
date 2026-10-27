import Joi from 'joi';

// Joi validates the environment variables when NestJS starts.
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('dev', 'prod', 'test')
    .default('dev'),

  PORT: Joi.number()
    .port()
    .default(3000),
}).options({
  abortEarly: false,
  allowUnknown: true,
});
