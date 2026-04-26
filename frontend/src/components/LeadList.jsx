import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Building, User, UserCheck, ChevronDown, Eye, X, Phone, Mail, DollarSign, Tag, FileText, Calendar, Info, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

/**
 * LeadList — Renders the leads table with strict Role-Based Access Control.
 *
 * Admin:   Sees all leads, can Edit, Delete, Change Status, Assign
 * Manager: Sees all leads, can Edit, Change Status, Assign (NO Delete)
 * Agent:   Sees only assigned leads, can View full details + change Status
 */

// ──────────────────────────────────────────────
// Lead Detail Modal (Agent View)
// ──────────────────────────────────────────────
import DummyEmails from './DummyEmails';

const LeadDetailModal = ({ lead, onClose }) => {
  const [activeTab, setActiveTab] = React.useState('details');

  if (!lead) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-700';
      case 'Contacted': return 'bg-amber-100 text-amber-700';
      case 'Qualified': return 'bg-purple-100 text-purple-700';
      case 'Closed': return 'bg-emerald-100 text-emerald-700';
      case 'Lost': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.7)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-primary-600 to-primary-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center font-bold text-2xl text-white">
              {lead.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">{lead.name}</h2>
              <p className="text-xs text-primary-200">{lead.company || 'No Company'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 flex border-b border-slate-100 bg-white">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 text-xs font-extrabold uppercase tracking-widest border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'details' ? 'border-primary-600 text-primary-600 bg-primary-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Info size={14} />
            <span>Details</span>
          </button>
          <button
            onClick={() => setActiveTab('communication')}
            className={`py-3 px-4 text-xs font-extrabold uppercase tracking-widest border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'communication' ? 'border-primary-600 text-primary-600 bg-primary-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <MessageSquare size={14} />
            <span>Communication</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {activeTab === 'details' ? (
            <>
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Status</span>
                <span className={`px-3 py-1 rounded-xl text-xs font-extrabold uppercase tracking-wider ${getStatusColor(lead.status)}`}>
                  {lead.status}
                </span>
              </div>

              <div className="h-px bg-slate-100" />

              {/* Contact Details */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contact Details</p>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Mail size={14} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium uppercase">Email</p>
                    <p className="text-sm font-semibold text-slate-900">{lead.email || '—'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <Phone size={14} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium uppercase">Phone</p>
                    <p className="text-sm font-semibold text-slate-900">{lead.phone || '—'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                    <Building size={14} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium uppercase">Company</p>
                    <p className="text-sm font-semibold text-slate-900">{lead.company || '—'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                    <DollarSign size={14} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium uppercase">Deal Value</p>
                    <p className="text-sm font-semibold text-slate-900">${lead.value?.toLocaleString() || '0'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                    <Tag size={14} className="text-rose-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium uppercase">Deal Stage</p>
                    <p className="text-sm font-semibold text-slate-900">{lead.stage || lead.status || '—'}</p>
                  </div>
                </div>

                {lead.user?.name && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                      <User size={14} className="text-slate-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium uppercase">Created By</p>
                      <p className="text-sm font-semibold text-slate-900">{lead.user.name}</p>
                    </div>
                  </div>
                )}

                {lead.assignedBy?.name && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                      <UserCheck size={14} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium uppercase">Assigned By</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {lead.assignedBy.name}
                        <span className={`ml-2 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                          lead.assignedBy.role === 'Admin' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {lead.assignedBy.role}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {lead.createdAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                      <Calendar size={14} className="text-slate-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium uppercase">Date Added</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              {lead.notes && (
                <>
                  <div className="h-px bg-slate-100" />
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center">
                      <FileText size={12} className="mr-1.5" /> Notes
                    </p>
                    <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 leading-relaxed">{lead.notes}</p>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-4">
                <h4 className="text-sm font-extrabold text-slate-900 mb-1">Email Communication Logs</h4>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Encrypted & Archived</p>
              </div>
              <DummyEmails />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────
// Main LeadList Component
// ──────────────────────────────────────────────
const LeadList = ({ leads, loading, onEdit, onDelete, onStatusUpdate }) => {
  const { user: currentUser } = useAuth();
  const [agents, setAgents] = useState([]);
  const [viewLead, setViewLead] = useState(null); // For agent detail modal

  const isAdmin = currentUser?.role === 'Admin';
  const isManager = currentUser?.role === 'Manager';
  const isAgent = currentUser?.role === 'Agent';
  const canManage = isAdmin || isManager;

  // Fetch agents list for assignment dropdown (Admin & Manager only)
  useEffect(() => {
    if (canManage) {
      api.get('/users/agents')
        .then((res) => setAgents(res.data.data || []))
        .catch(() => setAgents([]));
    }
  }, [canManage]);

  if (loading) {
    return (
      <div className="p-10 text-center">
        <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-primary-600 rounded-full" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-3 text-slate-400 text-sm font-medium">Fetching leads from MongoDB...</p>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="p-20 text-center">
        <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
          <User size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-700">No leads found</h3>
        <p className="text-slate-400 text-sm mt-1">
          {isAgent ? 'No leads have been assigned to you yet.' : 'Get started by adding your first business lead.'}
        </p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-700';
      case 'Contacted': return 'bg-amber-100 text-amber-700';
      case 'Qualified': return 'bg-purple-100 text-purple-700';
      case 'Closed': return 'bg-emerald-100 text-emerald-700';
      case 'Lost': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  // Update lead status via API — logs to MongoDB Activity collection
  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/leads/${id}`, { status: newStatus });
      if (onStatusUpdate) onStatusUpdate();
    } catch (err) {
      console.error('Status update failed:', err);
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  // Assign lead to an agent — Manager/Admin action
  const handleAssignChange = async (id, agentId) => {
    try {
      await api.put(`/leads/${id}`, { assignedTo: agentId || null });
      if (onStatusUpdate) onStatusUpdate();
    } catch (err) {
      console.error('Assignment failed:', err);
    }
  };

  return (
    <>
      {/* Lead Detail Modal for Agent */}
      {viewLead && <LeadDetailModal lead={viewLead} onClose={() => setViewLead(null)} />}

      <div className="overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Lead Contact</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Organization</th>
              {/* Owner column: Admin + Manager only */}
              {canManage && (
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Owner</th>
              )}
              {/* Assigned To column: Admin + Manager only */}
              {canManage && (
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Agent</th>
              )}
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Deal Value</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {leads.map((lead) => (
              <tr key={lead._id} className="hover:bg-slate-50/50 transition-colors group">
                {/* Lead Contact */}
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                      {lead.name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-bold text-slate-900">{lead.name}</div>
                      <div className="text-xs text-slate-400">{lead.email}</div>
                      {lead.phone && <div className="text-xs text-slate-400">{lead.phone}</div>}
                    </div>
                  </div>
                </td>

                {/* Organization */}
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center text-sm font-semibold text-slate-700">
                    <Building size={14} className="mr-2 text-slate-300 shrink-0" />
                    {lead.company || 'Not Specified'}
                  </div>
                </td>

                {/* Owner (Admin + Manager) */}
                {canManage && (
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center text-xs font-bold text-slate-500">
                      <User size={12} className="mr-1.5 text-slate-400 shrink-0" />
                      {lead.user?.name || 'Unknown'}
                    </div>
                  </td>
                )}

                {/* Assigned Agent (Admin + Manager — with dropdown to reassign) */}
                {canManage && (
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="relative">
                      <select
                        value={lead.assignedTo?._id || lead.assignedTo || ''}
                        onChange={(e) => handleAssignChange(lead._id, e.target.value)}
                        className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 pr-6 cursor-pointer outline-none focus:ring-2 focus:ring-primary-500 appearance-none max-w-[130px] truncate"
                      >
                        <option value="">Unassigned</option>
                        {agents.map((agent) => (
                          <option key={agent._id} value={agent._id}>
                            {agent.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </td>
                )}

                {/* Status Dropdown — All roles can change status */}
                <td className="px-6 py-5 whitespace-nowrap">
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border-0 cursor-pointer outline-none transition-all ${getStatusColor(lead.status)}`}
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Lost">Lost</option>
                    <option value="Closed">Closed</option>
                  </select>
                </td>

                {/* Deal Value */}
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="text-sm font-bold text-slate-900">
                    ${lead.value?.toLocaleString() || '0'}
                  </div>
                </td>

                {/* Actions — Conditional per role */}
                <td className="px-6 py-5 whitespace-nowrap text-right text-sm">
                  <div className="flex justify-end space-x-2">
                    {/* Agent: View Details button */}
                    {isAgent && (
                      <button
                        onClick={() => setViewLead(lead)}
                        className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                        title="View Lead Details"
                      >
                        <Eye size={16} />
                      </button>
                    )}
                    {/* Edit — Admin and Manager only */}
                    {canManage && (
                      <button
                        onClick={() => onEdit(lead)}
                        className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                        title="Edit Lead"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                    {/* Delete — Admin only */}
                    {isAdmin && (
                      <button
                        onClick={() => onDelete(lead._id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="Delete Lead"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default LeadList;
