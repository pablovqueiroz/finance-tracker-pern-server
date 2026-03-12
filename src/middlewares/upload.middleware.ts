import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, //2MB
  },
  fileFilter: (_req, file, callback) => {
    const allowedMimeTypes = ["image/jpeg", "image/png"];

    if (allowedMimeTypes.includes(file.mimetype)) {
      return callback(null, true);
    }

    return callback(new Error("Only JPG and PNG image uploads are allowed."));
  },
});

export default upload;
