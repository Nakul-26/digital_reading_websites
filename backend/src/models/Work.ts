import mongoose, { Document, Schema } from 'mongoose';

export interface IWork extends Document {
  title: string;
  type: 'manga' | 'novel' | 'comic';
  description?: string;
  coverImage?: string;
  author: Schema.Types.ObjectId;
}

const WorkSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['manga', 'novel', 'comic'],
    required: true,
  },
  description: {
    type: String,
  },
  coverImage: {
    type: String,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

export default mongoose.model<IWork>('Work', WorkSchema);
