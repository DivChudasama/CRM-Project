const Lead = require('../models/Lead');
const Activity = require('../models/Activity');

/**
 * leadLifecycleManager — Controller functions for lead CRUD operations.
 * All functions enforce role-based data visibility:
 *   Admin/Manager → all leads
 *   Agent         → only leads assigned to them
 */

// @desc   Fetch leads based on user role
// @route  GET /api/v1/leads
// @access Private
exports.fetchLeadsByRole = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'Agent') {
      // Agents only see leads assigned to them
      query = { assignedTo: req.user.id };
    }
    // Admin and Manager see all leads

    const leads = await Lead.find(query)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: leads.length, data: leads });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc   Fetch single lead by ID
// @route  GET /api/v1/leads/:id
// @access Private
exports.fetchSingleLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name role');

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    // Agent can only view their assigned leads
    if (req.user.role === 'Agent' && lead.assignedTo?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this lead' });
    }

    res.status(200).json({ success: true, data: lead });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc   Create a new lead
// @route  POST /api/v1/leads
// @access Private (Admin, Manager only)
exports.registerNewLead = async (req, res) => {
  try {
    req.body.user = req.user.id;

    // If assigning to someone, record who assigned it
    if (req.body.assignedTo) {
      req.body.assignedBy = req.user.id;
    } else {
      req.body.assignedTo = null;
      req.body.assignedBy = null;
    }

    const lead = await Lead.create(req.body);

    // Log Activity to MongoDB
    await Activity.create({
      user: req.user.id,
      userRole: req.user.role,
      type: 'Lead Created',
      description: `${req.user.name} created new lead: ${lead.name}`,
      lead: lead._id,
    });

    res.status(201).json({ success: true, data: lead });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc   Update an existing lead
// @route  PUT /api/v1/leads/:id
// @access Private
exports.modifyLeadRecord = async (req, res) => {
  try {
    let lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    // Agent can only update status of their assigned leads
    if (req.user.role === 'Agent') {
      if (lead.assignedTo?.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to edit this lead' });
      }
      // Agent can ONLY change status
      const { status } = req.body;
      req.body = { status };
    }

    // If assignedTo is being changed (by manager/admin), set assignedBy to current user
    if (req.body.assignedTo !== undefined) {
      if (req.body.assignedTo) {
        req.body.assignedBy = req.user.id;
      } else {
        req.body.assignedBy = null;
      }
    }

    const isStatusChange = req.body.status && req.body.status !== lead.status;
    const oldStatus = lead.status;

    lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('user', 'name email')
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name role');

    // Log Activity to MongoDB
    await Activity.create({
      user: req.user.id,
      userRole: req.user.role,
      type: isStatusChange ? 'Status Changed' : 'Lead Updated',
      description: isStatusChange
        ? `${req.user.name} changed status of "${lead.name}" from ${oldStatus} → ${lead.status}`
        : `${req.user.name} updated lead: ${lead.name}`,
      lead: lead._id,
    });

    res.status(200).json({ success: true, data: lead });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc   Delete a lead
// @route  DELETE /api/v1/leads/:id
// @access Private (Admin only)
exports.removeLeadRecord = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    // Only Admin can delete leads
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Only Admins can delete leads' });
    }

    const leadName = lead.name;
    await lead.deleteOne();

    // Log Activity to MongoDB
    await Activity.create({
      user: req.user.id,
      userRole: req.user.role,
      type: 'Lead Deleted',
      description: `${req.user.name} permanently deleted lead: ${leadName}`,
    });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
