import express, { NextFunction, Request, Response } from 'express';
import auth from '../middleware/auth';
import Work, { IWork } from '../models/Work';
import Chapter, { IChapter } from '../models/Chapter';
import { IUser } from '../models/User';
import { HttpError } from '../utils/HttpError';
import { validateRequest } from '../middleware/validateRequest';
import {
  chapterCreateValidation,
  idParamValidation,
  workCreateValidation,
  workUpdateValidation,
} from '../middleware/validators';

const router = express.Router();

const updatableWorkFields = [
  'title',
  'type',
  'description',
  'coverImageUrl',
  'genres',
  'tags',
  'status',
  'language',
  'isPublished',
  'contentWarnings',
] as const;

interface AuthRequest extends Request {
  user?: IUser;
}

// @route   POST /works
// @desc    Create a work
// @access  Private
router.post('/', auth, workCreateValidation, validateRequest, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      throw new HttpError(401, 'Authentication required');
    }

    const {
      title,
      type,
      description,
      coverImageUrl,
      genres,
      tags,
      status,
      language,
      isPublished,
      contentWarnings,
    } = req.body;

    const newWork: IWork = new Work({
      title,
      type,
      description,
      coverImageUrl,
      author: currentUser._id,
      genres,
      tags,
      status,
      language,
      isPublished,
      contentWarnings,
    });

    const work = await newWork.save();
    res.json(work);
  } catch (err) {
    next(err);
  }
});

// @route   GET /works
// @desc    Get all works
// @access  Public
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const works = await Work.find({ isPublished: true }).populate('author', ['_id', 'username']);
    const workIds = works.map((work) => work._id);
    const viewStats = await Chapter.aggregate<{ _id: unknown; totalViews: number }>([
      { $match: { work: { $in: workIds } } },
      { $group: { _id: '$work', totalViews: { $sum: '$views' } } },
    ]);

    const viewsByWorkId = new Map(
      viewStats.map((stat) => [String(stat._id), stat.totalViews || 0])
    );

    const worksWithViews = works.map((work) => {
      const workObject = work.toObject();
      return {
        ...workObject,
        views: viewsByWorkId.get(String(work._id)) || 0,
      };
    });

    res.json(worksWithViews);
  } catch (err) {
    next(err);
  }
});

// @route   GET /works/my-works
// @desc    Get current user's works
// @access  Private
router.get('/my-works', auth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      throw new HttpError(401, 'Authentication required');
    }

    const works = await Work.find({ author: currentUser._id as any }).populate('author', ['_id', 'username']);
    res.json(works);
  } catch (err) {
    next(err);
  }
});

// @route   GET /works/:id
// @desc    Get work by ID
// @access  Public
router.get('/:id', auth, idParamValidation('id'), validateRequest, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const work = await Work.findById(req.params.id).populate('author', ['_id', 'username']);
    if (!work) {
      throw new HttpError(404, 'Work not found');
    }

    if (!work.isPublished) {
      const currentUser = req.user;
      if (!currentUser || (work.author.toString() !== currentUser.id && currentUser.role !== 'admin')) {
        throw new HttpError(404, 'Work not found');
      }
    }

    res.json(work);
  } catch (err) {
    next(err);
  }
});

// @route   GET /works/:workId/chapters
// @desc    Get all chapters for a work
// @access  Public
router.get('/:workId/chapters', idParamValidation('workId'), validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const chapters = await Chapter.find({ work: req.params.workId }).sort({ chapterNumber: 1 });
    res.json(chapters);
  } catch (err) {
    next(err);
  }
});

// @route   POST /works/:workId/chapters
// @desc    Create a chapter for a work
// @access  Private
router.post(
  '/:workId/chapters',
  auth,
  chapterCreateValidation,
  validateRequest,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        throw new HttpError(401, 'Authentication required');
      }

      const { chapterNumber, title, content } = req.body;
      const { workId } = req.params;
      const work = await Work.findById(workId);

      if (!work) {
        throw new HttpError(404, 'Work not found');
      }

      if (work.author.toString() !== currentUser.id && currentUser.role !== 'admin') {
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
    } catch (err) {
      next(err);
    }
  }
);

// @route   PUT /works/:id
// @desc    Update a work
// @access  Private
router.put('/:id', auth, workUpdateValidation, validateRequest, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      throw new HttpError(401, 'Authentication required');
    }

    const workFields: Partial<IWork> = {};
    for (const key of updatableWorkFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        (workFields as Record<string, unknown>)[key] = req.body[key];
      }
    }

    let work = await Work.findById(req.params.id);
    if (!work) {
      throw new HttpError(404, 'Work not found');
    }

    if (work.author.toString() !== currentUser.id && currentUser.role !== 'admin') {
      throw new HttpError(401, 'Not authorized');
    }

    work = await Work.findByIdAndUpdate(req.params.id, { $set: workFields }, { new: true });
    res.json(work);
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /works/:id
// @desc    Delete a work
// @access  Private
router.delete('/:id', auth, idParamValidation('id'), validateRequest, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      throw new HttpError(401, 'Authentication required');
    }

    const work = await Work.findById(req.params.id);
    if (!work) {
      throw new HttpError(404, 'Work not found');
    }

    if (work.author.toString() !== currentUser.id && currentUser.role !== 'admin') {
      throw new HttpError(401, 'User not authorized');
    }

    await Chapter.deleteMany({ work: req.params.id });
    await work.deleteOne();

    res.json({ msg: 'Work removed' });
  } catch (err) {
    next(err);
  }
});

export default router;
