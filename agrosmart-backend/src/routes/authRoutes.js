const express = require('express');
const { register, login, updateUserProfile, uploadAvatar } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../utils/multer');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/profile', protect, updateUserProfile);
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);

module.exports = router;
