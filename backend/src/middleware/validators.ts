import { body, checkExact, param, ValidationChain } from 'express-validator';

const WORK_FIELDS = [
  'title',
  'type',
  'description',
  'coverImageUrl',
  'genres',
  'tags',
  'status',
  'language',
  'contentWarnings',
] as const;

const ADMIN_USER_FIELDS = ['username', 'password', 'role'] as const;

const isValidContent = (value: unknown) => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 && trimmed.length <= 200000;
  }

  if (Array.isArray(value)) {
    if (value.length === 0 || value.length > 500) {
      return false;
    }

    return value.every((item) => {
      if (typeof item !== 'string') {
        return false;
      }

      const trimmed = item.trim();
      if (trimmed.length === 0 || trimmed.length > 2048) {
        return false;
      }

      try {
        const parsed = new URL(trimmed);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    });
  }

  return false;
};

const hasHtmlLikeTags = (value: string) => /<[^>]+>/.test(value);

const rejectHtmlTags = (label: string) => (value: unknown) => {
  if (typeof value === 'string' && hasHtmlLikeTags(value)) {
    throw new Error(`${label} must not contain HTML tags`);
  }
  return true;
};

export const idParamValidation = (name = 'id'): ValidationChain =>
  param(name).isMongoId().withMessage(`${name} must be a valid id`);

export const registerValidation = [
  body('username')
    .isString()
    .withMessage('Username must be a string')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscore')
    .custom(rejectHtmlTags('Username')),
  body('password')
    .isString()
    .withMessage('Password must be a string')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters'),
  checkExact([], { message: 'Unexpected fields are not allowed' }),
];

export const loginValidation = [
  body('username')
    .isString()
    .withMessage('Username must be a string')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .custom(rejectHtmlTags('Username')),
  body('password')
    .isString()
    .withMessage('Password must be a string')
    .isLength({ min: 1, max: 128 })
    .withMessage('Password is required'),
  checkExact([], { message: 'Unexpected fields are not allowed' }),
];

export const workCreateValidation = [
  body('title')
    .isString()
    .withMessage('Title must be a string')
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage('Title must be between 1 and 120 characters')
    .custom(rejectHtmlTags('Title')),
  body('type')
    .isIn(['manga', 'novel', 'comic'])
    .withMessage('Type must be one of manga, novel, comic'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters')
    .custom(rejectHtmlTags('Description')),
  body('coverImageUrl')
    .optional()
    .isString()
    .withMessage('Cover image URL must be a string')
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Cover image URL must be a valid URL'),
  body('genres')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Genres must be an array with up to 20 items'),
  body('genres.*')
    .optional()
    .isString()
    .withMessage('Each genre must be a string')
    .trim()
    .isLength({ min: 1, max: 40 })
    .withMessage('Each genre must be between 1 and 40 characters')
    .custom(rejectHtmlTags('Genre')),
  body('tags')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Tags must be an array with up to 20 items'),
  body('tags.*')
    .optional()
    .isString()
    .withMessage('Each tag must be a string')
    .trim()
    .isLength({ min: 1, max: 40 })
    .withMessage('Each tag must be between 1 and 40 characters')
    .custom(rejectHtmlTags('Tag')),
  body('status')
    .isIn(['ongoing', 'completed', 'hiatus'])
    .withMessage('Status must be one of ongoing, completed, hiatus'),
  body('language')
    .optional()
    .isString()
    .withMessage('Language must be a string')
    .trim()
    .isLength({ min: 1, max: 40 })
    .withMessage('Language must be between 1 and 40 characters')
    .custom(rejectHtmlTags('Language')),
  body('contentWarnings')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Content warnings must be an array with up to 20 items'),
  body('contentWarnings.*')
    .optional()
    .isString()
    .withMessage('Each content warning must be a string')
    .trim()
    .isLength({ min: 1, max: 80 })
    .withMessage('Each content warning must be between 1 and 80 characters')
    .custom(rejectHtmlTags('Content warning')),
  checkExact([], { message: 'Unexpected fields are not allowed' }),
];

export const workUpdateValidation = [
  idParamValidation('id'),
  body().custom((_, { req }) => {
    const hasAllowedField = WORK_FIELDS.some((field) =>
      Object.prototype.hasOwnProperty.call(req.body, field)
    );
    if (!hasAllowedField) {
      throw new Error('At least one updatable field is required');
    }
    return true;
  }),
  body('title')
    .optional()
    .isString()
    .withMessage('Title must be a string')
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage('Title must be between 1 and 120 characters')
    .custom(rejectHtmlTags('Title')),
  body('type')
    .optional()
    .isIn(['manga', 'novel', 'comic'])
    .withMessage('Type must be one of manga, novel, comic'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters')
    .custom(rejectHtmlTags('Description')),
  body('coverImageUrl')
    .optional()
    .isString()
    .withMessage('Cover image URL must be a string')
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Cover image URL must be a valid URL'),
  body('genres')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Genres must be an array with up to 20 items'),
  body('genres.*')
    .optional()
    .isString()
    .withMessage('Each genre must be a string')
    .trim()
    .isLength({ min: 1, max: 40 })
    .withMessage('Each genre must be between 1 and 40 characters')
    .custom(rejectHtmlTags('Genre')),
  body('tags')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Tags must be an array with up to 20 items'),
  body('tags.*')
    .optional()
    .isString()
    .withMessage('Each tag must be a string')
    .trim()
    .isLength({ min: 1, max: 40 })
    .withMessage('Each tag must be between 1 and 40 characters')
    .custom(rejectHtmlTags('Tag')),
  body('status')
    .optional()
    .isIn(['ongoing', 'completed', 'hiatus'])
    .withMessage('Status must be one of ongoing, completed, hiatus'),
  body('language')
    .optional()
    .isString()
    .withMessage('Language must be a string')
    .trim()
    .isLength({ min: 1, max: 40 })
    .withMessage('Language must be between 1 and 40 characters')
    .custom(rejectHtmlTags('Language')),
  body('contentWarnings')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Content warnings must be an array with up to 20 items'),
  body('contentWarnings.*')
    .optional()
    .isString()
    .withMessage('Each content warning must be a string')
    .trim()
    .isLength({ min: 1, max: 80 })
    .withMessage('Each content warning must be between 1 and 80 characters')
    .custom(rejectHtmlTags('Content warning')),
  checkExact([], { message: 'Unexpected fields are not allowed' }),
];

export const chapterCreateValidation = [
  idParamValidation('workId'),
  body('chapterNumber')
    .isInt({ min: 1, max: 100000 })
    .withMessage('Chapter number must be a positive integer'),
  body('title')
    .isString()
    .withMessage('Title must be a string')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters')
    .custom(rejectHtmlTags('Title')),
  body('content').custom((value) => {
    if (!isValidContent(value)) {
      throw new Error(
        'Content must be non-empty text or a non-empty array of valid image URLs'
      );
    }
    return true;
  }),
  checkExact([], { message: 'Unexpected fields are not allowed' }),
];

export const workModerationValidation = [
  idParamValidation('id'),
  body('moderationStatus')
    .isIn(['published', 'rejected'])
    .withMessage('moderationStatus must be published or rejected'),
  checkExact([], { message: 'Unexpected fields are not allowed' }),
];

export const adminUserCreateValidation = [
  body('username')
    .isString()
    .withMessage('Username must be a string')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscore')
    .custom(rejectHtmlTags('Username')),
  body('password')
    .isString()
    .withMessage('Password must be a string')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be user or admin'),
  checkExact([], { message: 'Unexpected fields are not allowed' }),
];

export const adminUserUpdateValidation = [
  idParamValidation('id'),
  body().custom((_, { req }) => {
    const hasAllowedField = ADMIN_USER_FIELDS.some((field) =>
      Object.prototype.hasOwnProperty.call(req.body, field)
    );
    if (!hasAllowedField) {
      throw new Error('At least one updatable field is required');
    }
    return true;
  }),
  body('username')
    .optional()
    .isString()
    .withMessage('Username must be a string')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscore')
    .custom(rejectHtmlTags('Username')),
  body('password')
    .optional()
    .isString()
    .withMessage('Password must be a string')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be user or admin'),
  checkExact([], { message: 'Unexpected fields are not allowed' }),
];

export const chapterUpdateValidation = [
  idParamValidation('id'),
  body().custom((_, { req }) => {
    const hasAllowedField =
      Object.prototype.hasOwnProperty.call(req.body, 'title') ||
      Object.prototype.hasOwnProperty.call(req.body, 'content');
    if (!hasAllowedField) {
      throw new Error('At least one updatable field is required');
    }
    return true;
  }),
  body('title')
    .optional()
    .isString()
    .withMessage('Title must be a string')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters')
    .custom(rejectHtmlTags('Title')),
  body('content')
    .optional()
    .custom((value) => {
      if (!isValidContent(value)) {
        throw new Error(
          'Content must be non-empty text or a non-empty array of valid image URLs'
        );
      }
      return true;
    }),
  checkExact([], { message: 'Unexpected fields are not allowed' }),
];

export const commentCreateValidation = [
  idParamValidation('id'),
  body('text')
    .isString()
    .withMessage('Comment must be a string')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
    .custom(rejectHtmlTags('Comment')),
  checkExact([], { message: 'Unexpected fields are not allowed' }),
];

export const feedbackCreateValidation = [
  body('name')
    .isString()
    .withMessage('Name must be a string')
    .trim()
    .isLength({ min: 1, max: 80 })
    .withMessage('Name must be between 1 and 80 characters')
    .custom(rejectHtmlTags('Name')),
  body('email')
    .isEmail()
    .withMessage('Email is invalid')
    .normalizeEmail(),
  body('message')
    .isString()
    .withMessage('Message must be a string')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters')
    .custom(rejectHtmlTags('Message')),
  checkExact([], { message: 'Unexpected fields are not allowed' }),
];
