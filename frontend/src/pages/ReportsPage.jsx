import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { BarChart3, TrendingUp, PieChart, Calendar, Loader2 } from 'lucide-react';
import api from '../services/api';

const ReportsPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [stats, setStats] = useState({
    avgDealValue: 0,
    conversionRate: 0,
    activeGoals: '0/10',
    totalRevenue: 0
  });

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/leads');
        const allLeads = res.data.data;
        setLeads(allLeads);

        // 1. Calculate Monthly Revenue Growth (Last 7 months)
        const closedLeads = allLeads.filter(l => l.status === 'Closed');
        const monthlyData = {};
        
        // Initialize last 7 months
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const key = d.toLocaleString('default', { month: 'short' });
          monthlyData[key] = 0;
        }

        closedLeads.forEach(lead => {
          const d = new Date(lead.createdAt);
          const key = d.toLocaleString('default', { month: 'short' });
          if (monthlyData.hasOwnProperty(key)) {
            monthlyData[key] += (lead.value || 0);
          }
        });

        const chartData = Object.entries(monthlyData).map(([name, value]) => ({ name, value }));
        setRevenueData(chartData);

        // 2. Calculate Stats
        const totalClosedValue = closedLeads.reduce((sum, l) => sum + (l.value || 0), 0);
        const avgValue = closedLeads.length > 0 ? Math.round(totalClosedValue / closedLeads.length) : 0;
        const convRate = allLeads.length > 0 ? ((closedLeads.length / allLeads.length) * 100).toFixed(1) : 0;

        setStats({
          avgDealValue: avgValue.toLocaleString(),
          conversionRate: convRate,
          activeGoals: `${closedLeads.length}/10`,
          totalRevenue: totalClosedValue.toLocaleString()
        });

      } catch (err) {
        console.error('Failed to fetch reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  // Find max value for chart scaling
  const maxRevenue = Math.max(...revenueData.map(d => d.value), 1);

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Analytics & Reports</h1>
        <p className="text-slate-500 mt-2">Track your CRM performance and lead conversion metrics.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="animate-spin text-primary-600 mb-4" />
          <p className="text-slate-500 font-medium">Generating real-time reports...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue Growth Chart */}
            <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Revenue Growth</h3>
                  <p className="text-xs text-slate-500 mt-1">Total revenue from closed deals over time</p>
                </div>
                <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <span className="text-xs font-bold text-slate-600">Monthly View</span>
                  <Calendar size={14} className="text-slate-400" />
                </div>
              </div>
              
              <div className="h-64 flex items-end justify-between space-x-4">
                {revenueData.map((data, i) => {
                  const height = (data.value / maxRevenue) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group">
                      <div className="relative w-full flex justify-center">
                        {/* Tooltip */}
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg pointer-events-none z-10">
                          ${data.value.toLocaleString()}
                        </div>
                        <div 
                          className="w-full bg-primary-500 rounded-t-lg transition-all hover:bg-primary-600 cursor-pointer shadow-sm group-hover:shadow-primary-200" 
                          style={{ height: `${Math.max(height, 5)}%`, minHeight: '8px' }}
                        ></div>
                      </div>
                      <span className="mt-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{data.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lead Sources (Real data would need a 'source' field in Lead model, for now keeping as static but improved) */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Lead Distribution</h3>
              <div className="space-y-6">
                {[
                  { label: 'Closed Deals', count: leads.filter(l => l.status === 'Closed').length, color: 'bg-emerald-500' },
                  { label: 'Active Pipeline', count: leads.filter(l => !['Closed', 'Lost'].includes(l.status)).length, color: 'bg-primary-500' },
                  { label: 'Lost Leads', count: leads.filter(l => l.status === 'Lost').length, color: 'bg-rose-500' },
                  { label: 'Untouched', count: leads.filter(l => l.status === 'New').length, color: 'bg-slate-300' },
                ].map((source, i) => {
                  const percentage = leads.length > 0 ? Math.round((source.count / leads.length) * 100) : 0;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm font-bold mb-2">
                        <span className="text-slate-600">{source.label}</span>
                        <span className="text-slate-900">{percentage}%</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${source.color} transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-8 p-4 bg-primary-50 rounded-xl border border-primary-100">
                <p className="text-xs font-bold text-primary-700">Insights</p>
                <p className="text-[11px] text-primary-600 mt-1 leading-relaxed">
                  Your conversion rate is currently <span className="font-extrabold">{stats.conversionRate}%</span>. 
                  Try engaging 'Untouched' leads to increase pipeline volume.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Avg. Deal Value', value: `$${stats.avgDealValue}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { title: 'Conversion Rate', value: `${stats.conversionRate}%`, icon: PieChart, color: 'text-blue-600', bg: 'bg-blue-50' },
              { title: 'Total Revenue', value: `$${stats.totalRevenue}`, icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50' },
              { title: 'Monthly Goal', value: stats.activeGoals, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 group hover:border-primary-200 transition-colors">
                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <stat.icon size={22} />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.title}</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
};

export default ReportsPage;
