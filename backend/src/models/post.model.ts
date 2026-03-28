import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPost extends Document {
  content: string;
  author: Types.ObjectId;
  images?: string[];
  likes: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const postSchema: Schema = new Schema(
  {
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    images: [{ type: String }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

export const Post = mongoose.model<IPost>('Post', postSchema);
