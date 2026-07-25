const multer = require('multer');
const path = require('path');

const ALLOWED_TYPES = {
  sds: ['.pdf', '.docx', '.doc', '.png', '.jpg', '.jpeg', '.tiff'],
  image: ['.png', '.jpg', '.jpeg', '.webp'],
};

const MAX_SIZE_MB = 20;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

// Memory storage is correct for Supabase/Cloud storage flows
const storage = multer.memoryStorage();

const fileFilter = (allowedExtensions) => (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    // Create a specific error for the filter
    const error = new Error(`File type ${ext} not allowed.`);
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

// --- Multer Instances ---

const uploadSdsInstance = multer({
  storage,
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter: fileFilter(ALLOWED_TYPES.sds),
}).single('file'); // FRONTEND MUST USE 'file' AS KEY

const uploadBulkSdsInstance = multer({
  storage,
  limits: { fileSize: MAX_SIZE_BYTES, files: 500 },
  fileFilter: fileFilter(ALLOWED_TYPES.sds),
}).array('files', 500); // FRONTEND MUST USE 'files' AS KEY

// --- Middleware Wrappers (The Fix for 500 Errors) ---

const handleSdsUpload = (req, res, next) => {
  uploadSdsInstance(req, res, (err) => {
    // 1. Handle Multer-specific errors (size limit, wrong field name)
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: `Multer Error: ${err.message}`,
        code: err.code
      });
    } 
    
    // 2. Handle Custom Filter errors (invalid extension)
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
        code: err.code || 'UPLOAD_ERROR'
      });
    }

    // 3. Prevent 500 in Controller: Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please attach a file with the key "file".'
      });
    }

    next();
  });
};

const handleBulkUpload = (req, res, next) => {
  uploadBulkSdsInstance(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded.' });
    }

    next();
  });
};

module.exports = { handleSdsUpload, handleBulkUpload };