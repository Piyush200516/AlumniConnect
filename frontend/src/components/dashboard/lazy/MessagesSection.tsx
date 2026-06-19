import { useState, useEffect, useRef, useMemo, memo } from 'react';
import { 
  Send, 
  Search, 
  CheckCheck, 
  Paperclip, 
  Smile, 
  FileText, 
  Image as ImageIcon, 
  Loader2, 
  Download, 
  MessageSquare, 
  X
} from 'lucide-react';
import { useSocket } from '../../layout/SocketProvider';
import { useAuthContext } from '../../layout/AuthProvider';
import api from '../../../services/api';
import { toastSuccess, toastError } from '../../../utils/toast';

interface LastMessage {
  id: string;
  message: string;
  senderId: string;
  createdAt: string;
  fileUrl: string | null;
  fileType: string | null;
  isRead: boolean;
  isSystem: boolean;
  isResumeReview: boolean;
}

interface Conversation {
  id: string;
  connectionId: string;
  partnerId: string;
  partnerName: string;
  partnerImage: string | null;
  company: string | null;
  designation: string | null;
  resumeUrl: string | null;
  lastMessage: LastMessage | null;
  unreadCount: number;
}

interface MessageSender {
  id: string;
  email: string;
  studentProfile?: { fullName: string; profileImage: string | null } | null;
  alumniProfile?: { fullName: string; profileImageUrl: string | null } | null;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  message: string;
  fileUrl: string | null;
  fileType: string | null;
  isRead: boolean;
  isSystem: boolean;
  isResumeReview: boolean;
  createdAt: string;
  sender: MessageSender;
}

const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️',
  '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓',
  '🤗', '🤔', '🫣', '🤭', '🤫', '🤥', '😶', '😶‍🌫️', '😐', '😑', '😬', '🫨', '🫠', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱',
  '😴', '🤤', '😪', '😮‍💨', '😵', '😵‍💫', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺',
  '👋', '👍', '👎', '👏', '🙌', '🙏', '❤️', '🔥', '✨', '🎉', '💡', '🚀', '🎯', '💯', '📝', '📄', '💻', '💼', '🎓', '🤝'
];

interface MessagesSectionProps {
  preselectedPartnerId?: string | null;
  clearPreselected?: () => void;
}

const MessagesSection = memo(function MessagesSection({ preselectedPartnerId, clearPreselected }: MessagesSectionProps) {
  const { user, profile } = useAuthContext();
  const { socket, isOnline } = useSocket();

  // Decode user ID from token
  const currentUserId = useMemo(() => {
    if (!user?.token) return '';
    try {
      const decoded = JSON.parse(atob(user.token.split('.')[1]));
      return decoded.userId || decoded.id || '';
    } catch (e) {
      return '';
    }
  }, [user]);

  const isStudent = user?.role === 'student';

  // State managers
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Sockets & UI states
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Attachments
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    url: string;
    name: string;
    type: string;
    size: number;
  } | null>(null);

  // Resume Review Modals
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackTargetMessage, setFeedbackTargetMessage] = useState<Message | null>(null);

  // Refs for auto scroll and socket state alignment
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeChatRef = useRef<Conversation | null>(null);
  const typingTimeoutRef = useRef<any | null>(null);

  // Keep ref updated to access latest activeChat in event listeners
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  // 1. Fetch Conversations on Mount
  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const res = await api.get('/messages');
        const convList: Conversation[] = res.data.data || [];
        setConversations(convList);

        // Handle pre-selected partner redirection
        if (preselectedPartnerId && convList.length > 0) {
          const preselected = convList.find(c => c.partnerId === preselectedPartnerId);
          if (preselected) {
            setActiveChat(preselected);
          } else {
            toastError('Active mentorship connection with this user was not found');
          }
          if (clearPreselected) clearPreselected();
        }
      } catch (err) {
        console.error(err);
        toastError('Failed to fetch conversation list');
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [preselectedPartnerId, clearPreselected]);

  // 2. Load Messages when Active Chat changes
  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setMessagesLoading(true);
      setPartnerTyping(false);
      try {
        const res = await api.get(`/messages/${activeChat.connectionId || activeChat.id}`);
        setMessages(res.data.data || []);
        
        // Mark as read in API
        await api.patch(`/messages/${activeChat.id}/read`);
        
        // Notify partner via socket
        if (socket) {
          socket.emit('messages_read', { roomId: activeChat.id, userId: currentUserId });
        }

        // Update local sidebar unread count
        setConversations(prev => prev.map(c => c.id === activeChat.id ? { ...c, unreadCount: 0 } : c));
      } catch (err) {
        console.error(err);
        toastError('Failed to load message history');
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchMessages();

    // Join Socket Room
    if (socket) {
      socket.emit('join_room', activeChat.id);
    }

    return () => {
      if (socket && activeChat) {
        socket.emit('leave_room', activeChat.id);
      }
    };
  }, [activeChat, socket, currentUserId]);

  // 3. Setup Socket.io Listeners
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message: Message) => {
      const active = activeChatRef.current;
      
      // If message is for the active room
      if (active && message.conversationId === active.id) {
        setMessages(prev => [...prev, message]);
        
        // If message is from partner, mark as read
        if (message.senderId !== currentUserId) {
          api.patch(`/messages/${active.id}/read`).catch(console.error);
          socket.emit('messages_read', { roomId: active.id, userId: currentUserId });
        }

        // Update sidebar list: set last message & unread count is 0
        setConversations(prev => {
          const list = prev.map(c => {
            if (c.id === active.id) {
              return { ...c, lastMessage: message, unreadCount: 0 };
            }
            return c;
          });
          // Move active to top
          return [...list].sort((a, b) => {
            const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
            const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
            return timeB - timeA;
          });
        });
      } else {
        // Message is for another room: increment unreadCount
        setConversations(prev => {
          const list = prev.map(c => {
            if (c.id === message.conversationId) {
              return { 
                ...c, 
                lastMessage: message, 
                unreadCount: message.senderId === currentUserId ? c.unreadCount : c.unreadCount + 1 
              };
            }
            return c;
          });
          // Re-sort list
          return [...list].sort((a, b) => {
            const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
            const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
            return timeB - timeA;
          });
        });
      }
    };

    const handleMessagesRead = ({ roomId, userId }: { roomId: string; userId: string }) => {
      const active = activeChatRef.current;
      if (active && roomId === active.id && userId !== currentUserId) {
        // Set all messages sent by current user to read
        setMessages(prev => prev.map(msg => msg.senderId === currentUserId ? { ...msg, isRead: true } : msg));
      }
    };

    const handleTypingStart = ({ roomId, userId }: { roomId: string; userId: string }) => {
      const active = activeChatRef.current;
      if (active && roomId === active.id && userId !== currentUserId) {
        setPartnerTyping(true);
      }
    };

    const handleTypingStop = ({ roomId, userId }: { roomId: string; userId: string }) => {
      const active = activeChatRef.current;
      if (active && roomId === active.id && userId !== currentUserId) {
        setPartnerTyping(false);
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('messages_read', handleMessagesRead);
    socket.on('typing_start', handleTypingStart);
    socket.on('typing_stop', handleTypingStop);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('messages_read', handleMessagesRead);
      socket.off('typing_start', handleTypingStart);
      socket.off('typing_stop', handleTypingStop);
    };
  }, [socket, currentUserId]);

  // 4. Scroll to Bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerTyping]);

  // 5. Typing status trigger
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
    if (!socket || !activeChat) return;

    socket.emit('typing_start', { roomId: activeChat.id, userId: currentUserId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { roomId: activeChat.id, userId: currentUserId });
    }, 2000);
  };

  // 6. Send Text or Attachment Message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChat) return;
    if (!messageText.trim() && !selectedFile) return;

    try {
      const payload: any = {
        conversationId: activeChat.id,
        message: messageText.trim() || `Sent attachment: ${selectedFile?.name}`
      };

      if (selectedFile) {
        payload.fileUrl = selectedFile.url;
        payload.fileType = selectedFile.type;
      }

      const res = await api.post('/messages/send', payload);
      const sentMessage: Message = res.data.data;

      // Update local state directly
      setMessages(prev => [...prev, sentMessage]);
      setMessageText('');
      setSelectedFile(null);
      setShowEmojiPicker(false);

      // Reset typing status
      if (socket) {
        socket.emit('typing_stop', { roomId: activeChat.id, userId: currentUserId });
      }

      // Update sidebar list
      setConversations(prev => {
        const list = prev.map(c => c.id === activeChat.id ? { ...c, lastMessage: sentMessage } : c);
        return [...list].sort((a, b) => {
          const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
          const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
          return timeB - timeA;
        });
      });

    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to send message');
    }
  };

  // 7. File Selection & Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const fileData = res.data.data;
      setSelectedFile({
        url: fileData.fileUrl,
        name: fileData.fileName,
        type: fileData.fileType,
        size: fileData.fileSize
      });
      toastSuccess('File uploaded successfully! Press send to share.');
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to upload attachment');
    } finally {
      setUploadingFile(false);
    }
  };

  // 8. Trigger Resume Review (Student action)
  const handleRequestResumeReview = async () => {
    if (!activeChat) return;

    const resumeUrl = profile?.resumeUrl;
    if (!resumeUrl) {
      toastError('Please upload a resume in your profile settings first.');
      return;
    }

    try {
      const payload = {
        conversationId: activeChat.id,
        message: 'Requested a Resume Review 📄',
        fileUrl: resumeUrl,
        fileType: 'application/pdf',
        isResumeReview: true
      };

      const res = await api.post('/messages/send', payload);
      const sentMessage: Message = res.data.data;

      setMessages(prev => [...prev, sentMessage]);
      toastSuccess('Resume review request posted successfully!');

      setConversations(prev => {
        const list = prev.map(c => c.id === activeChat.id ? { ...c, lastMessage: sentMessage } : c);
        return [...list].sort((a, b) => {
          const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
          const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
          return timeB - timeA;
        });
      });
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to request resume review');
    }
  };

  // 9. Submit Resume Review Feedback (Alumni action)
  const handleSendFeedback = async () => {
    if (!activeChat || !feedbackText.trim() || !feedbackTargetMessage) return;

    try {
      const payload = {
        conversationId: activeChat.id,
        message: `📝 Resume Feedback:\n\n${feedbackText.trim()}`
      };

      const res = await api.post('/messages/send', payload);
      const sentMessage: Message = res.data.data;

      setMessages(prev => [...prev, sentMessage]);
      setShowFeedbackModal(false);
      setFeedbackText('');
      setFeedbackTargetMessage(null);
      toastSuccess('Feedback sent successfully!');

      setConversations(prev => {
        const list = prev.map(c => c.id === activeChat.id ? { ...c, lastMessage: sentMessage } : c);
        return [...list].sort((a, b) => {
          const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
          const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
          return timeB - timeA;
        });
      });
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to send feedback');
    }
  };

  // Emoji selection helper
  const handleEmojiClick = (emoji: string) => {
    setMessageText(prev => prev + emoji);
  };

  // Filter conversations locally by search query
  const filteredConversations = useMemo(() => {
    return conversations.filter(c => 
      c.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.designation?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  return (
    <div className="rounded-3xl border border-slate-900 bg-slate-950/20 backdrop-blur-xl h-[650px] flex overflow-hidden shadow-2xl relative">
      
      {/* SIDEBAR: ACTIVE CONVERSATIONS */}
      <div className="w-80 border-r border-slate-900 flex flex-col bg-slate-950/40 shrink-0">
        
        {/* Search header */}
        <div className="p-4 border-b border-slate-900 space-y-3 shrink-0">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Mentorship Chats</h3>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
            <input
              type="text"
              placeholder="Search mentors or mentees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900/60 border border-slate-850 rounded-xl text-xs placeholder-slate-700 text-slate-200 focus:outline-none focus:border-blue-500/50"
            />
          </div>
        </div>

        {/* List of active rooms */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              <p className="text-[10px] text-slate-500">Loading connections...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs italic">
              No mentorship sessions active.
            </div>
          ) : (
            filteredConversations.map(conv => {
              const active = activeChat?.id === conv.id;
              const online = isOnline(conv.partnerId);
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveChat(conv)}
                  className={`w-full text-left p-3 rounded-2xl flex gap-3 items-center border transition-all duration-300 cursor-pointer ${
                    active
                      ? 'bg-blue-600/10 border-blue-500/25 text-white'
                      : 'bg-transparent border-transparent hover:bg-slate-900/30 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="relative shrink-0">
                    {conv.partnerImage ? (
                      <img src={conv.partnerImage} alt="" className="h-10 w-10 rounded-xl object-cover border border-slate-800" loading="lazy" />
                    ) : (
                      <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-750 flex items-center justify-center font-bold text-xs text-slate-400">
                        {conv.partnerName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {online && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-xs font-bold text-slate-200 truncate">{conv.partnerName}</h4>
                      {conv.lastMessage && (
                        <span className="text-[9px] text-slate-550 font-bold shrink-0">
                          {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    {conv.designation && conv.company ? (
                      <p className="text-[9px] text-slate-500 mt-0.5 truncate">{conv.designation} at {conv.company}</p>
                    ) : (
                      <p className="text-[9px] text-slate-500 mt-0.5 truncate">Mentee Student</p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-1 truncate">
                      {conv.lastMessage ? conv.lastMessage.message : 'No messages yet'}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && !active && (
                    <span className="h-4.5 min-w-4.5 px-1 bg-blue-600 text-[9px] font-bold text-white rounded-full flex items-center justify-center shrink-0 border border-blue-500/20">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* MAIN CHAT LOG & WORKSPACE */}
      <div className="flex-1 flex flex-col bg-slate-950/10">
        
        {activeChat ? (
          <>
            {/* CHAT HEADER */}
            <div className="px-6 py-4 border-b border-slate-900 bg-slate-950/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {activeChat.partnerImage ? (
                    <img src={activeChat.partnerImage} alt="" className="h-10 w-10 rounded-xl object-cover border border-slate-800" loading="lazy" />
                  ) : (
                    <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-750 flex items-center justify-center font-bold text-xs text-slate-400">
                      {activeChat.partnerName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {isOnline(activeChat.partnerId) && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{activeChat.partnerName}</h4>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                    {activeChat.designation ? `${activeChat.designation} at ${activeChat.company}` : 'Mentee Student'}
                    {' • '}
                    {isOnline(activeChat.partnerId) ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>

              {/* Mentorship Specific action triggers */}
              {isStudent && (
                <button
                  onClick={handleRequestResumeReview}
                  className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/25 hover:border-transparent rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FileText className="h-3.5 w-3.5" /> Request Resume Review
                </button>
              )}
            </div>

            {/* CHAT BODY LOG */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {messagesLoading ? (
                <div className="flex h-full flex-col items-center justify-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  <p className="text-xs text-slate-500 font-medium">Opening session thread...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center p-8 text-center text-slate-500 text-xs max-w-md mx-auto">
                  <MessageSquare className="h-8 w-8 text-slate-800 mb-2" />
                  Start messaging to discuss internship referrals, mock interviews, and career guidance.
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.senderId === currentUserId;

                  // Render System Message announcements
                  if (msg.isRead && msg.isSystem) {
                    // fall back check or direct flag
                  }
                  if (msg.isSystem) {
                    return (
                      <div key={msg.id || idx} className="flex justify-center my-3">
                        <div className="px-4 py-1.5 rounded-full bg-slate-900/60 border border-slate-850/80 text-[10px] font-bold text-blue-400 tracking-normal text-center shadow">
                          {msg.message}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl p-3 text-xs leading-relaxed shadow-lg ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-slate-900/60 border border-slate-850 text-slate-200 rounded-tl-none'
                      }`}>
                        
                        {/* Sender Label */}
                        <p className="font-extrabold text-[9px] mb-1.5 opacity-60 uppercase tracking-wide">
                          {isMe ? 'You' : msg.sender.studentProfile?.fullName || msg.sender.alumniProfile?.fullName || 'Member'}
                        </p>

                        {/* Interactive Resume Review Card */}
                        {msg.isResumeReview ? (
                          <div className="p-3 bg-slate-950/60 border border-slate-850/70 rounded-xl space-y-3 my-1">
                            <div className="flex items-center gap-2 text-white">
                              <FileText className="h-5 w-5 text-blue-400 shrink-0" />
                              <div className="min-w-0">
                                <p className="font-bold text-xs truncate">Resume Review request</p>
                                <p className="text-[9px] text-slate-500 font-semibold">PDF File</p>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={() => msg.fileUrl && window.open(msg.fileUrl, '_blank')}
                                className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold transition-all hover:bg-blue-500 cursor-pointer flex items-center justify-center gap-1"
                              >
                                <Download className="h-3 w-3" /> Review Resume
                              </button>
                              
                              {!isStudent && (
                                <button
                                  onClick={() => {
                                    setFeedbackTargetMessage(msg);
                                    setShowFeedbackModal(true);
                                  }}
                                  className="flex-1 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold transition-all hover:bg-emerald-500 cursor-pointer flex items-center justify-center gap-1"
                                >
                                  <MessageSquare className="h-3 w-3" /> Send Feedback
                                </button>
                              )}
                            </div>
                          </div>
                        ) : null}

                        {/* File Attachment Details */}
                        {msg.fileUrl && !msg.isResumeReview ? (
                          <div className="p-2.5 bg-slate-950/40 border border-slate-850/80 rounded-xl flex items-center justify-between gap-4 my-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              {msg.fileType?.includes('image') ? (
                                <ImageIcon className="h-5 w-5 text-blue-400 shrink-0" />
                              ) : (
                                <FileText className="h-5 w-5 text-blue-400 shrink-0" />
                              )}
                              <span className="text-[10px] font-bold text-slate-350 truncate">
                                {msg.fileUrl.split('/').pop() || 'Attachment file'}
                              </span>
                            </div>
                            <button
                              onClick={() => msg.fileUrl && window.open(msg.fileUrl, '_blank')}
                              className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-450 hover:text-white cursor-pointer"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : null}

                        {/* Text Content */}
                        {!msg.isResumeReview && (
                          <p className="font-semibold whitespace-pre-wrap">{msg.message}</p>
                        )}

                        {/* Timestamp & Read receipt */}
                        <div className="flex justify-end items-center gap-1 mt-1 opacity-60 text-[9px] font-bold">
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && (
                            msg.isRead ? (
                              <CheckCheck className="h-3.5 w-3.5 text-blue-300" />
                            ) : (
                              <CheckCheck className="h-3.5 w-3.5 text-slate-400" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Live typing status indicators */}
              {partnerTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-900/40 border border-slate-850 text-slate-400 rounded-2xl rounded-tl-none p-3 text-[10px] font-bold tracking-wide flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span>{activeChat.partnerName} is typing...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* MESSAGE INPUT ACTIONS */}
            <div className="border-t border-slate-900 bg-slate-950/40 relative">
              
              {/* Attachment detail ribbon indicator */}
              {selectedFile && (
                <div className="absolute bottom-full left-0 right-0 p-3 bg-blue-950/50 border-t border-slate-900 flex items-center justify-between text-xs backdrop-blur-md">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-blue-400 shrink-0" />
                    <span className="font-bold text-slate-200 truncate">{selectedFile.name}</span>
                    <span className="text-[10px] text-slate-500 font-bold shrink-0">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <button 
                    onClick={() => setSelectedFile(null)} 
                    className="p-1 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Emoji Drawer Grid panel */}
              {showEmojiPicker && (
                <div className="absolute bottom-full right-4 mb-2 p-3 bg-slate-950 border border-slate-850 rounded-2xl shadow-2xl w-64 h-48 overflow-y-auto grid grid-cols-6 gap-2 custom-scrollbar z-20 backdrop-blur-xl">
                  {EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleEmojiClick(emoji)}
                      className="h-8 w-8 text-sm flex items-center justify-center hover:bg-slate-900 rounded-lg cursor-pointer transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={handleSend} className="p-4 flex gap-2 shrink-0 items-center">
                
                {/* File Upload Attachment Trigger */}
                <div className="relative shrink-0">
                  <input
                    type="file"
                    id="message-file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                    accept=".pdf,.png,.jpg,.jpeg,.docx"
                  />
                  <label
                    htmlFor="message-file-upload"
                    className={`h-10 w-10 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-850 text-slate-400 hover:text-white cursor-pointer hover:bg-slate-850 transition-colors shrink-0 ${
                      uploadingFile ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    {uploadingFile ? (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    ) : (
                      <Paperclip className="h-4 w-4" />
                    )}
                  </label>
                </div>

                {/* Text input */}
                <input
                  type="text"
                  placeholder="Type your message here..."
                  value={messageText}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-2.5 bg-slate-900/60 border border-slate-850 rounded-xl text-xs placeholder-slate-700 text-slate-200 focus:outline-none focus:border-blue-500/50 h-10 min-w-0"
                />

                {/* Emoji button */}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`h-10 w-10 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-850 text-slate-400 hover:text-white cursor-pointer hover:bg-slate-850 transition-colors shrink-0 ${
                    showEmojiPicker ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' : ''
                  }`}
                >
                  <Smile className="h-4 w-4" />
                </button>

                {/* Send Button */}
                <button
                  type="submit"
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/10 cursor-pointer shrink-0 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          /* EMPTY CHAT SCREEN */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950/5 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent pointer-events-none" />
            
            <div className="max-w-md space-y-4 p-8 rounded-3xl border border-slate-900 bg-slate-950/40 backdrop-blur-md shadow-xl relative">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-650 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/20">
                <MessageSquare className="h-7 w-7" />
              </div>
              <h3 className="text-base font-extrabold text-white uppercase tracking-wider">No Active Sessions</h3>
              <p className="text-slate-450 text-xs leading-relaxed">
                No active mentorship connections found. Connect with alumni and get your mentorship request accepted to start chatting.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* MENTOR RESUME FEEDBACK REVIEW DIALOG MODAL */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setShowFeedbackModal(false)}></div>
          <div className="relative w-full max-w-md rounded-3xl border border-slate-900 bg-slate-950 p-6 shadow-2xl text-slate-200 z-10 space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">Resume Feedback Review</h3>
                <p className="text-[10px] text-slate-500">Provide direct feedback regarding student's resume</p>
              </div>
              <button 
                onClick={() => setShowFeedbackModal(false)} 
                className="p-1 border border-slate-900 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Input area */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Your Career / Format Advice</label>
              <textarea
                rows={5}
                placeholder="Give constructive recommendations (e.g. emphasize metrics, improve format layout, add specific course achievements)..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-855 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed placeholder-slate-700"
              />
            </div>

            {/* Buttons footer */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-900">
              <button 
                type="button" 
                onClick={() => setShowFeedbackModal(false)} 
                className="px-4 py-2 border border-slate-850 hover:bg-slate-900 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleSendFeedback}
                disabled={!feedbackText.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/10 cursor-pointer transition-colors"
              >
                Submit Advice
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
});

export default MessagesSection;
