const express = require('express');
const {
  fetchLeadsByRole,
  fetchSingleLead,
  registerNewLead,
  modifyLeadRecord,
  removeLeadRecord,
} = require('../controllers/leadController');
const { verifyJwtToken, crmAccessGuard } = require('../middleware/auth');

const router = express.Router();

// All lead routes require valid JWT
router.use(verifyJwtToken);

router.route('/')
  .get(fetchLeadsByRole)                                      // All roles can fetch (filtered by role in controller)
  .post(crmAccessGuard('Admin', 'Manager'), registerNewLead); // Only Admin/Manager can create leads

router.route('/:id')
  .get(fetchSingleLead)
  .put(modifyLeadRecord)                                      // All roles (Agent restricted in controller)
  .delete(crmAccessGuard('Admin'), removeLeadRecord);         // Only Admin can delete

module.exports = router;
