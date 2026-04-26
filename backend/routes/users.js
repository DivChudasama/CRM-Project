const express = require('express');
const User = require('../models/User');
const Lead = require('../models/Lead');
const { verifyJwtToken, crmAccessGuard } = require('../middleware/auth');

const router = express.Router();

// All user management routes require valid JWT
router.use(verifyJwtToken);

// GET /api/v1/users — Fetch all users (Admin only for User Management page)
router.get('/', crmAccessGuard('Admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/v1/users/agents — Fetch only Agent users (Admin + Manager, for lead assignment dropdown)
router.get('/agents', crmAccessGuard('Admin', 'Manager'), async (req, res) => {
  try {
    const agents = await User.find({ role: 'Agent' }).select('name email role').sort({ name: 1 });
    res.status(200).json({ success: true, count: agents.length, data: agents });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/v1/users — Create a new CRM user (Admin only)
router.post('/', crmAccessGuard('Admin'), async (req, res) => {
  try {
    const { name, email, password, role, avatar, title, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
    }
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Agent',
      avatar: avatar || '',
      title: title || '',
      phone: phone || '',
    });
    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json({ success: true, data: userObj });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/v1/users/:id — Update a user (Admin only)
router.put('/:id', crmAccessGuard('Admin'), async (req, res) => {
  try {
    const { name, email, role, title, avatar, phone, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    // Check if email already taken by another user
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already in use by another account.' });
      }
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (title !== undefined) user.title = title;
    if (avatar !== undefined) user.avatar = avatar;
    if (phone !== undefined) user.phone = phone;
    if (password) user.password = password; // pre-save hook will hash it

    await user.save();

    const updated = user.toObject();
    delete updated.password;
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/v1/users/:id — Delete a user (Admin only)
router.delete('/:id', crmAccessGuard('Admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    // Prevent Admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    // Professional safety: Unassign leads from this user before deleting
    await Lead.updateMany({ assignedTo: user._id }, { assignedTo: null, assignedBy: null });
    
    // Use findByIdAndDelete for a cleaner operation
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.error('DELETE USER ERROR:', err);
    res.status(500).json({ success: false, message: 'Server error while deleting user: ' + err.message });
  }
});

module.exports = router;

