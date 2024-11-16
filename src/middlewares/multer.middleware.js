import multer from "multer";

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./public/temp"); // Set the destination folder for uploaded files
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname); // Use the original file name for the upload
    }
});

export const upload = multer({
    storage,
});