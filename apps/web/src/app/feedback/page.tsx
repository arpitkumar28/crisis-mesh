'use client';

import React from 'react';
import {
  Star, Users, CheckCircle2, ThumbsUp, ThumbsDown, AlertCircle, Activity, ClipboardList
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import {
  PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts';

const surveyStats = [
  { label: 'Total Surveys', value: '24', sub: 'Last 30 Days', icon: <ClipboardList size={20} /> },
  { label: 'Total Responses', value: '4,125', sub: '+18% vs last month', icon: <Users size={20} className="text-blue-500" /> },
  { label: 'Positive Feedback', value: '87%', sub: 'Citizen Satisfaction', icon: <CheckCircle2 size={20} className="text-green-500" /> },
  { label: 'Issues Reported', value: '312', sub: 'Require Attention', icon: <AlertCircle size={20} className="text-orange-500" /> },
  { label: 'Avg. Rating', value: '4.6/5', sub: 'Platform Quality', icon: <Star size={20} className="text-purple-500" /> },
];

const feedbackSummary = [
  { name: 'Very Satisfied', value: 65, color: '#10b981' },
  { name: 'Satisfied', value: 22, color: '#3b82f6' },
  { name: 'Neutral', value: 8, color: '#f59e0b' },
  { name: 'Unsatisfied', value: 5, color: '#ef4444' },
];

const topIssues = [
  { name: 'Water Supply', count: 124, trend: 'up' },
  { name: 'Sanitation', count: 86, trend: 'down' },
  { name: 'Medical Assistance', count: 42, trend: 'up' },
  { name: 'Road Connectivity', count: 35, trend: 'down' },
  { name: 'Communication', count: 25, trend: 'stable' },
];

const recentSurveys = [
  { title: 'Flood Response Survey', date: '25 Aug 2026', responses: 1240, status: 'Active' },
  { title: 'Shelter Quality Feedback', date: '24 Aug 2026', responses: 850, status: 'Active' },
  { title: 'SMS Alert Effectiveness', date: '22 Aug 2026', responses: 1560, status: 'Completed' },
  { title: 'Volunteer Training Review', date: '20 Aug 2026', responses: 420, status: 'Completed' },
];

export default function FeedbackSurveysPage() {
  return (
    <OperationsShell eyebrow="Collect and analyze feedback from citizens and responders" title="Feedback & Surveys">
      {/* Top Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        {surveyStats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
               <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">{stat.icon}</div>
            </div>
            <h4 className="text-3xl font-black text-[#0f172a]">{stat.value}</h4>
            <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-widest">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Recent Surveys Table */}
        <div className="col-span-12 lg:col-span-7">
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Recent Surveys</h3>
                 <button className="text-[10px] font-black text-blue-600 uppercase">View All Surveys</button>
              </div>
              <div className="flex-1 overflow-y-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-gray-50/50">
                          <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Survey Title</th>
                          <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Responses</th>
                          <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                          <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       {recentSurveys.map((s, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
                             <td className="px-8 py-5 text-sm font-black text-[#0f172a] uppercase group-hover:text-blue-600 transition-colors">{s.title}</td>
                             <td className="px-8 py-5 text-xs font-black text-[#0f172a]">{s.responses}</td>
                             <td className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase">{s.date}</td>
                             <td className="px-8 py-5 text-right">
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                                   s.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                                }`}>{s.status}</span>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Star size={16} className="text-yellow-500" />
                    <span className="text-[10px] font-black text-gray-400 uppercase">Global Satisfaction Score: 4.6/5</span>
                 </div>
                 <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Create New Survey</button>
              </div>
           </div>
        </div>

        {/* Feedback Summary Chart */}
        <div className="col-span-12 lg:col-span-5 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
              <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider mb-8">Feedback Summary</h3>
              <div className="h-[250px] relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                       <Pie data={feedbackSummary} innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">
                          {feedbackSummary.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                       </Pie>
                       <Tooltip />
                    </RePieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-[#0f172a]">4,125</span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Total Feedback</span>
                 </div>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                 {feedbackSummary.map(item => (
                    <div key={item.name} className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.name}</span>
                       </div>
                       <span className="text-xs font-black text-[#0f172a]">{item.value}%</span>
                    </div>
                 ))}
              </div>
           </div>

           {/* Top Issues Reported */}
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider">Top Issues Reported</h3>
                 <button className="text-[10px] font-black text-blue-600 uppercase">View All Issues</button>
              </div>
              <div className="space-y-4">
                 {topIssues.map(issue => (
                    <div key={issue.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                       <div>
                          <p className="text-xs font-black text-[#0f172a] uppercase">{issue.name}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{issue.count} Reports</p>
                       </div>
                       <div className={`flex items-center gap-1 ${
                          issue.trend === 'up' ? 'text-red-500' : issue.trend === 'down' ? 'text-green-500' : 'text-gray-400'
                       }`}>
                          {issue.trend === 'up' ? <ThumbsDown size={14} /> : issue.trend === 'down' ? <ThumbsUp size={14} /> : <Activity size={14} />}
                          <span className="text-[9px] font-black uppercase tracking-widest">{issue.trend}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Submit Feedback Mini Form */}
      <div className="mt-8 bg-[#0f172a] rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px]"></div>
         <div className="max-w-4xl mx-auto relative z-10">
            <div className="text-center mb-10">
               <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Submit Quick Feedback</h3>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Help us improve the CrisisMesh platform with your valuable input</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
               <div className="space-y-6">
                  <div>
                     <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Rating</label>
                     <div className="flex gap-4">
                        {[1, 2, 3, 4, 5].map(star => (
                           <button key={star} className="text-gray-700 hover:text-yellow-500 transition-colors">
                              <Star size={24} />
                           </button>
                        ))}
                     </div>
                  </div>
                  <div>
                     <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Category</label>
                     <select className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest focus:outline-none text-white">
                        <option>Platform Ease of Use</option>
                        <option>Alert Accuracy</option>
                        <option>Resource Response</option>
                        <option>General Feedback</option>
                     </select>
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Your Comments</label>
                  <textarea placeholder="Tell us about your experience..." className="w-full h-32 px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-white focus:outline-none"></textarea>
               </div>
            </div>
            
            <div className="flex justify-center">
               <button className="px-12 py-4 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all">
                  Submit Feedback
               </button>
            </div>
         </div>
      </div>
    </OperationsShell>
  );
}
