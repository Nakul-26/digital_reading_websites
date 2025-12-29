import express, { Request } from 'express';
import { check, validationResult } from 'express-validator';
import auth from '../middleware/auth';
import Chapter, { IChapter } from '../models/Chapter';
import Work from '../models/Work';

const router = express.Router();

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

// @route   GET /chapters/:id
// @desc    Get chapter by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id).populate('work', 'type');
    if (!chapter) {
      return res.status(404).json({ msg: 'Chapter not found' });
    }
    res.json(chapter);
  } catch (err: any) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Chapter not found' });
    }
    res.status(500).send('Server Error');
  }
});

export default router;
