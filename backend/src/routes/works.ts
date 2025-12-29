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
    // auth, // Temporarily disabled for testing
    [
      check('title', 'Title is required').not().isEmpty(),
      check('type', 'Type is required').isIn(['manga', 'novel', 'comic']),
    ],
  ],
  async (req: AuthRequest, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, type, description, coverImage } = req.body;

    try {
      let user = await User.findOne();
      if (!user) {
        user = new User({ username: 'testuser', password: 'password' });
        await user.save();
      }
      
      const newWork: IWork = new Work({
        title,
        type,
        description,
        coverImage,
        author: user.id, // Use dummy user
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
    const works = await Work.find().populate('author', ['username']);
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
    const work = await Work.findById(req.params.id).populate('author', ['username']);
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
    // auth, // Temporarily disabled for testing
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
      // if (work.author.toString() !== req.user!.id) {
      //   return res.status(401).json({ msg: 'User not authorized' });
      // }

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

export default router;
