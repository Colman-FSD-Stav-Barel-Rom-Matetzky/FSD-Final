import fs from 'fs';
import path from 'path';
import multer from 'multer';

const postsUploadsDir = path.join(process.cwd(), 'uploads', 'posts');
const profilesUploadsDir = path.join(process.cwd(), 'uploads', 'profiles');

fs.mkdirSync(postsUploadsDir, { recursive: true });
fs.mkdirSync(profilesUploadsDir, { recursive: true });

const createStorage = (destinationDir: string) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, destinationDir);
    },
    filename: (_req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`);
    },
  });

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/gif']);

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (allowedMimeTypes.has(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(new Error('Only JPEG, PNG, and GIF image files are allowed'));
};

const postUpload = multer({
  storage: createStorage(postsUploadsDir),
  fileFilter,
});
const profileUpload = multer({
  storage: createStorage(profilesUploadsDir),
  fileFilter,
});

export const uploadPostImage = postUpload.single('image');
export const uploadProfileImage = profileUpload.single('profileImage');
