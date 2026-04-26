import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { X, Loader2, MessageSquare, Info } from 'lucide-react';
import DummyEmails from './DummyEmails';

const LeadForm = ({ lead, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'New',
    value: 0,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name,
        email: lead.email,
        phone: lead.phone || '',
        company: lead.company || '',
        status: lead.status,
        value: lead.value || 0,
        notes: lead.notes || ''
      });
    }
  }, [lead]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'value' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (lead) {
        await api.put(`/leads/${lead._id}`, formData);
      } else {
        await api.post('/leads', formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">


        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full border border-slate-100">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                {lead ? 'Edit Lead Record' : 'Create New Lead'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Fill in the information below to track this prospect.</p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
              <X size={20} />
            </button>
          </div>


          {lead && (
            <div className="px-8 flex border-b border-slate-100 bg-white sticky top-0 z-10">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-4 px-6 text-xs font-extrabold uppercase tracking-widest border-b-2 transition-all flex items-center space-x-2 ${
                  activeTab === 'details' ? 'border-primary-600 text-primary-600 bg-primary-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Info size={14} />
                <span>Details</span>
              </button>
              <button
                onClick={() => setActiveTab('communication')}
                className={`py-4 px-6 text-xs font-extrabold uppercase tracking-widest border-b-2 transition-all flex items-center space-x-2 ${
                  activeTab === 'communication' ? 'border-primary-600 text-primary-600 bg-primary-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <MessageSquare size={14} />
                <span>Communication</span>
              </button>
            </div>
          )}

          <div className="p-8">
            {error && <div className="p-4 mb-6 bg-rose-50 text-rose-700 text-sm font-bold rounded-xl border border-rose-100">{error}</div>}

            {activeTab === 'details' ? (
              <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm font-medium text-slate-900 placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm font-medium text-slate-900 placeholder-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm font-medium text-slate-900 placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Company Name</label>
                <input
                  type="text"
                  name="company"
                  placeholder="Acme Corp"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm font-medium text-slate-900 placeholder-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pipeline Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm font-bold text-slate-900 cursor-pointer"
                >
                  <option value="New" className="text-slate-900">New Lead</option>
                  <option value="Contacted" className="text-slate-900">Contacted</option>
                  <option value="Qualified" className="text-slate-900">Qualified</option>
                  <option value="Lost" className="text-slate-900">Lost Opportunity</option>
                  <option value="Closed" className="text-slate-900">Deal Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deal Value ($)</label>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm font-bold text-slate-900"
                />
              </div>
            </div>

            {/* Notes about this lead */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Notes about Lead
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Add any important context, task instructions or special notes for this lead..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm font-medium text-slate-900 placeholder-slate-400 resize-none"
              />
              <p className="text-[10px] text-slate-400 mt-1 font-medium">
                📌 These notes are visible to the assigned agent.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end space-x-4 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
              >
                Cancel
              </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-8 py-3 text-sm font-extrabold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-all shadow-lg shadow-primary-200 disabled:opacity-50"
                >
                  {loading && <Loader2 className="animate-spin mr-3" size={18} />}
                  {lead ? 'Update Lead Record' : 'Save Lead Record'}
                </button>
              </div>
            </form>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-6">
                <h4 className="text-sm font-extrabold text-slate-900 mb-1">Email Communication Logs</h4>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Encrypted & Archived</p>
              </div>
              <DummyEmails />
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadForm;
