import express, { Request } from 'express';
import { check, validationResult } from 'express-validator';
import auth from '../middleware/auth';
import Work, { IWork } from '../models/Work';
import User from '../models/User';
import Chapter, { IChapter } from '../models/Chapter';

import { IUser } from '../models/User';
import { HttpError } from '../utils/HttpError';

const router = express.Router();

interface AuthRequest extends Request {
  user?: IUser;
}

// @route   POST /works
// @desc    Create a work
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('type', 'Type is required').isIn(['manga', 'novel', 'comic']),
      check('status', 'Status is required').isIn(['ongoing', 'completed', 'hiatus']),
      check('isPublished', 'isPublished is required').isBoolean(),
    ],
  ],
  async (req: AuthRequest, res: any, next: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new HttpError(400, 'Validation failed', errors.array());
    }

    const { title, type, description, coverImageUrl, genres, tags, status, language, isPublished, contentWarnings } = req.body;

    try {
      const newWork: IWork = new Work({
        title,
        type,
        description,
        coverImageUrl,
        author: req.user!.id,
        genres,
        tags,
        status,
        language,
        isPublished,
        contentWarnings,
      });

      const work = await newWork.save();
      res.json(work);
    } catch (err: any) {
      console.error(err.message);
      next(err);
    }
  }
);


// @route   GET /works
// @desc    Get all works
// @access  Public
router.get('/', auth, async (req: AuthRequest, res: any, next: any) => {
  try {
    const works = await Work.find({ isPublished: true }).populate('author', ['_id', 'username']);
    res.json(works);
  } catch (err: any) {
    console.error(err.message);
    next(err);
  }
});

// @route   GET /works/my-works
// @desc    Get current user's works
// @access  Private
router.get('/my-works', auth, async (req: AuthRequest, res: any, next: any) => {
  try {
    const works = await Work.find({ author: req.user!.id }).populate('author', ['_id', 'username']);
    res.json(works);
  } catch (err: any) {
    console.error(err.message);
    next(err);
  }
});

// @route   GET /works/:id
// @desc    Get work by ID
// @access  Public
router.get('/:id', async (req: AuthRequest, res: any, next: any) => {
  try {
    const work = await Work.findById(req.params.id).populate('author', ['_id', 'username']);
    if (!work) {
      throw new HttpError(404, 'Work not found');
    }

    // If work is not published, check authorization
    if (!work.isPublished) {
      // If user is not authenticated or not the author/admin, deny access (return 404 for obscurity)
      if (!req.user || (work.author.toString() !== req.user.id && req.user.role !== 'admin')) {
        throw new HttpError(404, 'Work not found'); // Treat as not found to avoid leaking info
      }
    }
    res.json(work);
  } catch (err: any) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      next(new HttpError(404, 'Work not found'));
    } else {
      next(err);
    }
  }
});

// @route   GET /works/:workId/chapters
// @desc    Get all chapters for a work
// @access  Public
router.get('/:workId/chapters', async (req, res, next: any) => {
  try {
    const chapters = await Chapter.find({ work: req.params.workId }).sort({ chapterNumber: 1 });
    res.json(chapters);
  } catch (err: any) {
    console.error(err.message);
    next(err);
  }
});

// @route   POST /works/:workId/chapters
// @desc    Create a chapter for a work
// @access  Private
router.post(
  '/:workId/chapters',
  [
    auth,
    [
      check('chapterNumber', 'Chapter number is required').not().isEmpty().isNumeric(),
      check('title', 'Title is required').not().isEmpty(),
      check('content', 'Content is required').not().isEmpty(),
    ],
  ],
  async (req: AuthRequest, res: any, next: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new HttpError(400, 'Validation failed', errors.array());
    }

    const { chapterNumber, title, content } = req.body;
    const { workId } = req.params;

    try {
      const work = await Work.findById(workId);
    if (!work) {
      throw new HttpError(404, 'Work not found');
    }

      // Check if the user owns the work or is an admin
      if (work.author.toString() !== req.user!.id && req.user!.role !== 'admin') {
        throw new HttpError(401, 'User not authorized');
      }

      const newChapter: IChapter = new Chapter({
        work: workId,
        chapterNumber,
        title,
        content,
      });

      const chapter = await newChapter.save();
      res.json(chapter);
    } catch (err: any) {
      console.error(err.message);
      next(err);
    }
  }
);

// @route   PUT /works/:id
// @desc    Update a work
// @access  Private
router.put('/:id', auth, async (req: AuthRequest, res: any, next: NextFunction) => {
  const { title, description, coverImageUrl, genres, tags, status, language, isPublished, contentWarnings } = req.body;

  // Build work object
  const workFields: any = {};
  if (req.body.hasOwnProperty('title')) workFields.title = title;
  if (req.body.hasOwnProperty('description')) workFields.description = description;
  if (req.body.hasOwnProperty('coverImageUrl')) workFields.coverImageUrl = coverImageUrl;
  if (req.body.hasOwnProperty('genres')) workFields.genres = genres;
  if (req.body.hasOwnProperty('tags')) workFields.tags = tags;
  if (req.body.hasOwnProperty('status')) workFields.status = status;
  if (req.body.hasOwnProperty('language')) workFields.language = language;
  if (req.body.hasOwnProperty('isPublished')) workFields.isPublished = isPublished;
  if (req.body.hasOwnProperty('contentWarnings')) workFields.contentWarnings = contentWarnings;

  try {
    let work = await Work.findById(req.params.id);

    if (!work) throw new HttpError(404, 'Work not found');

    // Make sure user owns work or is an admin
    if (work.author.toString() !== req.user!.id && req.user!.role !== 'admin') {
      throw new HttpError(401, 'Not authorized');
    }

    work = await Work.findByIdAndUpdate(
      req.params.id,
      { $set: workFields },
      { new: true }
    );

    res.json(work);
  } catch (err: any) {
    console.error('Error updating work:', err.message);
    next(err);
  }
});


// @route   DELETE /works/:id
// @desc    Delete a work
// @access  Private
router.delete('/:id', auth, async (req: AuthRequest, res: any, next: any) => {
  try {
    const work = await Work.findById(req.params.id);

    if (!work) {
      throw new HttpError(404, 'Work not found');
    }

    // Check user or admin
    if (work.author.toString() !== req.user!.id && req.user!.role !== 'admin') {
      throw new HttpError(401, 'User not authorized');
    }

    await Chapter.deleteMany({ work: req.params.id });
    await work.deleteOne();

    res.json({ msg: 'Work removed' });
  } catch (err: any) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      next(new HttpError(404, 'Work not found'));
    } else {
      next(err);
    }
  }
});

export default router;