import { body, param } from 'express-validator';

export const sendMessageValidator = [
  body('question')
    .trim()
    .notEmpty()
    .withMessage('question is required')
    .isLength({ max: 2000 })
    .withMessage('question must be under 2000 characters'),
  body('conversationId')
    .optional()
    .isString()
    .isLength({ min: 1, max: 128 })
    .matches(/^[a-z0-9_-]+$/i)
    .withMessage('conversationId must be valid'),
];

export const conversationIdValidator = [
  param('id')
    .isString()
    .isLength({ min: 1, max: 128 })
    .matches(/^[a-z0-9_-]+$/i)
    .withMessage('A valid conversation id is required'),
];
