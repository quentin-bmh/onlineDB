// config/multerConfig.js
const multer = require('multer');
const path = require('path');

const upload = multer({
  dest: path.join(__dirname, '../uploads/'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
    cb(null, allowed.includes(file.mimetype));
  }
});

module.exports = { upload };
