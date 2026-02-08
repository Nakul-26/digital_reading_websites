import express, { Request, NextFunction } from 'express';
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

// @route   POST /chapters/:id/view
// @desc    Increment chapter views
// @access  Public
router.post('/:id/view', async (req, res, next: NextFunction) => {
  try {
    const chapter = await Chapter.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).select('views');

    if (!chapter) {
      throw new HttpError(404, 'Chapter not found');
    }

    res.json({ views: chapter.views });
  } catch (err: any) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      next(new HttpError(404, 'Chapter not found'));
    } else {
      next(err);
    }
  }
});

// @route   POST /chapters/:id/like
// @desc    Like a chapter
// @access  Private
router.post('/:id/like', auth, async (req: AuthRequest, res: any, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new HttpError(401, 'Not authorized');
    }

    const chapter = await Chapter.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { likes: req.user.id } },
      { new: true }
    ).select('likes');

    if (!chapter) {
      throw new HttpError(404, 'Chapter not found');
    }

    res.json({ likesCount: chapter.likes.length });
  } catch (err: any) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      next(new HttpError(404, 'Chapter not found'));
    } else {
      next(err);
    }
  }
});

// @route   DELETE /chapters/:id/like
// @desc    Unlike a chapter
// @access  Private
router.delete('/:id/like', auth, async (req: AuthRequest, res: any, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new HttpError(401, 'Not authorized');
    }

    const chapter = await Chapter.findByIdAndUpdate(
      req.params.id,
      { $pull: { likes: req.user.id } },
      { new: true }
    ).select('likes');

    if (!chapter) {
      throw new HttpError(404, 'Chapter not found');
    }

    res.json({ likesCount: chapter.likes.length });
  } catch (err: any) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      next(new HttpError(404, 'Chapter not found'));
    } else {
      next(err);
    }
  }
});

// @route   POST /chapters/:id/comments
// @desc    Add a comment to a chapter
// @access  Private
router.post(
  '/:id/comments',
  [auth, [check('text', 'Comment text is required').not().isEmpty()]],
  async (req: AuthRequest, res: any, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new HttpError(400, 'Validation failed', errors.array());
    }

    try {
      if (!req.user) {
        throw new HttpError(401, 'Not authorized');
      }

      const chapter = await Chapter.findById(req.params.id);
      if (!chapter) {
        throw new HttpError(404, 'Chapter not found');
      }

      chapter.comments.unshift({
        user: req.user.id as any,
        username: req.user.username,
        text: req.body.text,
        createdAt: new Date(),
      });

      await chapter.save();

      res.json(chapter.comments);
    } catch (err: any) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        next(new HttpError(404, 'Chapter not found'));
      } else {
        next(err);
      }
    }
  }
);

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
