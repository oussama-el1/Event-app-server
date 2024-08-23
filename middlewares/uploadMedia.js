const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let eventDir;
    if (req.params.id) {
      // This is for update where the event ID is available
      const eventID = req.params.id;
      eventDir = path.resolve(`/tmp/event-app/events/${eventID}/`);
    } else {
      // This is for create where we use a temporary folder
      eventDir = path.resolve(`/tmp/event-app/temp/`);
    }

    if (!fs.existsSync(eventDir)) {
      fs.mkdirSync(eventDir, { recursive: true });
    }

    req.uploadDir = eventDir; // Save the directory for later use in the controller
    cb(null, eventDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, `${baseName}-${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mpeg', 'video/quicktime'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  fileFilter
}).array('media', 10);

module.exports = upload;
