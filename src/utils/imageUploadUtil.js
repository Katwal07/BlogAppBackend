const multer = require("multer");
const path = require("path");

/// Storage Configuration.
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/blogs");
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, req.user.id + "_" + Date.now() + ext);
    },
});

/// File filter (only image)
// const fileFilter = (req, file, cb) => {
//     if (file.mimetype.startWith("images/")) {
//         cb(null, true);
//     }
//     else {
//         cb(new Error("only image file are allowed"), false);
//     }
// }

/// Limit : 2mb
const upload = multer({
    storage,
   // fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
});

module.exports = upload;