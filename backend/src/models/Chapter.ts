import mongoose, { Document, Schema } from 'mongoose';
import { IWork } from './Work';

export interface IChapter extends Document {
  work: IWork['_id'];
  chapterNumber: number;
  title: string;
  content: string | string[]; // string for novel, array of image URLs for manga/comic
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
});

export default mongoose.model<IChapter>('Chapter', ChapterSchema);
