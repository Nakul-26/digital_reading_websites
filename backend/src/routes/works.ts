import express, { Request } from 'express';
import { check, validationResult } from 'express-validator';
import auth from '../middleware/auth';
import Work, { IWork } from '../models/Work';
import User from '../models/User';
import Chapter, { IChapter } from '../models/Chapter';

const router = express.Router();

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
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
  async (req: AuthRequest, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
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
      res.status(500).send('Server Error');
    }
  }
);


// @route   GET /works
// @desc    Get all works
// @access  Public
router.get('/', async (req, res) => {
  try {
    const works = await Work.find().populate('author', ['_id', 'username']);
    res.json(works);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /works/my-works
// @desc    Get current user's works
// @access  Private
router.get('/my-works', auth, async (req: AuthRequest, res: any) => {
  try {
    const works = await Work.find({ author: req.user!.id }).populate('author', ['_id', 'username']);
    res.json(works);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /works/:id
// @desc    Get work by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const work = await Work.findById(req.params.id).populate('author', ['_id', 'username']);
    if (!work) {
      return res.status(404).json({ msg: 'Work not found' });
    }
    res.json(work);
  } catch (err: any) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Work not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET /works/:workId/chapters
// @desc    Get all chapters for a work
// @access  Public
router.get('/:workId/chapters', async (req, res) => {
  try {
    const chapters = await Chapter.find({ work: req.params.workId }).sort({ chapterNumber: 1 });
    res.json(chapters);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
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
  async (req: AuthRequest, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { chapterNumber, title, content } = req.body;
    const { workId } = req.params;

    try {
      const work = await Work.findById(workId);
      if (!work) {
        return res.status(404).json({ msg: 'Work not found' });
      }

      // Check if the user owns the work
      if (work.author.toString() !== req.user!.id) {
        return res.status(401).json({ msg: 'User not authorized' });
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
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT /works/:id
// @desc    Update a work
// @access  Private
router.put('/:id', auth, async (req: AuthRequest, res: any) => {
  const { title, description, coverImageUrl, genres, tags, status, language, isPublished, contentWarnings } = req.body;

  // Build work object
  const workFields: any = {};
  if (title) workFields.title = title;
  if (description) workFields.description = description;
  if (coverImageUrl) workFields.coverImageUrl = coverImageUrl;
  if (genres) workFields.genres = genres;
  if (tags) workFields.tags = tags;
  if (status) workFields.status = status;
  if (language) workFields.language = language;
  if (isPublished) workFields.isPublished = isPublished;
  if (contentWarnings) workFields.contentWarnings = contentWarnings;

  try {
    let work = await Work.findById(req.params.id);

    if (!work) return res.status(404).json({ msg: 'Work not found' });

    // Make sure user owns work
    if (work.author.toString() !== req.user!.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    work = await Work.findByIdAndUpdate(
      req.params.id,
      { $set: workFields },
      { new: true }
    );

    res.json(work);
  } catch (err: any) {
    console.error('Error updating work:', err.message);
    res.status(500).send('Server Error');
  }
});


// @route   DELETE /works/:id
// @desc    Delete a work
// @access  Private
router.delete('/:id', auth, async (req: AuthRequest, res: any) => {
  try {
    const work = await Work.findById(req.params.id);

    if (!work) {
      return res.status(404).json({ msg: 'Work not found' });
    }

    // Check user
    if (work.author.toString() !== req.user!.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Chapter.deleteMany({ work: req.params.id });
    await work.deleteOne();

    res.json({ msg: 'Work removed' });
  } catch (err: any) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Work not found' });
    }
    res.status(500).send('Server Error');
  }
});

export default router;