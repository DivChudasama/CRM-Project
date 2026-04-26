import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import LeadList from '../components/LeadList';
import LeadForm from '../components/LeadForm';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Filter, Lock } from 'lucide-react';

const LeadsPage = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLead, setCurrentLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isAgent = user?.role === 'Agent';
  const isAdminOrManager = user?.role === 'Admin' || user?.role === 'Manager';

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leads');
      setLeads(res.data.data);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleAddLead = () => {
    setCurrentLead(null);
    setIsModalOpen(true);
  };

  const handleEditLead = (lead) => {
    setCurrentLead(lead);
    setIsModalOpen(true);
  };

  const handleDeleteLead = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this lead?')) {
      try {
        await api.delete(`/leads/${id}`);
        fetchLeads();
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to delete lead.';
        alert(msg);
      }
    }
  };

  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Lead Pipeline</h1>
          <p className="text-slate-500 mt-2">
            {isAgent
              ? 'View and update the status of your assigned leads.'
              : 'Manage, track and convert your enterprise prospects into closed deals.'}
          </p>
          {isAgent && (
            <div className="mt-3 inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg">
              <Lock size={12} />
              <span>Agent View — Showing only leads assigned to you</span>
            </div>
          )}
        </div>

        {/* Only Admin and Manager can add new leads */}
        {isAdminOrManager && (
          <button
            onClick={handleAddLead}
            className="flex items-center px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200"
          >
            <Plus size={20} className="mr-2" />
            Add New Lead
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="relative w-full md:w-[450px]">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search leads by name, email or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm font-medium text-slate-900 placeholder-slate-400"
            />
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-3 text-sm font-bold text-slate-600 bg-white rounded-xl hover:bg-slate-50 border border-slate-200 transition-colors">
              <Filter size={18} className="mr-2" />
              Advanced Filters
            </button>
          </div>
        </div>

        <LeadList
          leads={filteredLeads}
          loading={loading}
          onEdit={handleEditLead}
          onDelete={handleDeleteLead}
          onStatusUpdate={fetchLeads}
        />
      </div>

      {isModalOpen && (
        <LeadForm
          lead={currentLead}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchLeads();
          }}
        />
      )}
    </Layout>
  );
};

export default LeadsPage;
