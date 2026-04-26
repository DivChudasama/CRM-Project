import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { User, Bell, Shield, Globe, Database, CreditCard, Loader2, Camera, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const SettingsPage = () => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('General');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    title: '',
    bio: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [avatarMessage, setAvatarMessage] = useState({ type: '', text: '' });
  const [toggles, setToggles] = useState({
    autoAssign: true,
    notifications: true,
    weeklyReports: false
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        title: user.title || '',
        bio: user.bio || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.data.success) {
        const updatedUser = { ...user, ...res.data.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  // Handle avatar file selection → convert to base64 → upload
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setAvatarMessage({ type: 'error', text: 'Image must be under 2MB.' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      setAvatarLoading(true);
      setAvatarMessage({ type: '', text: '' });
      try {
        const res = await api.put('/auth/avatar', { avatar: base64 });
        if (res.data.success) {
          const updatedUser = { ...user, avatar: base64 };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
          setAvatarMessage({ type: 'success', text: 'Profile photo updated!' });
        }
      } catch (err) {
        setAvatarMessage({ type: 'error', text: 'Failed to upload photo.' });
      } finally {
        setAvatarLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove avatar
  const handleRemoveAvatar = async () => {
    if (!window.confirm('Remove your profile photo?')) return;
    setAvatarLoading(true);
    setAvatarMessage({ type: '', text: '' });
    try {
      const res = await api.put('/auth/avatar', { avatar: '' });
      if (res.data.success) {
        const updatedUser = { ...user, avatar: '' };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setAvatarMessage({ type: 'success', text: 'Profile photo removed.' });
      }
    } catch (err) {
      setAvatarMessage({ type: 'error', text: 'Failed to remove photo.' });
    } finally {
      setAvatarLoading(false);
    }
  };


  const renderContent = () => {
    switch (activeTab) {
      case 'General':
        return (
          <div className="space-y-6">
            {/* ── Profile Photo Card ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Profile Photo</h3>
                <p className="text-sm text-slate-500">Upload or remove your profile picture. Max 2 MB.</p>
              </div>
              <div className="p-6 flex items-center space-x-6">
                {/* Current Avatar Preview */}
                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md shrink-0 bg-primary-600 flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-extrabold text-white">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="flex-1">
                  {avatarMessage.text && (
                    <div className={`mb-3 p-3 rounded-xl text-sm font-bold ${
                      avatarMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {avatarMessage.text}
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarLoading}
                      className="flex items-center px-4 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors text-sm disabled:opacity-50"
                    >
                      {avatarLoading ? (
                        <Loader2 size={16} className="animate-spin mr-2" />
                      ) : (
                        <Camera size={16} className="mr-2" />
                      )}
                      {user?.avatar ? 'Change Photo' : 'Upload Photo'}
                    </button>
                    {user?.avatar && (
                      <button
                        onClick={handleRemoveAvatar}
                        disabled={avatarLoading}
                        className="flex items-center px-4 py-2.5 text-rose-600 bg-rose-50 font-bold rounded-xl hover:bg-rose-100 transition-colors text-sm disabled:opacity-50"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Supported formats: JPG, PNG, GIF · Max size: 2 MB</p>
                </div>
              </div>
            </div>

            {/* ── Profile Info Card ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Profile Information</h3>
                <p className="text-sm text-slate-500">Update your personal details and public profile.</p>
              </div>
              <div className="p-6 space-y-6">
                {message.text && (
                  <div className={`p-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {message.text}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      name="name"
                      value={profileData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
                    <input 
                      type="text" 
                      name="title"
                      value={profileData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    <input 
                      type="text" 
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 234 567 890"
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                  <textarea 
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all h-24 text-slate-900"
                  ></textarea>
                </div>
              </div>
              <div className="p-6 bg-slate-50 flex justify-end">
                <button 
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="flex items-center px-6 py-2.5 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {loading && <Loader2 className="animate-spin mr-2" size={18} />}
                  Save Changes
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">System Preferences</h3>
                <p className="text-sm text-slate-500">Global configurations for your CRM environment.</p>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { id: 'autoAssign', label: 'Auto-assign new leads', description: 'Automatically distribute new leads among team members.' },
                  { id: 'notifications', label: 'Email notifications', description: 'Receive instant alerts for new high-value leads.' },
                  { id: 'weeklyReports', label: 'Weekly performance reports', description: 'Get a summary of team performance every Monday.' },
                ].map((pref) => (
                  <div key={pref.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{pref.label}</p>
                      <p className="text-xs text-slate-500">{pref.description}</p>
                    </div>
                    <div 
                      onClick={() => setToggles({ ...toggles, [pref.id]: !toggles[pref.id] })}
                      className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${toggles[pref.id] ? 'bg-primary-500' : 'bg-slate-200'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${toggles[pref.id] ? 'translate-x-6' : ''}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'Notifications':
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <Bell className="mr-3 text-primary-500" size={24} /> Notification Channels
            </h3>
            <div className="space-y-6">
              {[
                { id: 'browser', label: 'Browser Push Notifications', description: 'Receive alerts even when the CRM tab is closed.' },
                { id: 'sms', label: 'SMS Alerts', description: 'Get text messages for critical high-value deal movements.' },
                { id: 'slack', label: 'Slack Integration', description: 'Post lead activities directly to your team Slack channel.' },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                  <div 
                    onClick={() => setToggles({ ...toggles, [item.id]: !toggles[item.id] })}
                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${toggles[item.id] ? 'bg-primary-500' : 'bg-slate-200'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${toggles[item.id] ? 'translate-x-6' : ''}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'Security':
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <Shield className="mr-3 text-primary-500" size={24} /> Security Controls
            </h3>
            <div className="space-y-6">
              <div className="p-4 border border-slate-100 rounded-2xl">
                <p className="text-sm font-bold text-slate-900">Two-Factor Authentication (2FA)</p>
                <p className="text-xs text-slate-500 mt-1">Add an extra layer of security to your enterprise account.</p>
                <button className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors">Enable 2FA</button>
              </div>
              <div className="p-4 border border-slate-100 rounded-2xl">
                <p className="text-sm font-bold text-slate-900">Session Management</p>
                <p className="text-xs text-slate-500 mt-1">View and manage your active sessions across devices.</p>
                <button className="mt-4 px-4 py-2 text-slate-600 bg-slate-100 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors">Revoke All Sessions</button>
              </div>
            </div>
          </div>
        );
      case 'Integrations':
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <Globe className="mr-3 text-primary-500" size={24} /> Third-Party Integrations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['Salesforce', 'HubSpot', 'Zapier', 'Mailchimp'].map(tool => (
                <div key={tool} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:border-primary-200 hover:bg-primary-50/10 transition-all cursor-pointer group">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl mr-3 flex items-center justify-center font-bold text-slate-400 group-hover:bg-primary-100 group-hover:text-primary-600">{tool[0]}</div>
                    <p className="text-sm font-bold text-slate-900">{tool}</p>
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-400 group-hover:text-primary-600 uppercase">Connect</span>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-white p-20 rounded-2xl border border-slate-200 text-center">
            <h3 className="text-lg font-bold text-slate-900">{activeTab} Section</h3>
            <p className="text-slate-500 mt-2">This module is currently being optimized for your enterprise workflow.</p>
          </div>
        );
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">System Settings</h1>
        <p className="text-slate-500 mt-2">Manage your account preferences and CRM configurations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {[
              { label: 'General', icon: User },
              { label: 'Notifications', icon: Bell },
              { label: 'Security', icon: Shield },
              { label: 'Integrations', icon: Globe },
              { label: 'Data Export', icon: Database },
              { label: 'Billing', icon: CreditCard },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.label)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                  activeTab === item.label ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-3">
          {renderContent()}
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
