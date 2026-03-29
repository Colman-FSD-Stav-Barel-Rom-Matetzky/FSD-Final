import mongoose from 'mongoose';

export interface IComment extends mongoose.Document {
  content: string;
  owner: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  createdAt: Date;
}

const commentSchema = new mongoose.Schema<IComment>(
  {
    content: { type: String, required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'post',
      required: true,
    },
  },
  { timestamps: true },
);

export const Comment = mongoose.model<IComment>('comment', commentSchema);
