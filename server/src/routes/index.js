const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/farm', require('./farms-legacy.routes'));
router.use('/farms', require('./farms.routes'));
router.use('/reminders', require('./reminders.routes'));
router.use('/user', require('./user.routes'));
router.use('/weather', require('./weather.routes'));
router.use('/disease', require('./disease.routes'));
router.use('/ai', require('./aiRecommendations.routes'));
router.use('/mandi', require('./mandi.routes'));

module.exports = router;
