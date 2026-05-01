import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo imágenes permitidas'), false);
  }
};

export const uploadMiddlewareCloud = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});