import express, { Request } from 'express';
import { check, validationResult } from 'express-validator';
import auth from '../middleware/auth';
import Chapter, { IChapter } from '../models/Chapter';
import Work, { IWork } from '../models/Work';

const router = express.Router();

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

interface IChapterWithWork extends IChapter {
  work: IWork;
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

// @route   PUT /chapters/:id
// @desc    Update a chapter
// @access  Private
router.put('/:id', auth, async (req: AuthRequest, res: any) => {
    const { title, content } = req.body;
  
    const chapterFields: any = {};
    if (title) chapterFields.title = title;
    if (content) chapterFields.content = content;
  
    try {
      let chapter: IChapterWithWork | null = await Chapter.findById(req.params.id).populate('work');
  
      if (!chapter) return res.status(404).json({ msg: 'Chapter not found' });
  
      if (chapter.work.author.toString() !== req.user!.id) {
        return res.status(401).json({ msg: 'Not authorized' });
      }
  
      const updatedChapter = await Chapter.findByIdAndUpdate(
        req.params.id,
        { $set: chapterFields },
        { new: true }
      );
  
      res.json(updatedChapter);
    } catch (err: any) {
      console.error('Error updating chapter:', err.message);
      res.status(500).send('Server Error');
    }
  });
  

// @route   DELETE /chapters/:id
// @desc    Delete a chapter
// @access  Private
router.delete('/:id', auth, async (req: AuthRequest, res: any) => {
    try {
        const chapter: IChapterWithWork | null = await Chapter.findById(req.params.id).populate('work');

        if (!chapter) {
            return res.status(404).json({ msg: 'Chapter not found' });
        }

        if (chapter.work.author.toString() !== req.user!.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await chapter.deleteOne();

        res.json({ msg: 'Chapter removed' });
    } catch (err: any) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Chapter not found' });
        }
        res.status(500).send('Server Error');
    }
});

export default router;
