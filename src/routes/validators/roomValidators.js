const Joi = require('@hapi/joi');

const createRoom = {
  body: Joi.object().keys({
    roomName: Joi.string()
      .alphanum()
      .min(3)
      .max(24)
      .required(),
    userName: Joi.string()
      .alphanum()
      .min(3)
      .max(24)
      .required(),
    userToken: Joi.string()
      .alphanum()
      .min(32)
      .max(32)
  })
};

module.exports = {
  createRoom
};
