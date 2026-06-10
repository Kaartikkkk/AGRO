const express = require('express');
const { register, login, updateUserProfile, uploadAvatar } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/multer.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/profile', protect, updateUserProfile);
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);

module.exports = router;
