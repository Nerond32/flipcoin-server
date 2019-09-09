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
      .allow('')
  })
};

const socketGetRoom = Joi.object().keys({
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
    .allow('')
});

const socketSendMessage = Joi.object().keys({
  roomName: Joi.string()
    .alphanum()
    .min(3)
    .max(24)
    .required(),
  userToken: Joi.string()
    .alphanum()
    .min(32)
    .max(32)
    .required(),
  message: Joi.string()
    .min(1)
    .max(256)
    .required()
});

const socketChangeConfirmStatus = Joi.object().keys({
  roomName: Joi.string()
    .alphanum()
    .min(3)
    .max(24)
    .required(),
  userToken: Joi.string()
    .alphanum()
    .min(32)
    .max(32)
    .required(),
  userIsConfirmed: Joi.boolean()
    .strict()
    .required()
});

module.exports = {
  createRoom,
  socketGetRoom,
  socketSendMessage,
  socketChangeConfirmStatus
};
