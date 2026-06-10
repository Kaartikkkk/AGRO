const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/farm', require('./farms-legacy.routes'));
router.use('/farms', require('./farms.routes'));
router.use('/reminders', require('./reminders.routes'));

module.exports = router;
