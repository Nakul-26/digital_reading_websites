import express, { Request } from 'express';
import { check, validationResult } from 'express-validator';
import auth from '../middleware/auth';
import Work, { IWork } from '../models/Work';

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
    ],
  ],
  async (req: AuthRequest, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, type, description, coverImage } = req.body;

    try {
      const newWork: IWork = new Work({
        title,
        type,
        description,
        coverImage,
        author: req.user!.id,
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

export default router;
