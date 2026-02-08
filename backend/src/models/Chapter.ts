import mongoose, { Document, Schema } from 'mongoose';
import { IWork } from './Work';

export interface IChapter extends Document {
  work: IWork['_id'];
  chapterNumber: number;
  title: string;
  content: string | string[]; // string for novel, array of image URLs for manga/comic
  views: number;
  likes: mongoose.Types.ObjectId[];
  comments: {
    user: mongoose.Types.ObjectId;
    username: string;
    text: string;
    createdAt: Date;
  }[];
}

const ChapterSchema = new Schema({
  work: {
    type: Schema.Types.ObjectId,
    ref: 'Work',
    required: true,
  },
  chapterNumber: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: Schema.Types.Mixed, // To store either a string or an array of strings
    required: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    default: [],
  },
  comments: {
    type: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        username: {
          type: String,
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    default: [],
  },
});

export default mongoose.model<IChapter>('Chapter', ChapterSchema);
