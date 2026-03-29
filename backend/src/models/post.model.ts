import mongoose from 'mongoose';

export interface IPost extends mongoose.Document {
  content: string;
  image?: string;
  owner: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const postSchema = new mongoose.Schema<IPost>(
  {
    content: { type: String, required: true },
    image: { type: String },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
    ],
  },
  { timestamps: true },
);

export const Post = mongoose.model<IPost>('post', postSchema);
