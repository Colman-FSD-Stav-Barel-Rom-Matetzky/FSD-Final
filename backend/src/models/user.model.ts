import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, sparse: true },
    username: { type: String, required: true, unique: true },
    password: { type: String },
    profileImage: { type: String },
    refreshTokens: { type: [String], default: [] },
  },
  { timestamps: true },
);

export interface IUser extends mongoose.Document {
  email?: string;
  username: string;
  password?: string;
  profileImage?: string;
  refreshTokens: string[];
}

export const User = mongoose.model<IUser>('user', userSchema);
