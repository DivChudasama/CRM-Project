import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  UserCog, Trash2, Shield, ShieldAlert, ShieldCheck, Mail,
  Calendar, UserPlus, X, Loader2, Eye, EyeOff, Edit2, Check, Camera
} from 'lucide-react';
import { useRef } from 'react';

/**
 * UserManagementPage — Admin-only page for managing CRM users.
 * Lists all users with their roles, allows Admin to create, edit, and delete users.
 */

// ──────────────────────────────────────────────
// Create User Modal
// ──────────────────────────────────────────────
const CreateUserModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Agent', avatar: '', phone: '', title: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, avatar: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('All fields are required.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/users', formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  const roleColors = {
    Admin: 'bg-rose-50 text-rose-700 border-rose-300',
    Manager: 'bg-amber-50 text-amber-700 border-amber-300',
    Agent: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.75)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
              <UserPlus size={20} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Create New User</h2>
              <p className="text-xs text-slate-400">Add a new team member to the CRM</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-sm font-bold rounded-xl border border-rose-200">
              {error}
            </div>
          )}

          {/* Avatar Selection */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-slate-200">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
              ) : (
                <Camera size={24} className="text-slate-300" />
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleAvatarChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-2 rounded-lg hover:bg-primary-100 transition-all"
            >
              Select Photo
            </button>
            {formData.avatar && (
              <button
                type="button"
                onClick={() => setFormData({ ...formData, avatar: '' })}
                className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-2 rounded-lg hover:bg-rose-100 transition-all"
              >
                Remove
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Agent 1"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm font-medium text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="agent1@company.com"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm font-medium text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 234 567 890"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm font-medium text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                className="w-full px-4 py-2.5 pr-11 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm font-medium text-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {['Admin', 'Manager', 'Agent'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setFormData({ ...formData, role })}
                  className={`py-2.5 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider border-2 transition-all ${
                    formData.role === role
                      ? `${roleColors[role]} shadow-sm`
                      : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </form>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center px-5 py-2.5 text-sm font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {loading && <Loader2 size={16} className="animate-spin mr-2" />}
            Create User
          </button>
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────
// Edit User Modal
// ──────────────────────────────────────────────
const EditUserModal = ({ user: editUser, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: editUser?.name || '',
    email: editUser?.email || '',
    role: editUser?.role || 'Agent',
    title: editUser?.title || '',
    avatar: editUser?.avatar || '',
    phone: editUser?.phone || '',
    password: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, avatar: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Name and email are required.');
      return;
    }
    setLoading(true);
    try {
      await api.put(`/users/${editUser._id}`, formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setLoading(false);
    }
  };

  const roleColors = {
    Admin: 'bg-rose-50 text-rose-700 border-rose-300',
    Manager: 'bg-amber-50 text-amber-700 border-amber-300',
    Agent: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.75)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Edit2 size={20} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Edit User</h2>
              <p className="text-xs text-slate-400">Update user details and role</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-sm font-bold rounded-xl border border-rose-200">
              {error}
            </div>
          )}

          {/* Avatar Selection */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-slate-200">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary-600 text-white flex items-center justify-center font-bold text-xl uppercase">
                  {formData.name?.charAt(0) || editUser?.name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleAvatarChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-2 rounded-lg hover:bg-primary-100 transition-all"
            >
              Change Photo
            </button>
            {formData.avatar && (
              <button
                type="button"
                onClick={() => setFormData({ ...formData, avatar: '' })}
                className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-2 rounded-lg hover:bg-rose-100 transition-all"
              >
                Remove
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm font-medium text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm font-medium text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm font-medium text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 text-rose-600">Change Password (leave blank to keep current)</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="New password (optional)"
                className="w-full px-4 py-2.5 pr-11 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none text-sm font-medium text-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Job Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Senior Sales Agent"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm font-medium text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {['Admin', 'Manager', 'Agent'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setFormData({ ...formData, role })}
                  className={`py-2.5 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider border-2 transition-all ${
                    formData.role === role
                      ? `${roleColors[role]} shadow-sm`
                      : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </form>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center px-5 py-2.5 text-sm font-bold text-white bg-amber-500 rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Check size={16} className="mr-2" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const ViewUserModal = ({ user, onClose }) => {
  if (!user) return null;

  const roleConfig = {
    Admin: { icon: ShieldAlert, badge: 'bg-rose-100 text-rose-700 border border-rose-200' },
    Manager: { icon: ShieldCheck, badge: 'bg-amber-100 text-amber-700 border border-amber-200' },
    Agent: { icon: Shield, badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
  };

  const config = roleConfig[user.role] || roleConfig['Agent'];
  const RoleIcon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.75)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
              <Eye size={20} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">User Profile</h2>
              <p className="text-xs text-slate-400">Detailed view of CRM member</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-xl mb-4 border-4 border-white ring-4 ring-slate-50">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary-600 text-white flex items-center justify-center font-bold text-3xl uppercase">
                  {user.name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-900">{user.name}</h3>
            <p className="text-slate-500 text-sm font-medium">{user.title || 'No Title'}</p>
            
            <div className={`mt-4 inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-widest ${config.badge}`}>
              <RoleIcon size={14} />
              <span>{user.role}</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400">
                <Mail size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                <p className="text-sm font-bold text-slate-700">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400">
                <Calendar size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date Joined</p>
                <p className="text-sm font-bold text-slate-700">
                  {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>

            {user.phone && (
              <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400">
                  <Check size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                  <p className="text-sm font-bold text-slate-700">{user.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────
// Main UserManagementPage Component
// ──────────────────────────────────────────────
const DeleteConfirmationModal = ({ name, loading, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.75)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trash2 size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Delete User?</h2>
          <p className="text-slate-500 text-sm">
            Are you sure you want to delete <span className="font-bold text-slate-900">"{name}"</span>? 
            This action cannot be undone and all their lead assignments will be removed.
          </p>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 flex items-center justify-center"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Delete User'}
          </button>
        </div>
      </div>
    </div>
  );
};

const UserManagementPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users. Ensure you have Admin privileges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/users/${deletingUser._id}`);
      setUsers((prev) => prev.filter((u) => u._id !== deletingUser._id));
      setDeletingUser(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const roleConfig = {
    Admin: {
      icon: ShieldAlert,
      badge: 'bg-rose-100 text-rose-700 border border-rose-200',
    },
    Manager: {
      icon: ShieldCheck,
      badge: 'bg-amber-100 text-amber-700 border border-amber-200',
    },
    Agent: {
      icon: Shield,
      badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    },
  };

  const roleCounts = {
    Admin: users.filter((u) => u.role === 'Admin').length,
    Manager: users.filter((u) => u.role === 'Manager').length,
    Agent: users.filter((u) => u.role === 'Agent').length,
  };

  return (
    <Layout>
      {/* Modals */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { setShowCreateModal(false); fetchUsers(); }}
        />
      )}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => { setEditingUser(null); fetchUsers(); }}
        />
      )}
      {viewingUser && (
        <ViewUserModal
          user={viewingUser}
          onClose={() => setViewingUser(null)}
        />
      )}
      {deletingUser && (
        <DeleteConfirmationModal
          name={deletingUser.name}
          loading={deleteLoading}
          onClose={() => setDeletingUser(null)}
          onConfirm={handleDeleteUser}
        />
      )}

      {/* Page Header */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 mt-2">
            Manage all CRM users, roles, and access permissions.{' '}
            <span className="font-semibold text-rose-600">Admin access only.</span>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-5 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 text-sm"
          >
            <UserPlus size={18} className="mr-2" />
            Create User
          </button>
          <div className="flex items-center space-x-2 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl">
            <ShieldAlert size={18} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest">Restricted</p>
              <p className="text-sm font-extrabold">Admin Only</p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Object.entries(roleCounts).map(([role, count]) => {
          const config = roleConfig[role];
          const RoleIcon = config.icon;
          return (
            <div key={role} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{role}s</p>
                  <p className="text-4xl font-extrabold text-slate-900 mt-1">{count}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  role === 'Admin' ? 'bg-rose-50 text-rose-600' :
                  role === 'Manager' ? 'bg-amber-50 text-amber-600' :
                  'bg-emerald-50 text-emerald-600'
                }`}>
                  <RoleIcon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <UserCog size={20} className="text-primary-600" />
            <h3 className="text-lg font-bold text-slate-900">All CRM Users</h3>
            <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {users.length} total
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center">
            <div className="animate-spin inline-block w-8 h-8 border-[3px] border-primary-600 border-t-transparent rounded-full mb-4"></div>
            <p className="text-slate-400 text-sm font-medium">Loading users from MongoDB...</p>
          </div>
        ) : error ? (
          <div className="p-16 text-center">
            <ShieldAlert size={48} className="text-rose-300 mx-auto mb-4" />
            <p className="text-rose-600 font-bold">{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {users.map((u) => {
                  const config = roleConfig[u.role] || roleConfig['Agent'];
                  const RoleIcon = config.icon;
                  const isSelf = u._id === currentUser?.id;

                  return (
                    <tr key={u._id} className={`hover:bg-slate-50/50 transition-colors ${isSelf ? 'bg-primary-50/30' : ''}`}>
                      {/* User Avatar + Name */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm shrink-0">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-primary-600 text-white flex items-center justify-center font-bold text-base">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-bold text-slate-900">
                              {u.name}
                              {isSelf && (
                                <span className="ml-2 text-[10px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-extrabold">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center text-sm text-slate-600">
                          <Mail size={13} className="mr-2 text-slate-300" />
                          {u.email}
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-sm text-slate-500 font-medium">{u.phone || '—'}</span>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider ${config.badge}`}>
                          <RoleIcon size={12} />
                          <span>{u.role}</span>
                        </div>
                      </td>

                      {/* Title */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-sm text-slate-500 font-medium">{u.title || '—'}</span>
                      </td>

                      {/* Date Joined */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center text-xs text-slate-400 font-medium">
                          <Calendar size={12} className="mr-1.5" />
                          {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5 whitespace-nowrap text-right">
                        {!isSelf ? (
                          <div className="flex justify-end space-x-2">
                            {/* View Button */}
                            <button
                              onClick={() => setViewingUser(u)}
                              className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                              title={`View ${u.name}`}
                            >
                              <Eye size={16} />
                            </button>
                            {/* Edit Button */}
                            <button
                              onClick={() => setEditingUser(u)}
                              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                              title={`Edit ${u.name}`}
                            >
                              <Edit2 size={16} />
                            </button>
                            {/* Delete Button */}
                            <button
                              onClick={() => setDeletingUser(u)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                              title={`Delete ${u.name}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300 font-bold">Current User</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserManagementPage;
