import React from 'react';
import { Mail, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';

const DummyEmails = () => {
  const emails = [
    {
      id: 1,
      subject: 'Initial Introduction - Enterprise Solution',
      sender: 'me@enterprise.com',
      recipient: 'prospect@client.com',
      date: '2024-04-20T10:30:00Z',
      type: 'sent',
      snippet: 'HelloWorld, I would like to introduce our new enterprise CRM solution...'
    },
    {
      id: 2,
      subject: 'Re: Initial Introduction - Enterprise Solution',
      sender: 'prospect@client.com',
      recipient: 'me@enterprise.com',
      date: '2024-04-20T14:15:00Z',
      type: 'received',
      snippet: 'Thanks for reaching out! We are interested in hearing more about...'
    },
    {
      id: 3,
      subject: 'Follow-up Call Scheduled',
      sender: 'me@enterprise.com',
      recipient: 'prospect@client.com',
      date: '2024-04-21T09:00:00Z',
      type: 'sent',
      snippet: 'Great to hear from you. I have scheduled a follow-up call for next Tuesday...'
    }
  ];

  return (
    <div className="space-y-4">
      {emails.map((email) => (
        <div key={email.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary-100 transition-all group">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${email.type === 'sent' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {email.type === 'sent' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{email.subject}</h4>
                <p className="text-[10px] text-slate-500 font-medium">
                  {email.type === 'sent' ? `To: ${email.recipient}` : `From: ${email.sender}`}
                </p>
              </div>
            </div>
            <div className="flex items-center text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-100">
              <Clock size={12} className="mr-1" />
              {new Date(email.date).toLocaleDateString()}
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed pl-11 italic">
            "{email.snippet}"
          </p>
        </div>
      ))}
      {emails.length === 0 && (
        <div className="text-center py-10 text-slate-400">
          <Mail size={32} className="mx-auto mb-2 opacity-20" />
          <p className="text-sm font-bold">No communication logs recorded yet.</p>
        </div>
      )}
    </div>
  );
};

export default DummyEmails;
