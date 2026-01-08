import mongoose, { Document, Schema } from 'mongoose';

export interface IWork extends Document {
  title: string;
  type: 'novel' | 'manga' | 'comic';
  author: Schema.Types.ObjectId;
  description?: string;
  coverImageUrl?: string;
  genres?: string[];
  tags?: string[];
  status: 'ongoing' | 'completed' | 'hiatus'; // reader-facing
  language?: string;
  isPublished: boolean; // visibility control
  contentWarnings?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const WorkSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['novel', 'manga', 'comic'],
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: String,
    coverImageUrl: String,
    genres: [String],
    tags: [String],
    status: {
      type: String,
      enum: ['ongoing', 'completed', 'hiatus'],
      default: 'ongoing',
    },
    language: String,
    isPublished: {
      type: Boolean,
      default: false,
    },
    contentWarnings: [String],
  },
  { timestamps: true }
);

WorkSchema.index({ title: 1 });
WorkSchema.index({ author: 1 });
WorkSchema.index({ isPublished: 1 });

export default mongoose.model<IWork>('Work', WorkSchema);
