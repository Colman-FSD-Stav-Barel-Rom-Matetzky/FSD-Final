import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const createDirIfNotExists = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const profilesDir = path.join(__dirname, '../../uploads/profiles');
const postsDir = path.join(__dirname, '../../uploads/posts');

createDirIfNotExists(profilesDir);
createDirIfNotExists(postsDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Decide destination based on the route
    if (req.baseUrl.includes('users')) {
      cb(null, profilesDir);
    } else if (req.baseUrl.includes('posts')) {
      cb(null, postsDir);
    } else {
      cb(null, path.join(__dirname, '../../uploads'));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  // Accept only images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'));
  }
};

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});
