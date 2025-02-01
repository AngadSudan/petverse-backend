import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        // Navigate to public folder from middlewares directory
        const publicPath = path.join(__dirname, '../public');
        cb(null, publicPath);
    },
    filename: function (_req, file, cb) {
        // Keep original filename
        cb(null, file.originalname);
    },
});

// Create multer upload instance with just the storage configuration
const upload = multer({ storage: storage });

export default upload;
