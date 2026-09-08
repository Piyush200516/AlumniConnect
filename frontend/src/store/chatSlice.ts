import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  message: string;
  fileUrl?: string | null;
  fileType?: string | null;
  isResumeReview?: boolean;
  isSystem?: boolean;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    email: string;
    studentProfile?: { fullName: string; profileImage?: string | null } | null;
    alumniProfile?: { fullName: string; profileImageUrl?: string | null } | null;
  };
}

export interface ConversationItem {
  id: string;
  connectionId: string;
  partnerId: string;
  partnerName: string;
  partnerImage?: string | null;
  company?: string | null;
  designation?: string | null;
  lastMessage?: {
    id: string;
    message: string;
    senderId: string;
    createdAt: string;
    isRead: boolean;
  } | null;
  unreadCount: number;
}

export interface ChatState {
  onlineUsers: Record<string, boolean>;
  conversations: ConversationItem[];
  activeConversationId: string | null;
  messages: Record<string, ChatMessage[]>;
  typingUsers: Record<string, boolean>; // conversationId -> isTyping
}

const initialState: ChatState = {
  onlineUsers: {},
  conversations: [],
  activeConversationId: null,
  messages: {},
  typingUsers: {},
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConversations: (state, action: PayloadAction<ConversationItem[]>) => {
      state.conversations = action.payload;
    },
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversationId = action.payload;
      if (action.payload) {
        // Reset unread count for active conversation
        const conv = state.conversations.find((c) => c.id === action.payload);
        if (conv) conv.unreadCount = 0;
      }
    },
    setMessages: (
      state,
      action: PayloadAction<{ conversationId: string; messages: ChatMessage[] }>
    ) => {
      const { conversationId, messages } = action.payload;
      state.messages[conversationId] = messages;
    },
    addIncomingMessage: (
      state,
      action: PayloadAction<{ conversationId: string; message: ChatMessage }>
    ) => {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      // Check duplicate
      const exists = state.messages[conversationId].some((m) => m.id === message.id);
      if (!exists) {
        state.messages[conversationId].push(message);
      }

      // Update conversation lastMessage & unreadCount
      const convIndex = state.conversations.findIndex((c) => c.id === conversationId);
      if (convIndex !== -1) {
        state.conversations[convIndex].lastMessage = {
          id: message.id,
          message: message.message,
          senderId: message.senderId,
          createdAt: message.createdAt,
          isRead: message.isRead,
        };
        if (state.activeConversationId !== conversationId) {
          state.conversations[convIndex].unreadCount += 1;
        }
      }
    },
    setUserOnline: (state, action: PayloadAction<string>) => {
      state.onlineUsers[action.payload] = true;
    },
    setUserOffline: (state, action: PayloadAction<string>) => {
      state.onlineUsers[action.payload] = false;
    },
    setInitialOnlineUsers: (state, action: PayloadAction<string[]>) => {
      const onlineMap: Record<string, boolean> = {};
      action.payload.forEach((id) => {
        onlineMap[id] = true;
      });
      state.onlineUsers = onlineMap;
    },
    setTypingStatus: (
      state,
      action: PayloadAction<{ conversationId: string; isTyping: boolean }>
    ) => {
      const { conversationId, isTyping } = action.payload;
      state.typingUsers[conversationId] = isTyping;
    },
    markConversationAsRead: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      const conv = state.conversations.find((c) => c.id === conversationId);
      if (conv) conv.unreadCount = 0;

      if (state.messages[conversationId]) {
        state.messages[conversationId] = state.messages[conversationId].map((m) => ({
          ...m,
          isRead: true,
        }));
      }
    },
  },
});

export const {
  setConversations,
  setActiveConversation,
  setMessages,
  addIncomingMessage,
  setUserOnline,
  setUserOffline,
  setInitialOnlineUsers,
  setTypingStatus,
  markConversationAsRead,
} = chatSlice.actions;

export default chatSlice.reducer;
