import express, { NextFunction, Request, Response } from 'express';
import auth from '../middleware/auth';
import Chapter from '../models/Chapter';
import { IWork } from '../models/Work';
import { HttpError } from '../utils/HttpError';
import { validateRequest } from '../middleware/validateRequest';
import {
  chapterUpdateValidation,
  commentCreateValidation,
  idParamValidation,
} from '../middleware/validators';
import { IUser } from '../models/User';

const router = express.Router();

interface AuthRequest extends Request {
  user?: IUser;
}

const assertWorkVisibility = (chapterWork: unknown, currentUser?: IUser) => {
  const work = chapterWork as unknown as { author: { toString(): string }; isPublished: boolean };
  if (work.isPublished) {
    return;
  }

  if (!currentUser || (work.author.toString() !== currentUser.id && currentUser.role !== 'admin')) {
    throw new HttpError(404, 'Chapter not found');
  }
};

// @route   GET /chapters/:id
// @desc    Get chapter by ID
// @access  Public
router.get('/:id', auth, idParamValidation('id'), validateRequest, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const chapter = await Chapter.findById(req.params.id).populate('work', 'type author isPublished');
    if (!chapter) {
      throw new HttpError(404, 'Chapter not found');
    }

    assertWorkVisibility(chapter.work, req.user);

    res.json(chapter);
  } catch (err) {
    next(err);
  }
});

// @route   POST /chapters/:id/view
// @desc    Increment chapter views
// @access  Public
router.post('/:id/view', auth, idParamValidation('id'), validateRequest, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const chapter = await Chapter.findById(req.params.id).populate('work', 'author isPublished');

    if (!chapter) {
      throw new HttpError(404, 'Chapter not found');
    }

    assertWorkVisibility(chapter.work, req.user);

    chapter.views += 1;
    await chapter.save();
    res.json({ views: chapter.views });
  } catch (err) {
    next(err);
  }
});

// @route   POST /chapters/:id/like
// @desc    Like a chapter
// @access  Private
router.post('/:id/like', auth, idParamValidation('id'), validateRequest, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      throw new HttpError(401, 'Authentication required');
    }

    const chapter = await Chapter.findById(req.params.id).populate('work', 'author isPublished');

    if (!chapter) {
      throw new HttpError(404, 'Chapter not found');
    }

    assertWorkVisibility(chapter.work, currentUser);

    const alreadyLiked = chapter.likes.some((likeUserId) => likeUserId.toString() === currentUser._id?.toString());
    if (!alreadyLiked) {
      chapter.likes.push(currentUser._id as any);
    }
    await chapter.save();
    res.json({ likesCount: chapter.likes.length });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /chapters/:id/like
// @desc    Unlike a chapter
// @access  Private
router.delete('/:id/like', auth, idParamValidation('id'), validateRequest, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      throw new HttpError(401, 'Authentication required');
    }

    const chapter = await Chapter.findById(req.params.id).populate('work', 'author isPublished');

    if (!chapter) {
      throw new HttpError(404, 'Chapter not found');
    }

    assertWorkVisibility(chapter.work, currentUser);

    chapter.likes = chapter.likes.filter((likeUserId) => likeUserId.toString() !== currentUser._id?.toString());
    await chapter.save();
    res.json({ likesCount: chapter.likes.length });
  } catch (err) {
    next(err);
  }
});

// @route   POST /chapters/:id/comments
// @desc    Add a comment to a chapter
// @access  Private
router.post('/:id/comments', auth, commentCreateValidation, validateRequest, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      throw new HttpError(401, 'Authentication required');
    }

    const chapter = await Chapter.findById(req.params.id).populate('work', 'author isPublished');
    if (!chapter) {
      throw new HttpError(404, 'Chapter not found');
    }

    assertWorkVisibility(chapter.work, currentUser);

    chapter.comments.unshift({
      user: currentUser._id as any,
      username: currentUser.username,
      text: req.body.text,
      createdAt: new Date(),
    });

    await chapter.save();
    res.json(chapter.comments);
  } catch (err) {
    next(err);
  }
});

// @route   PUT /chapters/:id
// @desc    Update a chapter
// @access  Private
router.put('/:id', auth, chapterUpdateValidation, validateRequest, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      throw new HttpError(401, 'Authentication required');
    }

    const chapterFields: Record<string, unknown> = {};
    if (Object.prototype.hasOwnProperty.call(req.body, 'title')) {
      chapterFields.title = req.body.title;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'content')) {
      chapterFields.content = req.body.content;
    }

    const chapter = await Chapter.findById(req.params.id).populate('work');
    if (!chapter) {
      throw new HttpError(404, 'Chapter not found');
    }

    const workAuthorId = ((chapter.work as unknown as IWork).author as unknown as { toString(): string }).toString();
    if (workAuthorId !== currentUser.id) {
      throw new HttpError(401, 'Not authorized');
    }

    const updatedChapter = await Chapter.findByIdAndUpdate(req.params.id, { $set: chapterFields }, { new: true });
    res.json(updatedChapter);
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /chapters/:id
// @desc    Delete a chapter
// @access  Private
router.delete('/:id', auth, idParamValidation('id'), validateRequest, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      throw new HttpError(401, 'Authentication required');
    }

    const chapter = await Chapter.findById(req.params.id).populate('work');
    if (!chapter) {
      throw new HttpError(404, 'Chapter not found');
    }

    const workAuthorId = ((chapter.work as unknown as IWork).author as unknown as { toString(): string }).toString();
    if (workAuthorId !== currentUser.id) {
      throw new HttpError(401, 'User not authorized');
    }

    await chapter.deleteOne();
    res.json({ msg: 'Chapter removed' });
  } catch (err) {
    next(err);
  }
});

export default router;
