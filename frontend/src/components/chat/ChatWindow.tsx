import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Send,
  Search,
  CheckCheck,
  Paperclip,
  Circle,
  MessageSquare,
} from 'lucide-react';
import api from '../../services/api';
import { useAuthContext } from '../layout/AuthProvider';
import { useWebSocket } from '../../hooks/useWebSocket';
import type { RootState } from '../../store/store';
import {
  setConversations,
  setActiveConversation,
  setMessages,
  markConversationAsRead,
  type ChatMessage,
} from '../../store/chatSlice';

export const ChatWindow: React.FC = () => {
  const { user } = useAuthContext();
  const dispatch = useDispatch();
  const { isConnected, sendMessage, startTyping, stopTyping, markAsRead } = useWebSocket();

  const conversations = useSelector((state: RootState) => state.chat.conversations);
  const activeConversationId = useSelector((state: RootState) => state.chat.activeConversationId);
  const messagesMap = useSelector((state: RootState) => state.chat.messages);
  const onlineUsers = useSelector((state: RootState) => state.chat.onlineUsers);
  const typingUsers = useSelector((state: RootState) => state.chat.typingUsers);

  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const currentMessages: ChatMessage[] = activeConversationId
    ? messagesMap[activeConversationId] || []
    : [];

  // Fetch all user conversations on mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoadingConversations(true);
        const res = await api.get('/messages');
        const data = res.data?.data || res.data || [];
        dispatch(setConversations(data));
        if (data.length > 0 && !activeConversationId) {
          dispatch(setActiveConversation(data[0].id));
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        setIsLoadingConversations(false);
      }
    };
    fetchConversations();
  }, [dispatch]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId || !activeConversation) return;

    const fetchMessages = async () => {
      try {
        setIsLoadingMessages(true);
        const res = await api.get(`/messages/${activeConversation.connectionId || activeConversationId}`);
        const data = res.data?.data || res.data || [];
        dispatch(setMessages({ conversationId: activeConversationId, messages: data }));
        dispatch(markConversationAsRead(activeConversationId));
        markAsRead(activeConversationId, activeConversation.partnerId);
      } catch (err) {
        console.error('Failed to load message history:', err);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeConversationId, activeConversation, dispatch, markAsRead]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, typingUsers]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;

    const content = inputText.trim();
    setInputText('');

    // Trigger WebSocket send
    sendMessage({
      receiverId: activeConversation.partnerId,
      conversationId: activeConversation.id,
      content,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    stopTyping(activeConversation.partnerId, activeConversation.id);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!activeConversation) return;

    startTyping(activeConversation.partnerId, activeConversation.id);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(activeConversation.partnerId, activeConversation.id);
    }, 2000);
  };

  const filteredConversations = conversations.filter((c) =>
    c.partnerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-slate-950 text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* ─── LEFT SIDEBAR: CONVERSATION LIST ───────────────────────────── */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-800 bg-slate-900/60 backdrop-blur-md">
        {/* Header & Online Connection Status */}
        <div className="p-4 border-b border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              Messages
            </h2>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${
                isConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
            >
              <Circle
                className={`w-2 h-2 fill-current ${
                  isConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'
                }`}
              />
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Conversation Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
          {isLoadingConversations ? (
            <div className="p-8 text-center text-slate-500 text-sm">Loading conversations...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No active conversations found</div>
          ) : (
            filteredConversations.map((conv) => {
              const isPartnerOnline = !!onlineUsers[conv.partnerId];
              const isActive = conv.id === activeConversationId;

              return (
                <button
                  key={conv.id}
                  onClick={() => dispatch(setActiveConversation(conv.id))}
                  className={`w-full p-4 flex items-center gap-3 transition-colors text-left ${
                    isActive
                      ? 'bg-indigo-600/15 border-l-4 border-indigo-500'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  {/* Avatar + Green Dot */}
                  <div className="relative flex-shrink-0">
                    {conv.partnerImage ? (
                      <img
                        src={conv.partnerImage}
                        alt={conv.partnerName}
                        className="w-12 h-12 rounded-full object-cover border border-slate-700"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-300 font-semibold text-lg">
                        {conv.partnerName.charAt(0)}
                      </div>
                    )}

                    {/* Online Status Green Dot */}
                    <span
                      className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                        isPartnerOnline ? 'bg-emerald-500' : 'bg-slate-600'
                      }`}
                      title={isPartnerOnline ? 'Online' : 'Offline'}
                    />
                  </div>

                  {/* Info & Last Message */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-sm text-slate-100 truncate">
                        {conv.partnerName}
                      </h3>
                      {conv.lastMessage && (
                        <span className="text-[11px] text-slate-500">
                          {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <p className="truncate max-w-[180px]">
                        {conv.lastMessage ? conv.lastMessage.message : 'No messages yet'}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 bg-indigo-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ─── RIGHT SIDEBAR: ACTIVE CHAT THREAD ─────────────────────────── */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col bg-slate-950">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                {activeConversation.partnerImage ? (
                  <img
                    src={activeConversation.partnerImage}
                    alt={activeConversation.partnerName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-300 font-semibold">
                    {activeConversation.partnerName.charAt(0)}
                  </div>
                )}
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
                    onlineUsers[activeConversation.partnerId] ? 'bg-emerald-500' : 'bg-slate-600'
                  }`}
                />
              </div>

              <div>
                <h3 className="font-bold text-slate-100 flex items-center gap-2 text-base">
                  {activeConversation.partnerName}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      onlineUsers[activeConversation.partnerId] ? 'bg-emerald-400' : 'bg-slate-500'
                    }`}
                  />
                  {onlineUsers[activeConversation.partnerId] ? (
                    <span className="text-emerald-400 font-medium">Online</span>
                  ) : (
                    <span>Offline</span>
                  )}
                  {activeConversation.designation && (
                    <span className="text-slate-500">
                      • {activeConversation.designation} {activeConversation.company ? `@ ${activeConversation.company}` : ''}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {isLoadingMessages ? (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                Loading messages...
              </div>
            ) : currentMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm gap-2">
                <MessageSquare className="w-10 h-10 text-slate-700" />
                <p>No messages in this thread yet. Send a greeting to start chatting!</p>
              </div>
            ) : (
              currentMessages.map((msg) => {
                const isMe = msg.senderId === (user as any)?.id || msg.senderId === (user as any)?.userId;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-md ${
                        isMe
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-none'
                          : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>

                      {msg.fileUrl && (
                        <a
                          href={msg.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 text-xs underline text-indigo-200 hover:text-white"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          View Attachment
                        </a>
                      )}

                      <div
                        className={`flex items-center justify-end gap-1 mt-1.5 text-[10px] ${
                          isMe ? 'text-indigo-200/80' : 'text-slate-500'
                        }`}
                      >
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {isMe && (
                          <CheckCheck
                            className={`w-3.5 h-3.5 ${
                              msg.isRead ? 'text-emerald-300' : 'text-indigo-300/70'
                            }`}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Live Typing Indicator */}
            {typingUsers[activeConversation.id] && (
              <div className="flex items-center gap-2 text-slate-400 text-xs italic pl-2">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </span>
                {activeConversation.partnerName} is typing...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-slate-800 bg-slate-900/40 flex items-center gap-3"
          >
            <input
              type="text"
              placeholder="Type your message..."
              value={inputText}
              onChange={handleInputChange}
              className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm gap-3">
          <MessageSquare className="w-12 h-12 text-slate-700" />
          <p>Select a conversation from the left to start messaging.</p>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
