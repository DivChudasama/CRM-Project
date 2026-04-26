const User = require('../models/User');
const Activity = require('../models/Activity');
const jwt = require('jsonwebtoken');

/**
 * crmUserRegistration — Register a new CRM user
 */
exports.crmUserRegistration = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await User.create({ name, email, password, role: role || 'Agent' });
    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * crmUserLogin — Authenticate a CRM user and return JWT token.
 * Logs the login event to the Activity collection.
 */
exports.crmUserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Log login activity to MongoDB Activity collection
    await Activity.create({
      user: user._id,
      userRole: user.role,
      type: 'Login',
      description: `${user.name} (${user.role}) logged into the CRM system`,
    });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * updateCrmUserProfile — Update authenticated user's profile.
 */
exports.updateCrmUserProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      title: req.body.title,
      bio: req.body.bio,
      phone: req.body.phone,
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * updateCrmUserAvatar — Upload/update/remove profile photo (base64).
 */
exports.updateCrmUserAvatar = async (req, res) => {
  try {
    const { avatar } = req.body; // base64 string or empty string to remove
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatar || '' },
      { new: true }
    );
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * sendTokenResponse — Generate JWT and send structured login response.
 */
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      title: user.title,
      bio: user.bio,
      phone: user.phone || '',
      role: user.role,
      avatar: user.avatar || '',
    },
  });
};
