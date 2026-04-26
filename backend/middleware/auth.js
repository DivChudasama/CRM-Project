const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * verifyJwtToken — Middleware to protect routes.
 * Validates the Bearer token and attaches the user to req.user.
 */
exports.verifyJwtToken = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

/**
 * crmAccessGuard — Role-based access control middleware factory.
 * Usage: crmAccessGuard('Admin', 'Manager')
 * Ensures only users with the specified roles can access the route.
 */
exports.crmAccessGuard = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This route requires one of the following roles: ${allowedRoles.join(', ')}`,
      });
    }
    next();
  };
};
