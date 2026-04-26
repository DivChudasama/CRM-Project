const express = require('express');
const {
  crmUserRegistration,
  crmUserLogin,
  updateCrmUserProfile,
  updateCrmUserAvatar,
} = require('../controllers/authController');
const { verifyJwtToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register', crmUserRegistration);
router.post('/login', crmUserLogin);
router.put('/profile', verifyJwtToken, updateCrmUserProfile);
router.put('/avatar', verifyJwtToken, updateCrmUserAvatar);

module.exports = router;
