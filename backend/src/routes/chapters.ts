import express, { Request } from 'express';
import { check, validationResult } from 'express-validator';
import auth from '../middleware/auth';
import Chapter, { IChapter } from '../models/Chapter';
import Work, { IWork } from '../models/Work';
import { HttpError } from '../utils/HttpError';

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
router.get('/:id', async (req, res, next: NextFunction) => {
  try {
    const chapter = await Chapter.findById(req.params.id).populate('work', 'type');
    if (!chapter) {
      throw new HttpError(404, 'Chapter not found');
    }
    res.json(chapter);
  } catch (err: any) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      next(new HttpError(404, 'Chapter not found'));
    } else {
      next(err);
    }
  }
});

// @route   PUT /chapters/:id
// @desc    Update a chapter
// @access  Private
router.put('/:id', auth, async (req: AuthRequest, res: any, next: NextFunction) => {
    const { title, content } = req.body;
  
    const chapterFields: any = {};
    if (title) chapterFields.title = title;
    if (content) chapterFields.content = content;
  
    try {
      let chapter: IChapterWithWork | null = await Chapter.findById(req.params.id).populate('work');
  
      if (!chapter) throw new HttpError(404, 'Chapter not found');
  
      if (chapter.work.author.toString() !== req.user!.id) {
        throw new HttpError(401, 'Not authorized');
      }
  
      const updatedChapter = await Chapter.findByIdAndUpdate(
        req.params.id,
        { $set: chapterFields },
        { new: true }
      );
  
      res.json(updatedChapter);
    } catch (err: any) {
      console.error('Error updating chapter:', err.message);
      next(err);
    }
  });
  

// @route   DELETE /chapters/:id
// @desc    Delete a chapter
// @access  Private
router.delete('/:id', auth, async (req: AuthRequest, res: any, next: NextFunction) => {
    try {
        const chapter: IChapterWithWork | null = await Chapter.findById(req.params.id).populate('work');

        if (!chapter) {
            throw new HttpError(404, 'Chapter not found');
        }

        if (chapter.work.author.toString() !== req.user!.id) {
            throw new HttpError(401, 'User not authorized');
        }

        await chapter.deleteOne();

        res.json({ msg: 'Chapter removed' });
    } catch (err: any) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            next(new HttpError(404, 'Chapter not found'));
        } else {
            next(err);
        }
    }
});

export default router;
