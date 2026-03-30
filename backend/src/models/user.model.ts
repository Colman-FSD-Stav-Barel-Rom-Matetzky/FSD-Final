import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, sparse: true },
    username: { type: String, required: true },
    password: { type: String },
    profileImage: { type: String },
    isGoogleUser: { type: Boolean, default: false },
    refreshTokens: { type: [String], default: [] },
  },
  { timestamps: true },
);

export interface IUser extends mongoose.Document {
  email?: string;
  username: string;
  password?: string;
  profileImage?: string;
  isGoogleUser?: boolean;
  refreshTokens: string[];
}

export const User = mongoose.model<IUser>('user', userSchema);
