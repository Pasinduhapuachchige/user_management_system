import multer from 'multer';
import path from 'path';
import fs from 'fs-extra'; // ✅ import fs-extra

// Set storage engine (shared between image and PDF uploads)
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadPath = path.join('src', 'uploads');

        try {
            // ✅ Ensure the folder exists
            await fs.ensureDir(uploadPath);
            cb(null, uploadPath);
        } catch (err) {
            cb(err);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

// Image-only filter (used for profile pictures)
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

// PDF-only filter (used for birth certificates)
const pdfFileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

export const upload = multer({ storage, fileFilter: imageFileFilter });
export const uploadPdf = multer({ storage, fileFilter: pdfFileFilter });
