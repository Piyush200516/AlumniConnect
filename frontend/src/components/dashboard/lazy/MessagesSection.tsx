import { useState, memo } from 'react';
import { Send, Search, CheckCheck } from 'lucide-react';

const MessagesSection = memo(function MessagesSection() {
  const [activeChat, setActiveChat] = useState('1');
  const [messageText, setMessageText] = useState('');
  
  const channels = [
    {
      id: '1',
      name: 'Rahul Sharma',
      role: 'Alumni (Amazon)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      lastMessage: 'Let us meet this Saturday for mock interviews.',
      time: '10:45 AM',
      unread: 2,
      online: true
    },
    {
      id: '2',
      name: 'Ananya Verma',
      role: 'Alumni (Microsoft)',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      lastMessage: 'Awesome resume! I have shared it with HR.',
      time: 'Yesterday',
      unread: 0,
      online: false
    }
  ];

  const [chats, setChats] = useState<Record<string, { sender: string; text: string; time: string }[]>>({
    '1': [
      { sender: 'Rahul Sharma', text: 'Hey, I reviewed your DSA request.', time: '10:30 AM' },
      { sender: 'You', text: 'Thank you so much! When are you free?', time: '10:35 AM' },
      { sender: 'Rahul Sharma', text: 'Let us meet this Saturday for mock interviews.', time: '10:45 AM' },
    ],
    '2': [
      { sender: 'Ananya Verma', text: 'Hi Piyush, can you share your latest resume PDF?', time: 'Yesterday' },
      { sender: 'You', text: 'Sure, shared. Please let me know your feedback.', time: 'Yesterday' },
      { sender: 'Ananya Verma', text: 'Awesome resume! I have shared it with HR.', time: 'Yesterday' },
    ]
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setChats(prev => ({
      ...prev,
      [activeChat]: [
        ...prev[activeChat],
        { sender: 'You', text: messageText.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]
    }));
    setMessageText('');
  };

  const selectedChannel = channels.find(c => c.id === activeChat) || channels[0];

  return (
    <div className="rounded-3xl border border-slate-900 bg-slate-950/20 backdrop-blur-xl h-[600px] flex overflow-hidden shadow-2xl">
      {/* Sidebar List */}
      <div className="w-80 border-r border-slate-900 flex flex-col bg-slate-950/40 shrink-0">
        <div className="p-4 border-b border-slate-900 space-y-3 shrink-0">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Conversations</h3>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
            <input
              type="text"
              placeholder="Search chat rooms..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900/60 border border-slate-850 rounded-xl text-xs placeholder-slate-700 text-slate-200 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
          {channels.map(chan => (
            <button
              key={chan.id}
              onClick={() => setActiveChat(chan.id)}
              className={`w-full text-left p-3 rounded-2xl flex gap-3 items-center border transition-all duration-300 cursor-pointer ${
                activeChat === chan.id
                  ? 'bg-blue-600/10 border-blue-500/25 text-white'
                  : 'bg-transparent border-transparent hover:bg-slate-900/30 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative shrink-0">
                <img src={chan.avatar} alt="" className="h-10 w-10 rounded-xl object-cover" loading="lazy" />
                {chan.online && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h4 className="text-xs font-bold text-slate-200 truncate">{chan.name}</h4>
                  <span className="text-[10px] text-slate-500 font-semibold">{chan.time}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">{chan.role}</p>
                <p className="text-[11px] text-slate-400 mt-1 truncate">{chan.lastMessage}</p>
              </div>
              {chan.unread > 0 && activeChat !== chan.id && (
                <span className="h-4.5 min-w-4.5 px-1 bg-blue-600 text-[9px] font-bold text-white rounded-full flex items-center justify-center shrink-0 border border-blue-500/20">
                  {chan.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Panel */}
      <div className="flex-1 flex flex-col bg-slate-950/10">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-900 bg-slate-950/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img src={selectedChannel.avatar} alt="" className="h-10 w-10 rounded-xl object-cover shrink-0" loading="lazy" />
            <div>
              <h4 className="text-xs font-bold text-white">{selectedChannel.name}</h4>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{selectedChannel.role} • {selectedChannel.online ? 'Online' : 'Offline'}</p>
            </div>
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {chats[activeChat]?.map((chat, idx) => {
            const isMe = chat.sender === 'You';
            return (
              <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-2xl p-3 text-xs leading-relaxed ${
                  isMe
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-900/60 border border-slate-850 text-slate-200 rounded-tl-none'
                }`}>
                  <p className="font-semibold text-[10px] mb-1 opacity-70">{chat.sender}</p>
                  <p className="font-medium">{chat.text}</p>
                  <div className="flex justify-end items-center gap-1 mt-1 opacity-60 text-[9px]">
                    <span>{chat.time}</span>
                    {isMe && <CheckCheck className="h-3 w-3 text-blue-200" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-900 bg-slate-950/40 flex gap-2 shrink-0">
          <input
            type="text"
            placeholder="Type your message here..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-900/60 border border-slate-850 rounded-xl text-xs placeholder-slate-650 text-slate-250 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/10 cursor-pointer shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
});

export default MessagesSection;
